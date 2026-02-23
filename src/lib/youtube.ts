import { YoutubeTranscript } from 'youtube-transcript';
import type { Platform } from '../types';

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function getYouTubeTranscript(url: string): Promise<string> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) throw new Error('Invalid YouTube URL');

  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    return transcriptItems.map((item) => item.text).join(' ');
  } catch (err) {
    console.error('Failed to fetch YouTube transcript:', err);
    return '';
  }
}

export function detectPlatform(url: string): Platform {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/tiktok\.com|douyin\.com/.test(url)) return 'tiktok';
  if (/xiaohongshu\.com|xhslink\.com|red\.com/.test(url)) return 'xiaohongshu';
  if (/twitter\.com|x\.com/.test(url)) return 'twitter';
  if (/reddit\.com/.test(url)) return 'reddit';
  if (/medium\.com|substack\.com/.test(url)) return 'article';
  return 'web';
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getPlatformDisplayName(platform: Platform): string {
  const names: Record<Platform, string> = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    xiaohongshu: '小紅書',
    twitter: 'Twitter / X',
    reddit: 'Reddit',
    article: 'Article',
    web: 'Web',
  };
  return names[platform] ?? 'Web';
}
