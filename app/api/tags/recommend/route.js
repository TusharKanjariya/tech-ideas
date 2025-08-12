import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo.js';
import { BROAD_FALLBACK, TAG_ALIAS } from '@/config/medium-tags.js';
import { computeTagMomentum } from '@/lib/momentum';

// Helper to normalize & map internal → Medium-friendly
function mapTag(t) {
    const k = String(t || '').toLowerCase();
    return TAG_ALIAS[k] || k.charAt(0).toUpperCase() + k.slice(1);
}

export async function GET(req) {
    const url = new URL(req.url);
    const ideaId = url.searchParams.get('ideaId');
    const days = Number(url.searchParams.get('days') || 7);

    if (!ideaId) {
        return NextResponse.json({ error: 'Missing ideaId' }, { status: 400 });
    }

    const db = await getDb();
    const idea = await db.collection('ideas').findOne({ id: ideaId });
    if (!idea) {
        return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    const mom = await computeTagMomentum(days);

    // Start with idea tags
    const candidates = new Set((idea.tags || []).map(t => String(t).toLowerCase()));

    // Heuristic: add inferred broad theme
    const txt = `${idea.headline} ${idea.angle}`.toLowerCase();
    if (txt.includes('next.js') || txt.includes('react') || txt.includes('javascript')) {
        BROAD_FALLBACK.js.forEach(t => candidates.add(t.toLowerCase()));
    } else if (txt.includes('python')) {
        BROAD_FALLBACK.py.forEach(t => candidates.add(t.toLowerCase()));
    } else {
        BROAD_FALLBACK.gen.forEach(t => candidates.add(t.toLowerCase()));
    }

    // Score candidates: relevance (present in idea.tags) + momentum (tag ratio)
    const inIdea = new Set((idea.tags || []).map(t => String(t).toLowerCase()));
    const scored = Array.from(candidates).map(tag => {
        const ratio = mom[tag]?.ratio ?? 1;
        const relevance = inIdea.has(tag) ? 1 : 0; // simple bump if directly in idea
        // Score: 0.7 relevance + 0.3 momentum (normalized around 1)
        const score = 0.7 * relevance + 0.3 * Math.min(2, Math.max(0.5, ratio));
        return { tag, ratio, relevance, score };
    });

    // Sort + pick best 5, ensure variety (no near-duplicates)
    scored.sort((a, b) => b.score - a.score);

    const picked = [];
    const seen = new Set();
    for (const s of scored) {
        const pretty = mapTag(s.tag);
        const key = pretty.toLowerCase();
        if (seen.has(key)) continue;
        picked.push({
            tag: pretty,
            why: `relevance ${s.relevance ? '✓' : '•'} · momentum ×${s.ratio.toFixed(2)}`
        });
        seen.add(key);
        if (picked.length >= 5) break;
    }

    return NextResponse.json({
        ideaId,
        recommended: picked,
        meta: { days, considered: scored.length }
    });
}
