export interface Collection {
  id: string;
  name: string;
  category: Category;
  thumbnail?: string;
  item_count?: number;
  created_at: string;
}

export interface Item {
  id: string;
  url: string;
  platform: Platform;
  title: string;
  summary: string;
  extracted_content: string;
  thumbnail?: string;
  category: Category;
  tags: string[];
  collection_id: string | null;
  created_at: string;
}

export type Platform =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'xiaohongshu'
  | 'twitter'
  | 'reddit'
  | 'article'
  | 'web';

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

export const CATEGORY_LABELS: Record<Category, string> = {
  travel: '旅遊',
  cooking: '美食',
  photography: '攝影',
  fitness: '健身',
  dev: '開發',
  finance: '財經',
  music: '音樂',
  education: '學習',
  entertainment: '娛樂',
  news: '新聞',
  other: '其他',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  travel: '#FF6B6B',
  cooking: '#FF9F43',
  photography: '#A29BFE',
  fitness: '#00CEC9',
  dev: '#0984E3',
  finance: '#00B894',
  music: '#FD79A8',
  education: '#FDCB6E',
  entertainment: '#E17055',
  news: '#636E72',
  other: '#B2BEC3',
};
