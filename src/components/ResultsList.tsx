import React from 'react';
import ResultCard from './ResultCard';
import { SearchResult } from '../types';

interface ResultsListProps {
  results: SearchResult[];
  savedResults: SearchResult[];
  onToggleSave: (result: SearchResult) => void;
  isLoading: boolean;
}

const ResultsList: React.FC<ResultsListProps> = ({ 
  results, 
  savedResults, 
  onToggleSave, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#2DB400] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">검색 결과를 불러오는 중...</p>
      </div>
    );
  }

  // Ensure results is an array and handle null/undefined values
  const validResults = (Array.isArray(results) ? results : [])
    .filter((result): result is SearchResult => 
      result != null && 
      typeof result === 'object' &&
      'id' in result
    );

  if (validResults.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-2">검색 결과가 없습니다.</p>
        <p className="text-gray-500 text-sm">다른 검색어를 입력해보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {validResults.map((result) => (
        <ResultCard 
          key={result.id} 
          result={result} 
          isSaved={savedResults.some(saved => saved.id === result.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
};

export default ResultsList;