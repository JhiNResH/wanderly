import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { processUrl } from '../../src/lib/processor';
import { isValidUrl, detectPlatform, getPlatformDisplayName } from '../../src/lib/youtube';

export default function AddScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string }>();

  // Pre-fill URL if passed from share extension handler
  useEffect(() => {
    if (params.url) {
      setUrl(params.url);
    }
  }, [params.url]);

  // Detect platform as user types
  useEffect(() => {
    if (isValidUrl(url)) {
      const platform = detectPlatform(url);
      setDetectedPlatform(getPlatformDisplayName(platform));
    } else {
      setDetectedPlatform(null);
    }
  }, [url]);

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }
    if (!isValidUrl(url.trim())) {
      Alert.alert('Error', 'Please enter a valid URL (include https://)');
      return;
    }

    setLoading(true);
    try {
      const { item } = await processUrl(url.trim());
      setUrl('');
      Alert.alert(
        '✅ Saved!',
        `"${item.title}" has been saved to your ${item.category} collection.`,
        [
          { text: 'View', onPress: () => router.push(`/item/${item.id}`) },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.darkBg]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🔗</Text>
          <Text style={[styles.heroTitle, isDark && styles.textLight]}>
            Save a Link
          </Text>
          <Text style={[styles.heroSubtitle, isDark && styles.textMuted]}>
            Paste any URL — YouTube, Instagram, TikTok, 小紅書, articles, or any webpage
          </Text>
        </View>

        <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder="https://..."
            placeholderTextColor={isDark ? '#555' : '#B2BEC3'}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            onSubmitEditing={handleSave}
            editable={!loading}
          />
          {detectedPlatform && (
            <View style={styles.platformBadge}>
              <Text style={styles.platformBadgeText}>📍 {detectedPlatform}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.loadingText}>Processing with AI... ✨</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save & Extract ✨</Text>
          )}
        </TouchableOpacity>

        <View style={[styles.tipCard, isDark && styles.tipCardDark]}>
          <Text style={[styles.tipTitle, isDark && styles.textLight]}>💡 What happens when you save?</Text>
          <Text style={[styles.tipText, isDark && styles.textMuted]}>1. We extract the page title & thumbnail</Text>
          <Text style={[styles.tipText, isDark && styles.textMuted]}>2. For YouTube, we grab the full transcript</Text>
          <Text style={[styles.tipText, isDark && styles.textMuted]}>3. Claude AI summarizes & categorizes</Text>
          <Text style={[styles.tipText, isDark && styles.textMuted]}>4. Auto-saved to the right collection</Text>
        </View>

        <View style={[styles.tipCard, isDark && styles.tipCardDark]}>
          <Text style={[styles.tipTitle, isDark && styles.textLight]}>📱 Share from other apps</Text>
          <Text style={[styles.tipText, isDark && styles.textMuted]}>
            Use the iOS Share button in any app → tap "Wanderly" to save instantly
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  textLight: {
    color: '#F0F0F0',
  },
  textMuted: {
    color: '#636E72',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainerDark: {
    backgroundColor: '#1E1E2E',
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#2D3436',
  },
  inputDark: {
    color: '#F0F0F0',
  },
  platformBadge: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  platformBadgeText: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#B2BEC3',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tipCardDark: {
    backgroundColor: '#1E1E2E',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 22,
  },
});
