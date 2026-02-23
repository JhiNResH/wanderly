import { getItems } from '@/lib/supabase';
import type { Item } from '@/types';
import Link from 'next/link';

const PLATFORM_EMOJI: Record<string, string> = {
  youtube: '▶️',
  twitter: '🐦',
  instagram: '📸',
  tiktok: '🎵',
  reddit: '🔴',
  article: '📄',
  web: '🌐',
};

function ItemCard({ item }: { item: Item }) {
  const emoji = PLATFORM_EMOJI[item.platform] || '🔗';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl mt-0.5">{emoji}</span>
        <div className="flex-1 min-w-0">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block"
          >
            {item.title || item.url}
          </a>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.url}</p>
        </div>
      </div>
      {item.summary && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.summary}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

export default async function AllItemsPage() {
  let items: Item[] = [];
  let error = '';

  try {
    items = await getItems();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load items';
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
          ← Back to Collections
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">All Saved Items</h1>
        <p className="text-gray-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} total</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          ⚠️ {error}
        </div>
      )}

      {items.length === 0 && !error ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>No items saved yet. Send a URL to your Telegram bot!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
