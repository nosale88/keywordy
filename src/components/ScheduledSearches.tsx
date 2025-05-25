import React from 'react';
import { Clock, Plus, X, Check } from 'lucide-react';
import { ScheduledSearch, SearchTag } from '../types';

interface ScheduledSearchesProps {
  scheduledSearches: ScheduledSearch[];
  searchTags: SearchTag[];
  onAddSchedule: (schedule: Omit<ScheduledSearch, 'id'>) => void;
  onRemoveSchedule: (id: string) => void;
  onToggleSchedule: (id: string) => void;
}

const ScheduledSearches: React.FC<ScheduledSearchesProps> = ({
  scheduledSearches,
  searchTags,
  onAddSchedule,
  onRemoveSchedule,
  onToggleSchedule,
}) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [scheduleType, setScheduleType] = React.useState<'daily' | 'weekly'>('daily');
  const [time, setTime] = React.useState('09:00');
  const [selectedDays, setSelectedDays] = React.useState<number[]>([1]); // Monday by default

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTags.length > 0) {
      const tags = searchTags.filter(t => selectedTags.includes(t.id));
      if (tags.length > 0) {
        onAddSchedule({
          searchTags: tags,
          schedule: {
            type: scheduleType,
            time,
            days: scheduleType === 'weekly' ? selectedDays : undefined,
          },
          isActive: true,
        });
        setIsAdding(false);
        setSelectedTags([]);
      }
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={18} className="text-gray-600" />
        <h2 className="text-lg font-medium">예약 검색</h2>
      </div>

      <div className="space-y-3">
        {scheduledSearches.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleSchedule(schedule.id)}
                className={`w-5 h-5 rounded ${
                  schedule.isActive ? 'bg-green-500' : 'bg-gray-200'
                } flex items-center justify-center`}
              >
                {schedule.isActive && <Check size={14} className="text-white" />}
              </button>
              <div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {schedule.searchTags.map(tag => (
                    <span key={tag.id} className="text-sm px-2 py-0.5 bg-gray-100 rounded">
                      {tag.keyword}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {schedule.schedule.type === 'daily'
                    ? '매일'
                    : `매주 ${schedule.schedule.days
                        ?.map((d) => weekDays[d])
                        .join(', ')}`}{' '}
                  {schedule.schedule.time}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemoveSchedule(schedule.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <X size={18} />
            </button>
          </div>
        ))}

        {isAdding ? (
          <form onSubmit={handleSubmit} className="p-3 bg-white rounded-lg border">
            <div className="grid gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">검색 태그 선택</label>
                <div className="flex flex-wrap gap-2">
                  {searchTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {tag.keyword}
                    </button>
                  ))}
                </div>
                {selectedTags.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    최소 하나의 태그를 선택해주세요
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">반복 주기</label>
                <select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value as 'daily' | 'weekly')}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                </select>
              </div>

              {scheduleType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium mb-1">요일 선택</label>
                  <div className="flex gap-2">
                    {weekDays.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setSelectedDays((prev) =>
                            prev.includes(index)
                              ? prev.filter((d) => d !== index)
                              : [...prev, index]
                          );
                        }}
                        className={`w-8 h-8 rounded-full ${
                          selectedDays.includes(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">시간</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setSelectedTags([]);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={selectedTags.length === 0}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  추가
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full p-3 border border-dashed rounded-lg text-gray-600 hover:border-gray-400"
          >
            <Plus size={18} className="mx-auto mb-1" />
            <span className="text-sm">새 예약 검색 추가</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduledSearches