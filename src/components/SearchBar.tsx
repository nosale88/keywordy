import React, { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { ContentType } from '../types';

interface SearchBarProps {
  onSearch: (query: string, contentType: ContentType) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [contentType, setContentType] = useState<ContentType>('all');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, contentType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        </div>
        
        <div className="flex gap-2">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm bg-white"
            disabled={isLoading}
          >
            <option value="all">전체</option>
            <option value="blog">블로그</option>
            <option value="news">뉴스</option>
            <option value="cafe">카페</option>
          </select>
          
          <button
            type="submit"
            className="px-6 py-3 bg-[#2DB400] text-white rounded-lg hover:bg-[#249900] transition-colors duration-200 shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;