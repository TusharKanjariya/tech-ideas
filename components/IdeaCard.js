"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function IdeaCard({ idea, onRecommendTags, onGenerateHeadlines, saved, onToggleSave }) {
    const [open, setOpen] = useState(false);
    const [recs, setRecs] = useState(null);
    const [heads, setHeads] = useState(null);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [loadingHeads, setLoadingHeads] = useState(false);

    async function handleRecs() {
        setLoadingRecs(true);
        const r = await onRecommendTags(idea);
        setRecs(r || null);
        setLoadingRecs(false);
        setOpen(true);
    }

    async function handleHeads() {
        setLoadingHeads(true);
        const r = await onGenerateHeadlines(idea);
        setHeads(r || null);
        setLoadingHeads(false);
        setOpen(true);
    }

    return (
        <motion.li
            layout
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
        >
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onToggleSave(idea)}
                    className={[
                        "h-6 w-6 rounded-full border border-white/20 shrink-0",
                        saved ? "bg-white" : "bg-transparent"
                    ].join(" ")}
                    title={saved ? "Unsave" : "Save"}
                />
                <div className="flex-1">
                    <a href={idea.seedUrl || idea.url} target="_blank" className="text-base font-medium hover:underline">
                        {idea.headline || idea.title}
                    </a>
                    <div className="mt-1 text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                        <span>{idea.source}</span>
                        {idea.publishedAt ? <span>· {new Date(idea.publishedAt).toLocaleDateString()}</span> : null}
                        {typeof idea.finalScore === "number" ? <span>· score {idea.finalScore.toFixed(2)}</span> : null}
                        {idea.momentum?.avgRatio ? <span>· momentum ×{idea.momentum.avgRatio.toFixed(2)}</span> : null}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {Array.from(new Set((idea.tags || []).map(t => String(t).toLowerCase())))
                            .slice(0, 6)
                            .map(t => (
                                <span
                                    key={`${idea.id}-${t}`}               // unique per idea+tag
                                    className="text-xs rounded-full bg-white/10 px-2 py-1 border border-white/10"
                                >
                                    {t}
                                </span>
                            ))}
                    </div>

                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={handleRecs}
                            className="rounded-lg px-3 py-2 text-sm bg-white text-black hover:opacity-90"
                            disabled={loadingRecs}
                        >
                            {loadingRecs ? "Getting tags…" : "Recommend Medium tags"}
                        </button>
                        <button
                            onClick={handleHeads}
                            className="rounded-lg px-3 py-2 text-sm border border-white/20 hover:bg-white/10"
                            disabled={loadingHeads}
                        >
                            {loadingHeads ? "Generating…" : "Headline ideas"}
                        </button>
                    </div>

                    <AnimatePresence>
                        {open && (recs || heads) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-4"
                            >
                                {recs ? (
                                    <div className="mb-4">
                                        <div className="text-xs uppercase text-zinc-400 mb-2">Suggested tags</div>
                                        <div className="flex flex-wrap gap-2">
                                            {recs.recommended?.map((r, idx) => (
                                                <span key={idx} className="text-xs rounded-full bg-white text-black px-2 py-1">
                                                    {r.tag}
                                                    <span className="ml-1 text-[10px] text-black/70">({r.why})</span>

                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {heads ? (
                                    <div>
                                        <div className="text-xs uppercase text-zinc-400 mb-2">Headline variations</div>
                                        <ul className="space-y-2">
                                            {heads.variants?.map((h, idx) => (
                                                <li key={idx} className="text-sm leading-6">
                                                    • {h.text}
                                                    {typeof h.score === "number" ? (
                                                        <span className="ml-2 text-xs text-zinc-400">({h.score.toFixed(2)} {h.reason ? `· ${h.reason}` : ""})</span>
                                                    ) : null}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                                {heads?.error ? (
                                    <div className="mt-3 text-sm text-red-400">Headline generator error: {heads.error}</div>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.li>
    );
}
