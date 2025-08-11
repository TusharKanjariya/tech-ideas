import { fetchAll } from './fetch-feeds.js';
import { scoreItem } from './score.js';
import { toIdeas } from './prompt.js';

const IST = 5.5 * 3600_000;
const todayIST = () => new Date(Date.now() + IST).toISOString().slice(0, 10);

export async function buildDigest() {
    const raw = await fetchAll();
    const scored = raw
        .map(r => {
            const s = scoreItem(r);
            return { r, score: s.total, points: s.breakdown };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 25);

    const ideas = scored.flatMap(({ r, score, points }) =>
        toIdeas({ ...r, points }, score)
    )
        .sort((a, b) => b.score - a.score)
        .slice(0, 30);

    return {
        date: todayIST(),
        generatedAt: new Date().toISOString(),
        ideas,
        stats: {
            inputs: raw.length,
            outputs: ideas.length,
            sources: scored.reduce((acc, { r }) => ((acc[r.source] = (acc[r.source] || 0) + 1), acc), {})
        }
    };
}
