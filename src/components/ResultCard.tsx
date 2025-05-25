import React from 'react';
import { ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { SearchResult } from '../types';

interface ResultCardProps {
  result: SearchResult;
  isSaved: boolean;
  onToggleSave: (result: SearchResult) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, isSaved, onToggleSave }) => {
  // Early return if result is invalid
  if (!result || typeof result !== 'object') {
    return null;
  }

  // Safe destructuring with default values
  const { 
    title = '',
    content = '',
    link = '',
    source = '',
    type = '기타',
    date = '',
    thumbnail = '' 
  } = result;
  
  // Determine badge color based on content type
  const getBadgeColor = () => {
    const contentType = (type || '').toLowerCase();
    switch (contentType) {
      case 'blog':
        return 'bg-emerald-100 text-emerald-800';
      case 'news':
        return 'bg-blue-100 text-blue-800';
      case 'cafe':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format content type for display
  const getTypeLabel = () => {
    const contentType = (type || '').toLowerCase();
    switch (contentType) {
      case 'blog':
        return '블로그';
      case 'news':
        return '뉴스';
      case 'cafe':
        return '카페';
      default:
        return '기타';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor()} mr-2`}>
              {getTypeLabel()}
            </span>
            {source && (
              <span className="text-sm text-gray-600">{source}</span>
            )}
          </div>
          <button 
            onClick={() => onToggleSave(result)}
            className="text-gray-400 hover:text-[#2DB400] transition-colors duration-200"
            aria-label={isSaved ? "북마크 제거" : "북마크 추가"}
          >
            {isSaved ? <BookmarkCheck size={20} className="text-[#2DB400]" /> : <Bookmark size={20} />}
          </button>
        </div>
        
        <div className="flex gap-4">
          {thumbnail && (
            <div className="flex-shrink-0 w-24 h-24">
              <img src={thumbnail} alt={title} className="w-full h-full object-cover rounded-md" />
            </div>
          )}
          
          <div className="flex-grow">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2" dangerouslySetInnerHTML={{ __html: title }} />
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-3" dangerouslySetInnerHTML={{ __html: content }} />
            
            <div className="flex justify-between items-center">
              {date && <span className="text-xs text-gray-500">{date}</span>}
              
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-[#2DB400] hover:text-[#249900] transition-colors duration-200"
              >
                자세히 보기 <ExternalLink size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;