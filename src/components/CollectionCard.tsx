import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import type { Collection } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
}

export function CollectionCard({ collection, onPress }: CollectionCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const color = CATEGORY_COLORS[collection.category as keyof typeof CATEGORY_COLORS] ?? '#B2BEC3';
  const label = CATEGORY_LABELS[collection.category as keyof typeof CATEGORY_LABELS] ?? collection.category;

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark, { borderTopColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '22' }]}>
        <Text style={styles.icon}>{getCategoryEmoji(collection.category)}</Text>
      </View>

      <Text style={[styles.name, isDark && styles.nameDark]} numberOfLines={2}>
        {collection.name}
      </Text>

      <View style={styles.footer}>
        <View style={[styles.badge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
        {collection.item_count !== undefined && (
          <Text style={[styles.count, isDark && styles.countDark]}>
            {collection.item_count} items
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    travel: '✈️',
    cooking: '🍜',
    photography: '📸',
    fitness: '💪',
    dev: '💻',
    finance: '📈',
    music: '🎵',
    education: '📚',
    entertainment: '🎬',
    news: '📰',
    other: '📂',
  };
  return emojis[category] ?? '📂';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1E1E2E',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
    lineHeight: 20,
  },
  nameDark: {
    color: '#F0F0F0',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  count: {
    fontSize: 11,
    color: '#636E72',
  },
  countDark: {
    color: '#555',
  },
});
