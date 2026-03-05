import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'active' | 'completed' | 'pending';

interface ProjectFilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  className?: string;
}

const tabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'pending', label: 'Pending' },
];

export function ProjectFilterTabs({
  activeTab,
  onTabChange,
  className,
}: ProjectFilterTabsProps) {
  return (
    <div className={cn('flex gap-1.5 overflow-x-auto scrollbar-hide', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-3.5 py-[7px] rounded-[20px] text-[13px] whitespace-nowrap transition-colors',
            activeTab === tab.id
              ? 'bg-[#2D5A3D] text-white font-semibold'
              : 'bg-white border border-[#E5E3DE] text-[#5F5F67] font-normal hover:bg-[#F8F7F4]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export type { FilterTab };
