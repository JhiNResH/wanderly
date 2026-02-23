import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const collections = await getCollections();
    return NextResponse.json(collections);
  } catch (err) {
    console.error('Error fetching collections:', err);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
