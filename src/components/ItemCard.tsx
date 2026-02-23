import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import type { Item } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types';
import { getPlatformDisplayName } from '../lib/youtube';

interface ItemCardProps {
  item: Item;
  onPress: () => void;
}

export function ItemCard({ item, onPress }: ItemCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const categoryColor = CATEGORY_COLORS[item.category] ?? '#B2BEC3';
  const categoryLabel = CATEGORY_LABELS[item.category] ?? item.category;

  const timeAgo = getTimeAgo(item.created_at);

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {item.thumbnail ? (
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnailPlaceholder, { backgroundColor: categoryColor + '33' }]}>
          <Text style={[styles.platformEmoji]}>
            {getPlatformEmoji(item.platform)}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22', borderColor: categoryColor }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{categoryLabel}</Text>
          </View>
          <Text style={[styles.timeAgo, isDark && styles.textMutedDark]}>{timeAgo}</Text>
        </View>

        <Text
          style={[styles.title, isDark && styles.titleDark]}
          numberOfLines={2}
        >
          {item.title || 'Untitled'}
        </Text>

        {item.summary ? (
          <Text
            style={[styles.summary, isDark && styles.summaryDark]}
            numberOfLines={2}
          >
            {item.summary}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={[styles.platform, isDark && styles.textMutedDark]}>
            {getPlatformDisplayName(item.platform)}
          </Text>
          {item.tags.slice(0, 3).map((tag) => (
            <Text key={tag} style={[styles.tag, isDark && styles.tagDark]}>
              #{tag}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getPlatformEmoji(platform: string): string {
  const emojis: Record<string, string> = {
    youtube: '▶️',
    instagram: '📸',
    tiktok: '🎵',
    xiaohongshu: '📕',
    twitter: '🐦',
    reddit: '🤖',
    article: '📄',
    web: '🌐',
  };
  return emojis[platform] ?? '🌐';
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1E1E2E',
    shadowOpacity: 0.3,
  },
  thumbnail: {
    width: '100%',
    height: 180,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformEmoji: {
    fontSize: 40,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 11,
    color: '#636E72',
  },
  textMutedDark: {
    color: '#636E72',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 6,
    lineHeight: 22,
  },
  titleDark: {
    color: '#F0F0F0',
  },
  summary: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 18,
    marginBottom: 10,
  },
  summaryDark: {
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  platform: {
    fontSize: 11,
    color: '#636E72',
    fontWeight: '500',
  },
  tag: {
    fontSize: 11,
    color: '#A0A0A0',
  },
  tagDark: {
    color: '#555',
  },
});
