// scripts/index.js
import 'dotenv/config';
import { closeMongo } from '@/lib/mongo.js';
import { saveDigest, saveDigestMongo } from './save-mongo';

try {
    const d = await buildDigest();
    await saveDigest(d);
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
