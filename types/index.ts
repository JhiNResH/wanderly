export interface Collection {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface Item {
  id: string;
  url: string;
  platform: string;
  title: string;
  summary: string;
  extracted_content: string;
  category: string;
  tags: string[];
  collection_id: string | null;
  created_at: string;
}

export type Platform = 'youtube' | 'twitter' | 'instagram' | 'web' | 'unknown';

export type Category =
  | 'travel'
  | 'cooking'
  | 'photography'
  | 'fitness'
  | 'dev'
  | 'finance'
  | 'music'
  | 'education'
  | 'entertainment'
  | 'news'
  | 'other';
