import { Search, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectsFilterBarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

export function ProjectsFilterBar({
  viewMode,
  onViewModeChange,
  className,
}: ProjectsFilterBarProps) {
  return (
    <div
      className={cn(
        'bg-white border border-[#E5E3DE] rounded-[12px] px-5 py-4 flex items-center gap-3',
        className
      )}
    >
      {/* Search Input */}
      <div className="flex-1 h-[38px] bg-white border border-[#E5E3DE] rounded-[8px] px-3 flex items-center gap-2 focus-within:border-[#2D5A3D] transition-colors">
        <Search className="w-4 h-4 text-[#9A9AA0]" />
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 bg-transparent text-sm text-[#1A1A1E] placeholder:text-[#9A9AA0] outline-none"
        />
      </div>

      {/* Status Dropdown */}
      <button className="h-[38px] px-3 bg-white border border-[#E5E3DE] rounded-[8px] flex items-center gap-1.5 text-[13px] font-medium text-[#5F5F67] hover:bg-[#F8F7F4] transition-colors">
        All Status
        <ChevronDown className="w-3.5 h-3.5 text-[#9A9AA0]" />
      </button>

      {/* Client Dropdown */}
      <button className="h-[38px] px-3 bg-white border border-[#E5E3DE] rounded-[8px] flex items-center gap-1.5 text-[13px] font-medium text-[#5F5F67] hover:bg-[#F8F7F4] transition-colors">
        All Clients
        <ChevronDown className="w-3.5 h-3.5 text-[#9A9AA0]" />
      </button>

      {/* Sort Dropdown */}
      <button className="h-[38px] px-3 bg-white border border-[#E5E3DE] rounded-[8px] flex items-center gap-1.5 text-[13px] font-medium text-[#5F5F67] hover:bg-[#F8F7F4] transition-colors">
        Sort: Due Date
        <ChevronDown className="w-3.5 h-3.5 text-[#9A9AA0]" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* View Toggle */}
      <div className="bg-[#F8F7F4] rounded-[8px] p-1 flex items-center gap-0.5">
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'w-[30px] h-[30px] rounded-[6px] flex items-center justify-center transition-colors',
            viewMode === 'grid' ? 'bg-[#2D5A3D]' : 'hover:bg-white/50'
          )}
        >
          <LayoutGrid
            className={cn(
              'w-[15px] h-[15px]',
              viewMode === 'grid' ? 'text-white' : 'text-[#9A9AA0]'
            )}
          />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            'w-[30px] h-[30px] rounded-[6px] flex items-center justify-center transition-colors',
            viewMode === 'list' ? 'bg-[#2D5A3D]' : 'hover:bg-white/50'
          )}
        >
          <List
            className={cn(
              'w-[15px] h-[15px]',
              viewMode === 'list' ? 'text-white' : 'text-[#9A9AA0]'
            )}
          />
        </button>
      </div>
    </div>
  );
}
