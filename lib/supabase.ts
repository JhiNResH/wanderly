import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Collection, Item } from '@/types';

function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
  return createClient(url, key);
}

// ─── Collections ────────────────────────────────────────────────────────────

export async function getCollections(): Promise<Collection[]> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrCreateCollection(
  name: string,
  category: string
): Promise<Collection> {
  const client = getAdminClient();

  // Try to find existing collection by name
  const { data: existing } = await client
    .from('collections')
    .select('*')
    .ilike('name', name)
    .maybeSingle();

  if (existing) return existing;

  // Create new one
  const { data, error } = await client
    .from('collections')
    .insert({ name, category })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Items ───────────────────────────────────────────────────────────────────

export async function getItems(collectionId?: string): Promise<Item[]> {
  const client = getAdminClient();
  let query = client
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (collectionId) {
    query = query.eq('collection_id', collectionId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createItem(item: Omit<Item, 'id' | 'created_at'>): Promise<Item> {
  const client = getAdminClient();
  const { data, error } = await client
    .from('items')
    .insert(item)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getCollectionWithItems(
  collectionId: string
): Promise<{ collection: Collection; items: Item[] }> {
  const client = getAdminClient();
  const [collectionResult, itemsResult] = await Promise.all([
    client.from('collections').select('*').eq('id', collectionId).single(),
    client
      .from('items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false }),
  ]);

  if (collectionResult.error) throw new Error(collectionResult.error.message);
  if (itemsResult.error) throw new Error(itemsResult.error.message);

  return {
    collection: collectionResult.data,
    items: itemsResult.data ?? [],
  };
}
