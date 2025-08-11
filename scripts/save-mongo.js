// scripts/save-mongo.js
import fs from 'fs/promises';
import path from 'path';
import { getDb } from '../lib/mongo.js';

// remove undefined/NaN/Infinity recursively
function clean(value) {
    if (Array.isArray(value)) {
        return value.map(clean).filter(v => v !== undefined);
    }
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            const cv = clean(v);
            if (cv !== undefined) out[k] = cv;
        }
        return out;
    }
    if (typeof value === 'number' && !Number.isFinite(value)) return undefined;
    if (typeof value === 'undefined') return undefined;
    if (typeof value === 'function') return undefined;
    return value;
}

export async function saveDigest(d) {
    const dir = path.join(process.cwd(), 'public', 'digests');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'latest.json'), JSON.stringify(d, null, 2));
    await fs.writeFile(path.join(dir, `${d.date}.json`), JSON.stringify(d, null, 2));
}

export async function saveDigestMongo(d) {
    const db = await getDb();
    const digests = db.collection('digests');
    const ideas = db.collection('ideas');

    // upsert the whole daily snapshot
    await digests.updateOne(
        { date: d.date },
        { $set: clean(d) },
        { upsert: true }
    );

    // prepare valid bulk ops
    const rawIdeas = Array.isArray(d.ideas) ? d.ideas : [];
    const valid = rawIdeas
        .filter(i => i && typeof i.id === 'string' && i.id.trim() !== '')
        .map(i => clean({ ...i, date: d.date })); // ensure date present & clean

    const ops = valid.map(doc => ({
        updateOne: {
            filter: { id: doc.id },
            update: { $set: doc, $setOnInsert: { firstSeen: d.date } },
            upsert: true
        }
    }));

    // debug guard: find the first invalid op if any
    const bad = ops.find(
        op =>
            !op ||
            !op.updateOne ||
            !op.updateOne.filter ||
            !op.updateOne.update ||
            typeof op.updateOne.filter.id !== 'string'
    );
    if (bad) {
        console.error('Invalid bulk op example:', JSON.stringify(bad, null, 2));
        console.error('Sample idea that produced it:', JSON.stringify(valid[ops.indexOf(bad)], null, 2));
        throw new Error('Aborting: found invalid bulkWrite operation (see logs).');
    }

    if (ops.length) {
        await ideas.bulkWrite(ops, { ordered: false });
    }
}
