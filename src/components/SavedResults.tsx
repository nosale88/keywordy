import React, { useState } from 'react';
import { Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
import ResultCard from './ResultCard';
import { SearchResult } from '../types';

interface SavedResultsProps {
  savedResults: SearchResult[];
  onToggleSave: (result: SearchResult) => void;
}

const SavedResults: React.FC<SavedResultsProps> = ({ savedResults, onToggleSave }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (savedResults.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 transition-all duration-300 ease-in-out"
      style={{ 
        maxHeight: isOpen ? '70vh' : '56px',
        overflow: 'hidden'
      }}
    >
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Bookmark size={20} className="text-[#2DB400] mr-2" />
          <h3 className="font-medium">저장된 결과 ({savedResults.length})</h3>
        </div>
        <div className="flex items-center">
          {isOpen ? (
            <ChevronDown size={20} className="text-gray-600" />
          ) : (
            <ChevronUp size={20} className="text-gray-600" />
          )}
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 56px)' }}>
        <div className="grid grid-cols-1 gap-4">
          {savedResults.map((result) => (
            <ResultCard 
              key={result.id} 
              result={result} 
              isSaved={true}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedResults;