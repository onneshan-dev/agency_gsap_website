import { cn } from '@/lib/utils';

type Priority = 'high' | 'medium' | 'low';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig = {
  high: {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#EF4444]',
    label: 'High',
  },
  medium: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    label: 'Medium',
  },
  low: {
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#059669]',
    label: 'Low',
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-[10px] py-[4px] rounded-[6px] text-[12px] font-medium min-w-[70px]',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export type { Priority };
