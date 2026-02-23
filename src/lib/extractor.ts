/**
 * URL metadata extractor
 * Detects platform, extracts title and thumbnail from URLs
 * Works for YouTube, Instagram, TikTok, 小紅書 (Xiaohongshu), and generic web pages
 */

import { detectPlatform, extractYouTubeVideoId } from './youtube';
import type { Platform } from '../types';

export interface ExtractedMetadata {
  url: string;
  platform: Platform;
  title: string;
  thumbnail: string | null;
  description: string;
}

/**
 * Extract metadata from a URL without needing full page rendering.
 * Uses platform-specific APIs when available, falls back to oEmbed / Open Graph.
 */
export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
  const platform = detectPlatform(url);

  switch (platform) {
    case 'youtube':
      return extractYouTubeMetadata(url);
    case 'instagram':
      return extractInstagramMetadata(url);
    case 'tiktok':
      return extractTikTokMetadata(url);
    case 'xiaohongshu':
      return extractXiaohongshuMetadata(url);
    default:
      return extractGenericMetadata(url, platform);
  }
}

async function extractYouTubeMetadata(url: string): Promise<ExtractedMetadata> {
  const videoId = extractYouTubeVideoId(url);
  let thumbnail: string | null = null;
  let title = 'YouTube Video';

  if (videoId) {
    thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Use oEmbed to get title (no API key needed)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        title = data.title || title;
        thumbnail = data.thumbnail_url || thumbnail;
      }
    } catch {
      // fallback to thumbnail URL
    }
  }

  return {
    url,
    platform: 'youtube',
    title,
    thumbnail,
    description: '',
  };
}

async function extractInstagramMetadata(url: string): Promise<ExtractedMetadata> {
  let title = 'Instagram Post';
  let thumbnail: string | null = null;

  try {
    // Instagram oEmbed (limited, no auth)
    const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      title = data.title || title;
      thumbnail = data.thumbnail_url || null;
    }
  } catch {
    // No auth token available, use default
  }

  return { url, platform: 'instagram', title, thumbnail, description: '' };
}

async function extractTikTokMetadata(url: string): Promise<ExtractedMetadata> {
  let title = 'TikTok Video';
  let thumbnail: string | null = null;

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      title = data.title || title;
      thumbnail = data.thumbnail_url || null;
    }
  } catch {
    // ignore
  }

  return { url, platform: 'tiktok', title, thumbnail, description: '' };
}

async function extractXiaohongshuMetadata(url: string): Promise<ExtractedMetadata> {
  // 小紅書 doesn't have a public oEmbed API
  // Extract note ID from URL for display purposes
  const noteIdMatch = url.match(/\/explore\/([a-f0-9]+)/i) || url.match(/item\/([a-f0-9]+)/i);
  const noteId = noteIdMatch?.[1];
  const title = noteId ? `小紅書 筆記 #${noteId.slice(0, 8)}` : '小紅書 內容';

  return {
    url,
    platform: 'xiaohongshu',
    title,
    thumbnail: null,
    description: '',
  };
}

async function extractGenericMetadata(url: string, platform: Platform): Promise<ExtractedMetadata> {
  // Use allorigins.win proxy to fetch Open Graph tags from generic URLs
  let title = new URL(url).hostname;
  let thumbnail: string | null = null;
  let description = '';

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      const html: string = data.contents || '';

      // Extract og:title
      const titleMatch =
        html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) title = decodeHTMLEntities(titleMatch[1]);

      // Extract og:image
      const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      if (imageMatch) thumbnail = imageMatch[1];

      // Extract og:description
      const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
      if (descMatch) description = decodeHTMLEntities(descMatch[1]);
    }
  } catch {
    // fail silently
  }

  return { url, platform, title, thumbnail, description };
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
