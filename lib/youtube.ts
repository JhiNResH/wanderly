import { YoutubeTranscript } from 'youtube-transcript';

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

export function detectPlatform(url: string): string {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/twitter\.com|x\.com/.test(url)) return 'twitter';
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/tiktok\.com/.test(url)) return 'tiktok';
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
