import { getDb } from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const db = await getDb();
    const url = new URL(req.url);
    const date = url.searchParams.get('date');   // 'YYYY-MM-DD' or null
    const q = url.searchParams.get('q') || '';   // search query

    let latestDate = date;
    if (!latestDate) {
        const latest = await db.collection('digests')
            .find({})
            .sort({ date: -1 })
            .limit(1)
            .next();
        latestDate = latest?.date;
    }
    if (!latestDate) return NextResponse.json({ date: null, count: 0, ideas: [] });

    const filter = { date: latestDate };
    let cursor;

    if (q.trim()) {
        // requires text index on headline, angle, tags (set in getDb)
        cursor = db.collection('ideas')
            .find({ $text: { $search: q }, ...filter }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .limit(200);
    } else {
        cursor = db.collection('ideas').find(filter).sort({ score: -1 }).limit(200);
    }

    const ideas = await cursor.toArray();
    return NextResponse.json({ date: latestDate, count: ideas.length, ideas });
}
