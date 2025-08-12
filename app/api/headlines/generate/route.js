import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { generateHeadlines } from '@/lib/headlines';

export async function GET(req) {
    const url = new URL(req.url);
    const ideaId = url.searchParams.get('ideaId');
    let text = url.searchParams.get('text') || '';
    let tagsParam = url.searchParams.get('tags') || '';
    const persist = url.searchParams.get('persist') !== 'false';

    let tags = tagsParam ? tagsParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];

    // If ideaId is provided, try DB, but don't fail hard
    if (ideaId) {
        try {
            const db = await getDb();
            const idea = await db.collection('ideas').findOne({ id: ideaId });
            if (idea) {
                if (!text) text = idea.headline || idea.angle || '';
                if (!tags.length) tags = (idea.tags || []).map(t => String(t).toLowerCase());
            }
            if (idea && persist) {
                // we'll persist variants below
            }
        } catch {
            // no DB in dev or connection issue: fall back to text/tags only
        }
    }

    if (!text && !tags.length) {
        return NextResponse.json({ error: 'Provide ideaId or text/tags' }, { status: 400 });
    }

    const variants = generateHeadlines({ seed: text, tags });

    // Try to persist if we have an ideaId and DB
    if (persist && ideaId) {
        try {
            const db = await getDb();
            await db.collection('ideas').updateOne(
                { id: ideaId },
                { $set: { headlines: variants, updatedAt: new Date().toISOString() } }
            );
        } catch { /* ignore in dev */ }
    }

    return NextResponse.json({
        mode: ideaId ? 'ideaId' : (text ? 'text' : 'tags'),
        input: ideaId || text || tags.join(','),
        count: variants.length,
        variants
    });
}
