import { getCollections } from '@/lib/supabase';
import type { Collection } from '@/types';
import Link from 'next/link';

const CATEGORY_EMOJI: Record<string, string> = {
  travel: '✈️',
  cooking: '🍳',
  photography: '📷',
  fitness: '💪',
  dev: '💻',
  finance: '💰',
  music: '🎵',
  education: '📚',
  entertainment: '🎬',
  news: '📰',
  other: '📌',
};

const CATEGORY_COLORS: Record<string, string> = {
  travel: 'bg-blue-100 text-blue-800',
  cooking: 'bg-orange-100 text-orange-800',
  photography: 'bg-purple-100 text-purple-800',
  fitness: 'bg-green-100 text-green-800',
  dev: 'bg-gray-100 text-gray-800',
  finance: 'bg-yellow-100 text-yellow-800',
  music: 'bg-pink-100 text-pink-800',
  education: 'bg-indigo-100 text-indigo-800',
  entertainment: 'bg-red-100 text-red-800',
  news: 'bg-cyan-100 text-cyan-800',
  other: 'bg-gray-100 text-gray-600',
};

function CollectionCard({ collection }: { collection: Collection }) {
  const emoji = CATEGORY_EMOJI[collection.category] || '📌';
  const colorClass = CATEGORY_COLORS[collection.category] || CATEGORY_COLORS.other;

  return (
    <Link href={`/collections/${collection.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{emoji}</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass}`}>
            {collection.category}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {collection.name}
        </h3>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(collection.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </p>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  let collections: Collection[] = [];
  let error = '';

  try {
    collections = await getCollections();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load collections';
  }

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Your Content Collections 🗺️
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Save anything from Telegram. AI extracts, summarizes, and organizes it for you.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          ⚠️ {error} — Make sure your Supabase credentials are configured.
        </div>
      )}

      {collections.length === 0 && !error ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No collections yet</h2>
          <p className="text-gray-400 mb-6">
            Send a URL to your Telegram bot to get started!
          </p>
          <div className="bg-gray-100 rounded-lg p-4 inline-block text-sm text-gray-600">
            👉 Open Telegram → find your bot → send a YouTube or web URL
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  );
}
