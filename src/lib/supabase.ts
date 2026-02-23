import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Collection, Item, Category } from '../types';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const key =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!url || !key) {
    throw new Error(
      'Supabase credentials not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
    );
  }

  _client = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
  return _client;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signInAnonymously() {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const client = getSupabaseClient();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

// ─── Collections ──────────────────────────────────────────────────────────────

export async function getCollections(): Promise<Collection[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('collections')
    .select('*, items(count)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({
    ...c,
    item_count: c.items?.[0]?.count ?? 0,
  }));
}

export async function getOrCreateCollection(
  name: string,
  category: Category
): Promise<Collection> {
  const client = getSupabaseClient();

  const { data: existing } = await client
    .from('collections')
    .select('*')
    .ilike('name', name)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await client
    .from('collections')
    .insert({ name, category })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getItems(collectionId?: string, limit = 20): Promise<Item[]> {
  const client = getSupabaseClient();
  let query = client
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (collectionId) {
    query = query.eq('collection_id', collectionId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createItem(
  item: Omit<Item, 'id' | 'created_at'>
): Promise<Item> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('items')
    .insert(item)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getItem(id: string): Promise<Item> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getCollectionWithItems(
  collectionId: string
): Promise<{ collection: Collection; items: Item[] }> {
  const client = getSupabaseClient();
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

// ─── Realtime ────────────────────────────────────────────────────────────────

export function subscribeToItems(
  onInsert: (item: Item) => void
) {
  const client = getSupabaseClient();
  const channel = client
    .channel('items-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'items' },
      (payload) => onInsert(payload.new as Item)
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
