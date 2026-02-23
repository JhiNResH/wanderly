import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCollectionWithItems } from '../../src/lib/supabase';
import { ItemCard } from '../../src/components/ItemCard';
import type { Collection, Item } from '../../src/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../src/types';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    getCollectionWithItems(id)
      .then(({ collection, items }) => {
        setCollection(collection);
        setItems(items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.centered, isDark && styles.darkBg]}>
        <ActivityIndicator color="#6C63FF" size="large" />
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={[styles.centered, isDark && styles.darkBg]}>
        <Text style={[styles.errorText, isDark && styles.textLight]}>Collection not found</Text>
      </View>
    );
  }

  const categoryColor = CATEGORY_COLORS[collection.category as keyof typeof CATEGORY_COLORS] ?? '#B2BEC3';
  const categoryLabel = CATEGORY_LABELS[collection.category as keyof typeof CATEGORY_LABELS] ?? collection.category;

  return (
    <View style={[styles.container, isDark && styles.darkBg]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push(`/item/${item.id}`)}
          />
        )}
        ListHeaderComponent={
          <View style={[styles.header, { borderBottomColor: categoryColor }]}>
            <View style={[styles.iconBg, { backgroundColor: categoryColor + '22' }]}>
              <Text style={styles.icon}>{getCategoryEmoji(collection.category)}</Text>
            </View>
            <Text style={[styles.collectionName, isDark && styles.textLight]}>
              {collection.name}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: categoryColor + '22', borderColor: categoryColor }]}>
                <Text style={[styles.badgeText, { color: categoryColor }]}>{categoryLabel}</Text>
              </View>
              <Text style={[styles.countText, isDark && styles.textMuted]}>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={[styles.emptyText, isDark && styles.textLight]}>No items yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    travel: '✈️', cooking: '🍜', photography: '📸',
    fitness: '💪', dev: '💻', finance: '📈',
    music: '🎵', education: '📚', entertainment: '🎬',
    news: '📰', other: '📂',
  };
  return emojis[category] ?? '📂';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  darkBg: {
    backgroundColor: '#0D0D1A',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 16,
    color: '#636E72',
  },
  textLight: {
    color: '#F0F0F0',
  },
  textMuted: {
    color: '#636E72',
  },
  header: {
    padding: 24,
    paddingTop: 100,
    borderBottomWidth: 2,
    marginBottom: 8,
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  collectionName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  countText: {
    fontSize: 13,
    color: '#636E72',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#636E72',
  },
});
