// /lib/headlines.js
const MAX = 70;
const MIN = 34;
const STOPWORDS = /^(implement|recreate|does|from|how|build|building|create|creating|a|the|an)\s+/i;

function pickTopic(seed = "") {
    let t = String(seed).replace(/[–—]/g, "-").trim();
    t = t.replace(/^(implement|recreate|does|build|creating?|from)\s+/i, "");
    t = t.replace(/step[-\s]?by[-\s]?step/i, "");
    t = t.replace(/\s{2,}/g, " ");
    const parts = t.split(" ").filter(Boolean);
    if (parts.length > 8) t = parts.slice(0, 8).join(" ");
    return t.replace(/\s+[:\-–—]\s*$/, "");
}

function titleCase(s) {
    return s
        .split(" ")
        .map((w, i) =>
            i && /^(and|or|for|of|to|in|with|on|a|an|the)$/i.test(w)
                ? w.toLowerCase()
                : w[0]
                    ? w[0].toUpperCase() + w.slice(1)
                    : w
        )
        .join(" ");
}

function uniq(arr) {
    return Array.from(new Set(arr.map((s) => s.trim()))).filter(Boolean);
}

function templates(topic, stackTags) {
    const stack = stackTags?.length
        ? stackTags.slice(0, 2).map(titleCase).join(" & ")
        : "Next.js & Node";
    const base = [
        `${topic} in Production: Patterns, Pitfalls, Benchmarks`,
        `Build ${topic} with ${stack}: A Practical Guide`,
        `Stop Overengineering ${topic}: A Senior Dev’s Playbook`,
        `${topic}: What I’d Ship Today (No Fluff)`,
        `From Zero to ${topic}: ${stack} Edition`,
        `The Hard Parts of ${topic} (and How to Solve Them)`,
        `${topic} at Scale: Caching, Limits, and Failure Modes`,
        `I Rebuilt ${topic} the Way I Actually Ship It`,
        `${topic} with Real-Time & Caching (That Actually Works)`,
        `Production-Ready ${topic}: Checklists, Guardrails, Trade-offs`
    ];
    return uniq(base);
}

function scoreHeadline(h, tags = []) {
    const len = h.length;
    const lenScore = Math.max(
        0,
        1 - Math.abs((len - (MAX + MIN) / 2) / ((MAX - MIN) / 2))
    );
    const hasColon = h.includes(":") || h.includes("—") || h.includes("-") ? 0.1 : 0;
    const kw = tags.reduce(
        (s, t) => (h.toLowerCase().includes(String(t).toLowerCase()) ? s + 0.2 : s),
        0
    );
    const clarityPenalty = STOPWORDS.test(h) ? -0.2 : 0;
    return Number((0.6 * lenScore + kw + hasColon + clarityPenalty).toFixed(3));
}

export function generateHeadlines({ seed = "", tags = [] }) {
    const topic = titleCase(pickTopic(seed));
    const stackTags = tags
        .filter((t) =>
            ["nextjs", "react", "node", "python", "ai", "db"].includes(
                String(t).toLowerCase()
            )
        )
        .map(String);
    const raw = templates(topic, stackTags);
    const scored = raw
        .map((text) => ({
            text,
            score: scoreHeadline(text, tags),
            reason: explain(text, tags)
        }))
        .sort((a, b) => b.score - a.score);
    return scored.slice(0, 10);
}

function explain(h, tags) {
    const bits = [];
    const len = h.length;
    if (len >= MIN && len <= MAX) bits.push("✅ length");
    if (h.includes(":") || h.includes("—") || h.includes("-")) bits.push("✅ structure");
    const hits = tags.filter((t) =>
        h.toLowerCase().includes(String(t).toLowerCase())
    );
    if (hits.length) bits.push(`✅ keywords: ${hits.slice(0, 2).join(", ")}`);
    if (STOPWORDS.test(h)) bits.push("⚠ generic start");
    return bits.join(" · ");
}
