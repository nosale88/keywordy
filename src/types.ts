export interface SearchResult {
  id: string;
  title: string;
  content: string;
  link: string;
  source: string;
  type: 'blog' | 'news' | 'cafe' | 'other';
  date?: string;
  thumbnail?: string;
}

export type ContentType = 'all' | 'blog' | 'news' | 'cafe';

export interface SearchTag {
  id: string;
  keyword: string;
  contentType: ContentType;
}

export interface ScheduledSearch {
  id: string;
  searchTags: SearchTag[]; // Changed from searchTag to searchTags
  schedule: {
    type: 'daily' | 'weekly';
    time: string; // HH:mm format
    days?: number[]; // 0-6 for weekly schedule (0 = Sunday)
  };
  isActive: boolean;
  lastRun?: string;
}