import Anthropic from '@anthropic-ai/sdk';
import type { Category } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const CATEGORIES: Category[] = [
  'travel', 'cooking', 'photography', 'fitness', 'dev',
  'finance', 'music', 'education', 'entertainment', 'news', 'other',
];

export interface AnalysisResult {
  title: string;
  summary: string;
  category: Category;
  tags: string[];
  collectionName: string;
}

export async function analyzeContent(
  url: string,
  transcript: string,
  platform: string
): Promise<AnalysisResult> {
  const prompt = `You are an AI content curator. Analyze the following content from ${platform} (${url}).

${transcript ? `Content/Transcript:\n${transcript.slice(0, 8000)}` : 'No transcript available. Analyze based on URL.'}

Return a JSON object with these exact fields:
- title: string (concise title for this content, max 100 chars)
- summary: string (2-3 sentence summary of the main points)
- category: one of [${CATEGORIES.join(', ')}]
- tags: array of 3-5 relevant tags (lowercase, no spaces, use hyphens)
- collectionName: string (suggested collection name, e.g. "Japan Travel", "Pasta Recipes", "React Tips")

Respond ONLY with valid JSON, no markdown, no explanation.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    const result = JSON.parse(text);
    return {
      title: result.title || 'Untitled',
      summary: result.summary || '',
      category: CATEGORIES.includes(result.category) ? result.category : 'other',
      tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : [],
      collectionName: result.collectionName || result.category || 'General',
    };
  } catch {
    // Fallback if JSON parse fails
    return {
      title: 'Untitled Content',
      summary: 'Content saved from ' + platform,
      category: 'other',
      tags: [],
      collectionName: 'General',
    };
  }
}

export async function summarizeTranscript(transcript: string): Promise<string> {
  if (!transcript || transcript.length < 100) return transcript;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Summarize the following video transcript into clear, structured key points. Use bullet points. Be concise but comprehensive.\n\nTranscript:\n${transcript.slice(0, 10000)}`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : transcript;
}
