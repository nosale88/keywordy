import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import SearchBar from './components/SearchBar';
import SearchTags from './components/SearchTags';
import ScheduledSearches from './components/ScheduledSearches';
import ResultsList from './components/ResultsList';
import Pagination from './components/Pagination';
import SavedResults from './components/SavedResults';
import { searchNaver } from './utils/api';
import { SearchResult, ContentType, SearchTag, ScheduledSearch } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedResults, setSavedResults] = useState<SearchResult[]>([]);
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]);
  const [scheduledSearches, setScheduledSearches] = useState<ScheduledSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load saved data from localStorage on initial render
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedItems = localStorage.getItem('naverCrawlerSavedResults');
        if (savedItems) {
          setSavedResults(JSON.parse(savedItems));
        }

        const savedTags = localStorage.getItem('naverCrawlerSearchTags');
        if (savedTags) {
          setSearchTags(JSON.parse(savedTags));
        }

        const savedSchedules = localStorage.getItem('naverCrawlerScheduledSearches');
        if (savedSchedules) {
          setScheduledSearches(JSON.parse(savedSchedules));
        }
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    };

    loadSavedData();
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('naverCrawlerSavedResults', JSON.stringify(savedResults));
  }, [savedResults]);

  useEffect(() => {
    localStorage.setItem('naverCrawlerSearchTags', JSON.stringify(searchTags));
  }, [searchTags]);

  useEffect(() => {
    localStorage.setItem('naverCrawlerScheduledSearches', JSON.stringify(scheduledSearches));
  }, [scheduledSearches]);

  const fetchResults = useCallback(async (searchQuery: string, type: ContentType, page: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchNaver(searchQuery, type, page);
      setResults(searchResults);
      setTotalPages(Math.max(5, page + (searchResults.length > 0 ? 4 : 0)));
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (searchQuery: string, type: ContentType) => {
    setQuery(searchQuery);
    setContentType(type);
    setCurrentPage(1);
    fetchResults(searchQuery, type, 1);
  }, [fetchResults]);

  // Handle scheduled searches
  useEffect(() => {
    const checkScheduledSearches = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
      const currentDay = now.getDay();

      scheduledSearches.forEach((schedule) => {
        if (!schedule.isActive) return;

        const { type, time, days } = schedule.schedule;
        if (time !== currentTime) return;

        if (type === 'weekly' && !days?.includes(currentDay)) return;

        // Perform searches for all tags
        schedule.searchTags.forEach(tag => {
          handleSearch(tag.keyword, tag.contentType);
        });
      });
    };

    const interval = setInterval(checkScheduledSearches, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [scheduledSearches, handleSearch]);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResults(query, contentType, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = (result: SearchResult) => {
    setSavedResults(prev => {
      const isAlreadySaved = prev.some(item => item.id === result.id);
      return isAlreadySaved
        ? prev.filter(item => item.id !== result.id)
        : [...prev, result];
    });
  };

  const handleAddTag = (keyword: string, type: ContentType) => {
    const newTag: SearchTag = {
      id: `tag-${Date.now()}`,
      keyword,
      contentType: type,
    };
    setSearchTags(prev => [...prev, newTag]);
  };

  const handleRemoveTag = (id: string) => {
    setSearchTags(prev => prev.filter(tag => tag.id !== id));
    setScheduledSearches(prev => prev.filter(schedule => !schedule.searchTags.some(tag => tag.id === id)));
  };

  const handleSelectTag = (tag: SearchTag) => {
    handleSearch(tag.keyword, tag.contentType);
  };

  const handleAddSchedule = (schedule: Omit<ScheduledSearch, 'id'>) => {
    const newSchedule: ScheduledSearch = {
      ...schedule,
      id: `schedule-${Date.now()}`,
    };
    setScheduledSearches(prev => [...prev, newSchedule]);
  };

  const handleRemoveSchedule = (id: string) => {
    setScheduledSearches(prev => prev.filter(schedule => schedule.id !== id));
  };

  const handleToggleSchedule = (id: string) => {
    setScheduledSearches(prev =>
      prev.map(schedule =>
        schedule.id === id
          ? { ...schedule, isActive: !schedule.isActive }
          : schedule
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-6">
            <SearchIcon size={28} className="text-[#2DB400] mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">네이버 검색 크롤러</h1>
          </div>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Search Tags */}
        <SearchTags
          tags={searchTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onSelectTag={handleSelectTag}
        />

        {/* Scheduled Searches */}
        <ScheduledSearches
          scheduledSearches={scheduledSearches}
          searchTags={searchTags}
          onAddSchedule={handleAddSchedule}
          onRemoveSchedule={handleRemoveSchedule}
          onToggleSchedule={handleToggleSchedule}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Search Stats */}
        {query && !isLoading && !error && (
          <div className="mb-6">
            <p className="text-gray-600">
              <span className="font-medium">"{query}"</span>에 대한 검색 결과 
              {results.length > 0 && ` (${results.length}개)`}
            </p>
          </div>
        )}

        {/* Results */}
        <ResultsList 
          results={results} 
          savedResults={savedResults}
          onToggleSave={handleToggleSave}
          isLoading={isLoading}
        />

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />

        {/* Empty State */}
        {!query && !isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <SearchIcon size={64} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">검색어를 입력하세요</h2>
            <p className="text-gray-500 text-center max-w-md">
              네이버에서 블로그, 뉴스, 카페 등의 콘텐츠를 검색하고 결과를 확인할 수 있습니다.
            </p>
          </div>
        )}
      </main>

      {/* Saved Results */}
      <SavedResults 
        savedResults={savedResults}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}

export default App