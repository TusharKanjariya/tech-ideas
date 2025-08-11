import { getDb } from './mongo.js';

// Compute per-tag momentum from the last N digests.
// Momentum = (count_today + 0.5) / (avg_prev + 0.5)
// >1.0 means rising; <1.0 means cooling.
export async function computeTagMomentum(days = 7) {
    const db = await getDb();

    // Pull last N days of digests (most recent first)
    const digests = await db.collection('digests')
        .find({})
        .sort({ date: -1 })
        .limit(days)
        .toArray();

    if (!digests.length) return {};

    // Count tags per day
    const daily = []; // [{date, counts: {tag: n}}]
    for (const d of digests) {
        const counts = {};
        for (const idea of d.ideas || []) {
            for (const t of (idea.tags || [])) {
                const tag = String(t).toLowerCase();
                counts[tag] = (counts[tag] || 0) + 1;
            }
        }
        daily.push({ date: d.date, counts });
    }

    const [today, ...prev] = daily;
    const momentum = {};
    const allTags = new Set([
        ...Object.keys(today.counts),
        ...prev.flatMap(p => Object.keys(p.counts))
    ]);

    for (const tag of allTags) {
        const cToday = today.counts[tag] || 0;
        const avgPrev = prev.length
            ? prev.reduce((s, p) => s + (p.counts[tag] || 0), 0) / prev.length
            : 0;

        const ratio = (cToday + 0.5) / (avgPrev + 0.5); // smooth
        momentum[tag] = {
            today: cToday,
            prevAvg: avgPrev,
            ratio,                 // >1 rising
            boost: Math.min(1.4, 0.8 + 0.2 * ratio) // 0.8..1.4 multiplier suggestion
        };
    }

    return momentum; // { tag: {today, prevAvg, ratio, boost} }
}
