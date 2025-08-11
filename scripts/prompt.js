const OUTLINE = [
    'Hook & why this matters',
    'Tiny demo or repro',
    'Production caveats & perf notes',
    'DX: debugging and failure paths',
    'Security & auth implications',
    'SEO/Edge considerations (if web)',
    'Alternatives & trade-offs',
    'Takeaways & when NOT to use it',
];

export function toIdeas(item, score) {
    const title = (item.title || '').replace(/\s+/g, ' ').trim();
    const templates = [
        (t) => `Implement ${t} with a production-grade Next.js/Node stack`,
        (t) => `Does ${t} really improve developer experience? A measured take`,
        (t) => `Recreate ${t} step-by-step (Node.js + Next.js + Python helper)`,
    ];

    return templates.map((tpl, idx) => ({
        id: `${item.id}-${idx}`,
        headline: tpl(title),
        angle: `Inspired by: ${title}`,
        outline: OUTLINE,
        stackHints: ['Next.js API routes', 'Server Actions/RSC', 'Node fetch + ETag cache', 'Python helper for data prep'],
        seedUrl: item.url,
        score,
        source: item.source,
        publishedAt: item.publishedAt,
        tags: item.tags || [],
        // NEW: include scoring “points” breakdown for visibility
        points: item.points || undefined,
    }));
}
