import { getYouTubeTranscript, detectPlatform, isValidUrl } from './youtube';
import { analyzeContent, summarizeTranscript } from './claude';
import { createItem, getOrCreateCollection } from './supabase';
import type { Item } from '@/types';

export async function processUrl(url: string): Promise<Item> {
  if (!isValidUrl(url)) throw new Error('Invalid URL');

  const platform = detectPlatform(url);

  // Extract content based on platform
  let rawContent = '';
  if (platform === 'youtube') {
    rawContent = await getYouTubeTranscript(url);
  }

  // Summarize long transcripts
  const extractedContent = rawContent.length > 500
    ? await summarizeTranscript(rawContent)
    : rawContent;

  // AI analysis: title, summary, category, tags, collection
  const analysis = await analyzeContent(url, extractedContent, platform);

  // Get or create the right collection
  const collection = await getOrCreateCollection(
    analysis.collectionName,
    analysis.category
  );

  // Save item to Supabase
  const item = await createItem({
    url,
    platform,
    title: analysis.title,
    summary: analysis.summary,
    extracted_content: extractedContent,
    category: analysis.category,
    tags: analysis.tags,
    collection_id: collection.id,
  });

  return item;
}
