import { getYouTubeTranscript, detectPlatform, isValidUrl } from './youtube';
import { analyzeContent, summarizeTranscript } from './claude';
import { createItem, getOrCreateCollection } from './supabase';
import { extractMetadata } from './extractor';
import type { Item } from '../types';

export interface ProcessResult {
  item: Item;
  isNew: boolean;
}

export async function processUrl(url: string): Promise<ProcessResult> {
  if (!isValidUrl(url)) throw new Error('Invalid URL');

  const platform = detectPlatform(url);

  // 1. Extract metadata (title, thumbnail)
  const metadata = await extractMetadata(url);

  // 2. Extract raw content based on platform
  let rawContent = '';
  if (platform === 'youtube') {
    rawContent = await getYouTubeTranscript(url);
  }

  // 3. Summarize long transcripts
  const extractedContent =
    rawContent.length > 500
      ? await summarizeTranscript(rawContent)
      : rawContent || metadata.description;

  // 4. AI analysis
  const analysis = await analyzeContent(url, extractedContent, platform);

  // 5. Get or create collection
  const collection = await getOrCreateCollection(
    analysis.collectionName,
    analysis.category
  );

  // 6. Save to Supabase
  const item = await createItem({
    url,
    platform,
    title: analysis.title || metadata.title,
    summary: analysis.summary,
    extracted_content: extractedContent,
    thumbnail: metadata.thumbnail ?? undefined,
    category: analysis.category,
    tags: analysis.tags,
    collection_id: collection.id,
  });

  return { item, isNew: true };
}
