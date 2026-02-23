import { getCollectionWithItems } from '@/lib/supabase';
import type { Item } from '@/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const PLATFORM_EMOJI: Record<string, string> = {
  youtube: '▶️',
  twitter: '🐦',
  instagram: '📸',
  tiktok: '🎵',
  reddit: '🔴',
  article: '📄',
  web: '🌐',
  unknown: '🔗',
};

function ItemCard({ item }: { item: Item }) {
  const emoji = PLATFORM_EMOJI[item.platform] || '🔗';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl mt-0.5 flex-shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block"
          >
            {item.title || item.url}
          </a>
          <p className="text-xs text-gray-400 mt-1 truncate">{item.url}</p>
        </div>
      </div>

      {item.summary && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.summary}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="capitalize">{item.platform}</span>
        <span>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}

export default async function CollectionPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const { collection, items } = await getCollectionWithItems(params.id);

    return (
      <div>
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
            ← Back to Collections
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-500 capitalize">{collection.category}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>No items in this collection yet.</p>
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
  } catch {
    notFound();
  }
}
