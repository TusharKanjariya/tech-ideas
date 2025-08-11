import { TAG_TRIGGERS } from '../config/topics.js';

const normalize = (s) => (s || '').toLowerCase();

export function inferTags({ title, summary }) {
    const txt = normalize(`${title} ${summary}`);
    const tags = [];
    for (const [tag, triggers] of Object.entries(TAG_TRIGGERS)) {
        if (triggers.some(k => txt.includes(k))) tags.push(tag);
    }
    // unique + limit to keep JSON light
    return Array.from(new Set(tags)).slice(0, 8);
}
