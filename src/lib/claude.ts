import Anthropic from '@anthropic-ai/sdk';
import type { Category } from '../types';

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
  keyPoints: string[];
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
  return new Anthropic({ apiKey });
}

export async function analyzeContent(
  url: string,
  transcript: string,
  platform: string
): Promise<AnalysisResult> {
  const anthropic = getAnthropicClient();

  const prompt = `You are an AI content curator. Analyze the following content from ${platform} (${url}).

${transcript ? `Content/Transcript:\n${transcript.slice(0, 8000)}` : 'No transcript available. Analyze based on URL.'}

Return a JSON object with these exact fields:
- title: string (concise title, max 100 chars)
- summary: string (2-3 sentence summary)
- category: one of [${CATEGORIES.join(', ')}]
- tags: array of 3-5 relevant tags (lowercase, hyphens)
- collectionName: string (e.g. "Japan Travel", "Pasta Recipes", "React Tips")
- keyPoints: array of 3-5 bullet point strings (key takeaways)

Respond ONLY with valid JSON, no markdown.`;

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
      collectionName: result.collectionName || 'General',
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints.slice(0, 5) : [],
    };
  } catch {
    return {
      title: 'Untitled Content',
      summary: 'Content saved from ' + platform,
      category: 'other',
      tags: [],
      collectionName: 'General',
      keyPoints: [],
    };
  }
}

export async function summarizeTranscript(transcript: string): Promise<string> {
  if (!transcript || transcript.length < 100) return transcript;

  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Summarize the following into clear key points. Use bullet points.\n\nContent:\n${transcript.slice(0, 10000)}`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : transcript;
}
