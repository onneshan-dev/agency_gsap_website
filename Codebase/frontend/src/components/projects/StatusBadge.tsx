import { cn } from '@/lib/utils';

type Status = 'in_progress' | 'completed' | 'pending' | 'on_hold';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  in_progress: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#2563EB]',
    dot: 'bg-[#2563EB]',
    label: 'In Progress',
  },
  completed: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#16A34A]',
    dot: 'bg-[#16A34A]',
    label: 'Completed',
  },
  pending: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#B45309]',
    dot: 'bg-[#B45309]',
    label: 'Pending',
  },
  on_hold: {
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#6B7280]',
    dot: 'bg-[#6B7280]',
    label: 'On Hold',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-[20px]',
        config.bg,
        className
      )}
    >
      <span className={cn('w-[6px] h-[6px] rounded-full', config.dot)} />
      <span className={cn('text-[12px] font-medium', config.text)}>
        {config.label}
      </span>
    </span>
  );
}

export type { Status };
