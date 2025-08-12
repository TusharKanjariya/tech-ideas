import { TAG_WEIGHTS } from '@/config/topics.js';
import { KEYWORD_WEIGHTS, SOURCE_WEIGHTS } from '../config/keywords.js';


const HOURS = 3600_000;

function recencyBoost(publishedAt) {
    const ageH = (Date.now() - new Date(publishedAt).getTime()) / HOURS;
    if (ageH <= 6) return 1.3;
    if (ageH <= 24) return 1.15;
    if (ageH <= 72) return 1.05;
    return 1.0;
}

function keywordScore(title, summary) {
    const text = `${title} ${summary || ''}`.toLowerCase();
    let s = 0, hits = [];
    for (const [kw, w] of Object.entries(KEYWORD_WEIGHTS)) {
        if (text.includes(kw)) { s += w; hits.push([kw, w]); }
    }
    return { score: s, hits };
}

function tagScore(tags = []) {
    let s = 0, hits = [];
    for (const t of tags) {
        const w = TAG_WEIGHTS[t] || 0;
        if (w > 0) { s += w; hits.push([t, w]); }
    }
    return { score: s, hits };
}

function engagementScore(x) {
    if (x.source === 'hn') {
        const pts = x.extras?.points ?? 0;
        return { score: Math.min(pts / 100, 2.0), raw: pts };
    }
    return { score: 0, raw: 0 };
}

export function scoreItem(x) {
    const sourceWeight = SOURCE_WEIGHTS[x.source] ?? 1.0;
    const rec = recencyBoost(x.publishedAt);
    const kw = keywordScore(x.title, x.summary);
    const tg = tagScore(x.tags);
    const eng = engagementScore(x);

    const base = 1.0;
    const total = (base + kw.score + tg.score + eng.score) * sourceWeight * rec;

    // NEW: detailed points (for transparency)
    return {
        total,
        breakdown: {
            base,
            keywords: kw,
            tags: tg,
            engagement: eng,
            sourceWeight,
            recencyMultiplier: rec,
        }
    };
}
