import axios from 'axios';
import { SearchResult, ContentType } from '../types';

const API_BASE = import.meta.env.PROD 
  ? '/api/search'
  : '/api/search';

export async function searchNaver(query: string, contentType: ContentType = 'all', page: number = 1): Promise<SearchResult[]> {
  try {
    let apiEndpoint;
    switch (contentType) {
      case 'news':
        apiEndpoint = 'news';
        break;
      case 'blog':
      case 'cafe':
      case 'all':
      default:
        apiEndpoint = 'blog';
        break;
    }

    const display = 10;
    const start = (page - 1) * display + 1;

    const response = await axios.get(`${API_BASE}/${apiEndpoint}`, {
      params: {
        query,
        display,
        start
      }
    });

    if (!response.data) {
      throw new Error('No data received from API');
    }

    const items = Array.isArray(response.data) ? response.data : response.data.items;
    
    if (!items || !Array.isArray(items)) {
      throw new Error('Invalid response format from API');
    }

    return items.map((item: {
      title?: string;
      description?: string;
      link?: string;
      bloggername?: string;
      publisher?: string;
      postdate?: string;
      pubDate?: string;
      thumbnail?: string;
    }, index: number) => ({
      id: `${apiEndpoint}-${index}-${Date.now()}`,
      title: item.title?.replace(/<\/?b>/g, '') || '',
      content: item.description?.replace(/<\/?b>/g, '') || '',
      link: item.link || '',
      source: item.bloggername || item.publisher || '',
      type: apiEndpoint as 'blog' | 'news' | 'cafe' | 'other',
      date: item.postdate || item.pubDate || '',
      thumbnail: item.thumbnail || undefined,
    }));
  } catch (error) {
    console.error('Error searching Naver:', error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;
      throw new Error(`네이버 검색 API 오류: ${status} - ${message}`);
    }
    throw new Error('네이버 검색 API 호출 중 오류가 발생했습니다.');
  }
}