import React from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { SearchTag, ContentType } from '../types';

interface SearchTagsProps {
  tags: SearchTag[];
  onAddTag: (keyword: string, contentType: ContentType) => void;
  onRemoveTag: (id: string) => void;
  onSelectTag: (tag: SearchTag) => void;
}

const SearchTags: React.FC<SearchTagsProps> = ({
  tags,
  onAddTag,
  onRemoveTag,
  onSelectTag,
}) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newKeyword, setNewKeyword] = React.useState('');
  const [newContentType, setNewContentType] = React.useState<ContentType>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      onAddTag(newKeyword.trim(), newContentType);
      setNewKeyword('');
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={18} className="text-gray-600" />
        <h2 className="text-lg font-medium">검색 태그</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag)}
            className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
          >
            <span>{tag.keyword}</span>
            <X
              size={14}
              className="ml-2 text-gray-500 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTag(tag.id);
              }}
            />
          </button>
        ))}

        {isAdding ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="키워드 입력..."
              className="px-3 py-1 border rounded-lg text-sm"
              autoFocus
            />
            <select
              value={newContentType}
              onChange={(e) => setNewContentType(e.target.value as ContentType)}
              className="px-2 py-1 border rounded-lg text-sm"
            >
              <option value="all">전체</option>
              <option value="blog">블로그</option>
              <option value="news">뉴스</option>
              <option value="cafe">카페</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              추가
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
            >
              취소
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-3 py-1 rounded-full border border-dashed border-gray-300 hover:border-gray-400 text-sm text-gray-600"
          >
            <Plus size={14} className="mr-1" />
            태그 추가
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchTags;