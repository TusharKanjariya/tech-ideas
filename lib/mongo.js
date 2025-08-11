// lib/mongo.js
import { MongoClient } from 'mongodb';

let clientPromise;
let clientRef; // keep a ref so we can close it in CLI

export async function getDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI');
    if (!clientPromise) {
        const client = new MongoClient(uri, { maxPoolSize: 5 });
        clientRef = client;                // <— keep reference
        clientPromise = client.connect();
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'techideas');

    // indexes (ignore if exist)
    await Promise.all([
        db.collection('digests').createIndex({ date: 1 }, { unique: true }),
        db.collection('ideas').createIndex({ id: 1 }, { unique: true }),
        db.collection('ideas').createIndex({ score: -1 }),
        db.collection('ideas').createIndex({ tags: 1 }),
        db.collection('ideas').createIndex({ headline: 'text', angle: 'text', tags: 'text' })
    ]).catch(() => { });
    return db;
}

export async function closeMongo() {
    if (clientRef) {
        await clientRef.close();
        clientRef = null;
        clientPromise = null;
    }
}
