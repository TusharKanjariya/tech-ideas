import Parser from 'rss-parser';
import crypto from 'crypto';
import { FEEDS } from '../config/feeds.js';
import { inferTags } from './tagger.js';

const parser = new Parser();
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex');

export async function fetchAll() {
    const rs = [];

    for (const f of FEEDS) {
        if (f.source === 'hn') {
            const ids = await fetch(f.url).then(r => r.json());
            const top = ids.slice(0, 80);
            const items = await Promise.all(top.map(async id => {
                const it = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json());
                const autoTags = inferTags({ title: it.title || '', summary: '' });
                if (!it?.url) return null;
                return {
                    id: hash(it.url),
                    url: it.url,
                    title: it.title,
                    summary: '',
                    author: it.by,
                    source: 'hn',
                    publishedAt: new Date(it.time * 1000).toISOString(),
                    tags: autoTags,
                    extras: { points: it.score ?? 0, comments: it.descendants ?? 0 },
                };
            }));
            rs.push(...items.filter(Boolean));
        } else {
            const feed = await parser.parseURL(f.url);
            for (const i of feed.items) {
                const url = (i.link || '').trim();
                if (!url) continue;
                const autoTags = inferTags({ title: i.title || '', summary: i.contentSnippet || i.content || '' });
                rs.push({
                    id: hash(url),
                    url,
                    title: (i.title || '').trim(),
                    summary: (i.contentSnippet || i.content || '').toString().slice(0, 500),
                    author: i.creator || i.author || '',
                    source: f.source,
                    publishedAt: i.isoDate || i.pubDate ? new Date(i.isoDate ?? i.pubDate).toISOString() : new Date().toISOString(),
                    tags: [...(i.categories || []).map(c => c.toLowerCase()), ...autoTags],
                });
            }
        }
    }

    const seen = new Set();
    return rs.filter(x => (seen.has(x.id) ? false : (seen.add(x.id), true)));
}
