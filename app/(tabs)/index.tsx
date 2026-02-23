import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ItemCard } from '../../src/components/ItemCard';
import { getItems, subscribeToItems } from '../../src/lib/supabase';
import { useSharedUrl } from '../../src/hooks/useSharedUrl';
import type { Item } from '../../src/types';

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const loadItems = useCallback(async () => {
    try {
      const data = await getItems(undefined, 30);
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();

    // Subscribe to real-time inserts
    const unsubscribe = subscribeToItems((newItem) => {
      setItems((prev) => [newItem, ...prev]);
    });

    return unsubscribe;
  }, [loadItems]);

  // Handle URLs shared from iOS Share Extension
  useSharedUrl((sharedUrl) => {
    Alert.alert(
      '🔗 URL Shared',
      `Save this link?\n\n${sharedUrl}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save & Process',
          onPress: () =>
            router.push({ pathname: '/(tabs)/add', params: { url: sharedUrl } }),
        },
      ]
    );
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  if (loading) {
    return (
      <View style={[styles.centered, isDark && styles.darkBg]}>
        <Text style={[styles.loadingText, isDark && styles.textLight]}>
          Loading your saves... ✨
        </Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.centered, isDark && styles.darkBg]}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={[styles.emptyTitle, isDark && styles.textLight]}>Nothing saved yet</Text>
        <Text style={[styles.emptySubtitle, isDark && styles.textMuted]}>
          Tap ➕ to save your first link, or share from any app
        </Text>
      </View>
    );
  }

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#6C63FF' : '#6C63FF'}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
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
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#636E72',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 20,
  },
  textLight: {
    color: '#F0F0F0',
  },
  textMuted: {
    color: '#555',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },
});
