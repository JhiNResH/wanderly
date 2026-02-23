import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CollectionCard } from '../../src/components/CollectionCard';
import { getCollections } from '../../src/lib/supabase';
import type { Collection } from '../../src/types';

const NUM_COLUMNS = 2;
const CARD_GAP = 12;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP) / 2;

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const loadCollections = useCallback(async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCollections();
  }, [loadCollections]);

  if (loading) {
    return (
      <View style={[styles.centered, isDark && styles.darkBg]}>
        <Text style={[styles.loadingText, isDark && styles.textLight]}>
          Loading collections... 📁
        </Text>
      </View>
    );
  }

  if (collections.length === 0) {
    return (
      <View style={[styles.centered, isDark && styles.darkBg]}>
        <Text style={styles.emptyEmoji}>📂</Text>
        <Text style={[styles.emptyTitle, isDark && styles.textLight]}>No collections yet</Text>
        <Text style={[styles.emptySubtitle, isDark && styles.textMuted]}>
          Save links and they'll be auto-organized into collections
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.darkBg]}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <CollectionCard
              collection={item}
              onPress={() => router.push(`/collection/${item.id}`)}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C63FF"
          />
        }
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
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
    padding: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
});
