import { NextRequest, NextResponse } from 'next/server';
import { getItems } from '@/lib/supabase';
import { processUrl } from '@/lib/processor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get('collectionId') ?? undefined;
    const items = await getItems(collectionId);
    return NextResponse.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const item = await processUrl(url);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error('Error processing URL:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to process URL' },
      { status: 500 }
    );
  }
}
