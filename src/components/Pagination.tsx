import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  isLoading
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If total pages is less than max pages to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust start and end to always show 3 pages in the middle
      if (start === 2) end = Math.min(totalPages - 1, start + 2);
      if (end === totalPages - 1) start = Math.max(2, end - 2);
      
      // Add ellipsis if needed
      if (start > 2) pages.push(-1); // -1 represents ellipsis
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) pages.push(-2); // -2 represents ellipsis
      
      // Always include last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>
      
      {getPageNumbers().map((page, index) => (
        page < 0 ? (
          <span key={`ellipsis-${index}`} className="px-2">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={page === currentPage || isLoading}
            className={`w-10 h-10 rounded-md ${
              page === currentPage
                ? 'bg-[#2DB400] text-white font-medium'
                : 'border border-gray-300 hover:bg-gray-100'
            } disabled:cursor-not-allowed transition-colors duration-200`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;