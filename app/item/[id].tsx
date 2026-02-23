import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Linking,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getItem } from '../../src/lib/supabase';
import type { Item } from '../../src/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../src/types';
import { getPlatformDisplayName } from '../../src/lib/youtube';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    getItem(id)
      .then(setItem)
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

  if (!item) {
    return (
      <View style={[styles.centered, isDark && styles.darkBg]}>
        <Text style={[styles.errorText, isDark && styles.textLight]}>Item not found</Text>
      </View>
    );
  }

  const categoryColor = CATEGORY_COLORS[item.category] ?? '#B2BEC3';
  const categoryLabel = CATEGORY_LABELS[item.category] ?? item.category;

  const keyPoints = item.extracted_content
    .split('\n')
    .filter((line) => line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <ScrollView
      style={[styles.container, isDark && styles.darkBg]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {item.thumbnail && (
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        {/* Category + Platform */}
        <View style={styles.metaRow}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22', borderColor: categoryColor }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{categoryLabel}</Text>
          </View>
          <Text style={[styles.platformText, isDark && styles.textMuted]}>
            {getPlatformDisplayName(item.platform)}
          </Text>
          <Text style={[styles.dateText, isDark && styles.textMuted]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, isDark && styles.textLight]}>{item.title}</Text>

        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag) => (
              <View key={tag} style={[styles.tag, isDark && styles.tagDark]}>
                <Text style={[styles.tagText, isDark && styles.tagTextDark]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        {item.summary && (
          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>📝 Summary</Text>
            <Text style={[styles.sectionText, isDark && styles.textMuted]}>{item.summary}</Text>
          </View>
        )}

        {/* Key Points */}
        {keyPoints.length > 0 && (
          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>⚡ Key Points</Text>
            {keyPoints.map((point, idx) => (
              <View key={idx} style={styles.keyPointRow}>
                <View style={[styles.bullet, { backgroundColor: categoryColor }]} />
                <Text style={[styles.keyPointText, isDark && styles.textMuted]}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Full extracted content */}
        {item.extracted_content && keyPoints.length === 0 && (
          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.textLight]}>📄 Content</Text>
            <Text style={[styles.sectionText, isDark && styles.textMuted]}>
              {item.extracted_content.slice(0, 1000)}
              {item.extracted_content.length > 1000 ? '...' : ''}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: categoryColor }]}
            onPress={() => Linking.openURL(item.url)}
          >
            <Text style={styles.actionButtonText}>Open Link 🔗</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButtonSecondary, isDark && styles.actionButtonSecondaryDark]}
            onPress={() =>
              Share.share({ title: item.title, url: item.url, message: item.url })
            }
          >
            <Text style={[styles.actionButtonSecondaryText, isDark && styles.textLight]}>Share ↗</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  heroImage: {
    width: '100%',
    height: 240,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  content: {
    padding: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  platformText: {
    fontSize: 12,
    color: '#636E72',
  },
  dateText: {
    fontSize: 12,
    color: '#636E72',
    marginLeft: 'auto',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
    lineHeight: 32,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagDark: {
    backgroundColor: '#2D2D3E',
  },
  tagText: {
    fontSize: 12,
    color: '#636E72',
  },
  tagTextDark: {
    color: '#888',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#1E1E2E',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  keyPointText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 22,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionButtonSecondary: {
    flex: 0,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  actionButtonSecondaryDark: {
    backgroundColor: '#2D2D3E',
  },
  actionButtonSecondaryText: {
    color: '#2D3436',
    fontSize: 15,
    fontWeight: '700',
  },
});
