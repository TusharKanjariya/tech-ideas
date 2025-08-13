// scripts/index.js
import 'dotenv/config';
import { saveDigestMongo } from './save-mongo.js';
import { closeMongo } from '../lib/mongo.js';
import { buildDigest } from './build-digest.js';

try {
    const d = await buildDigest();
    if (process.env.MONGODB_URI) {
        await saveDigestMongo(d);
        console.log('Saved to MongoDB');
    }
    console.log(`Digest built: ${d.date} (ideas: ${d.ideas.length})`);
} finally {
    // ensure process exits cleanly in CLI
    if (process.env.MONGODB_URI) {
        await closeMongo();
    }
}
