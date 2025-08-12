import { getDb } from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    const db = await getDb();
    const doc = await db.collection('digests').findOne({ date: params.date });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(doc);
}
