import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongo.js';

export async function GET() {
    const db = await getDb();
    const doc = await db.collection('digests')
        .find({})
        .sort({ date: -1 })
        .limit(1)
        .next();

    if (!doc) return NextResponse.json({ error: 'No digest found' }, { status: 404 });
    return NextResponse.json(doc);
}
