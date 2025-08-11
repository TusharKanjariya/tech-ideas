import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongo.js';
import { computeTagMomentum } from '../../../../lib/momentum.js';

export async function GET(req) {
    const url = new URL(req.url);
    const days = Number(url.searchParams.get('days') || 7);
    const limit = Number(url.searchParams.get('limit') || 50);
    const tagFilter = (url.searchParams.get('tag') || '').toLowerCase();

    const db = await getDb();

    // 1) latest digest
    const latest = await db.collection('digests')
        .find({})
        .sort({ date: -1 })
        .limit(1)
        .next();

    if (!latest) return NextResponse.json({ date: null, ideas: [] });

    // 2) momentum per tag
    const mom = await computeTagMomentum(days);

    // 3) score each idea with momentum booster
    const ideas = (latest.ideas || [])
        .filter(i => !tagFilter || (i.tags || []).map(t => t.toLowerCase()).includes(tagFilter))
        .map(i => {
            const tags = (i.tags || []).map(t => String(t).toLowerCase());
            const tagRatios = tags.length ? tags.map(t => (mom[t]?.ratio ?? 1)) : [1];
            const avgRatio = tagRatios.reduce((a, b) => a + b, 0) / tagRatios.length;
            const booster = Math.min(1.4, 0.8 + 0.2 * avgRatio); // cap boost
            const finalScore = (i.score || 1) * booster;

            return {
                ...i,
                momentum: {
                    avgRatio: Number(avgRatio.toFixed(3)),
                    booster: Number(booster.toFixed(3)),
                    perTag: Object.fromEntries(tags.map(t => [t, mom[t] || { ratio: 1, today: 0, prevAvg: 0, boost: 1 }]))
                },
                finalScore
            };
        })
        .sort((a, b) => (b.finalScore - a.finalScore))
        .slice(0, limit);

    return NextResponse.json({
        date: latest.date,
        count: ideas.length,
        ideas
    });
}
