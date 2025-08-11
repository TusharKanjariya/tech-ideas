"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tag from "../components/Tag";
import IdeaCard from "../components/IdeaCard";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function HomePage() {
  const [tab, setTab] = useState("trending"); // 'trending' | 'latest'
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [saved, setSaved] = useState({});

  // load/save local saved ids
  useEffect(() => {
    const raw = localStorage.getItem("saved-ideas");
    if (raw) setSaved(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("saved-ideas", JSON.stringify(saved));
  }, [saved]);

  const trendingUrl = tag
    ? `/api/ideas/trending?tag=${encodeURIComponent(tag)}`
    : `/api/ideas/trending`;

  const latestUrl = q
    ? `/api/ideas?q=${encodeURIComponent(q)}`
    : `/api/ideas`;

  const { data: trending, isLoading: loadingTrending } = useSWR(
    tab === "trending" ? trendingUrl : null,
    fetcher
  );
  const { data: latest, isLoading: loadingLatest } = useSWR(
    tab === "latest" ? latestUrl : null,
    fetcher
  );

  const ideas = tab === "trending" ? (trending?.ideas || []) : (latest?.ideas || []);
  const topTags = useMemo(() => {
    const counts = {};
    for (const i of ideas) for (const t of i.tags || []) counts[t] = (counts[t] || 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t);
  }, [ideas]);

  function toggleSave(idea) {
    setSaved((s) => ({ ...s, [idea.id]: !s[idea.id] }));
  }

  async function recommendTags(idea) {
    try {
      const r = await fetch(`/api/tags/recommend?ideaId=${encodeURIComponent(idea.id)}`);
      return await r.json();
    } catch (e) { return null; }
  }

  async function generateHeadlines(idea) {
    try {
      // try ideaId (Mongo-backed)
      const r = await fetch(`/api/headlines/generate?ideaId=${encodeURIComponent(idea.id)}`);
      if (r.ok) return await r.json();

      // fallback: text + tags (no DB needed)
      const tags = Array.from(new Set((idea.tags || []).map(t => String(t).toLowerCase()))).slice(0, 6);
      const r2 = await fetch(
        `/api/headlines/generate?text=${encodeURIComponent(idea.headline || idea.title || '')}&tags=${encodeURIComponent(tags.join(','))}&persist=false`
      );
      return await r2.json();
    } catch (e) {
      console.error('headline gen failed', e);
      return { error: String(e) };
    }
  }


  return (
    <div className="min-h-[80vh]">
      {/* Controls */}
      <div className="sticky top-[53px] z-40 bg-black/50 backdrop-blur border-b border-white/10">
        <div className="py-3 flex flex-col md:flex-row md:items-center gap-3">
          <div className="inline-flex items-center rounded-xl bg-white/10 border border-white/10 overflow-hidden">
            {["trending", "latest"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "px-4 py-2 text-sm",
                  tab === t ? "bg-white text-black" : "text-zinc-200 hover:bg-white/10"
                ].join(" ")}
              >
                {t === "trending" ? "Trending (boosted)" : "Latest"}
              </button>
            ))}
          </div>

          <div className="md:ml-auto flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tab === "latest" ? "Search title/tags…" : "Switch to Latest to search"}
              className="w-[260px] md:w-[360px] rounded-xl bg-white/5 px-4 py-2 outline-none ring-1 ring-white/10 focus:ring-white/30 disabled:opacity-60"
              disabled={tab !== "latest"}
            />
            <button
              onClick={() => { setQ(""); setTag(""); }}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tag filter pills */}
        <div className="pb-3 flex flex-wrap gap-2">
          <Tag active={tag === ""} onClick={() => setTag("")}>All</Tag>
          {topTags.map((t) => (
            <Tag key={t} active={tag === t} onClick={() => setTag(t)}>{t}</Tag>
          ))}
        </div>
      </div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {tab === "trending" ? (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loadingTrending ? (
              <div className="p-6 text-zinc-400">Loading trending…</div>
            ) : ideas.length === 0 ? (
              <div className="p-6 text-zinc-400">No ideas yet.</div>
            ) : (
              <ul className="list-none grid md:grid-cols-2 gap-6 mt-6">
                {ideas.map((i) => (
                  <IdeaCard
                    key={i.id}
                    idea={i}
                    saved={!!saved[i.id]}
                    onToggleSave={toggleSave}
                    onRecommendTags={recommendTags}
                    onGenerateHeadlines={generateHeadlines}
                  />
                ))}
              </ul>

            )}
          </motion.div>
        ) : (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loadingLatest ? (
              <div className="p-6 text-zinc-400">Loading latest…</div>
            ) : ideas.length === 0 ? (
              <div className="p-6 text-zinc-400">No ideas yet.</div>
            ) : (
              <ul className="grid md:grid-cols-2 gap-4 mt-6">
                {ideas.map((i) => (
                  <IdeaCard
                    key={i.id}
                    idea={i}
                    saved={!!saved[i.id]}
                    onToggleSave={toggleSave}
                    onRecommendTags={recommendTags}
                    onGenerateHeadlines={generateHeadlines}
                  />
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
