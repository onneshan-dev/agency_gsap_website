import { cn } from '@/lib/utils';

type TaskStatus = 'in_progress' | 'in_review' | 'done' | 'todo';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig = {
  in_progress: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#2563EB]',
    dot: 'bg-[#2563EB]',
    label: 'In Progress',
  },
  in_review: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    dot: 'bg-[#D97706]',
    label: 'In Review',
  },
  done: {
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#059669]',
    dot: 'bg-[#059669]',
    label: 'Done',
  },
  todo: {
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#6B7280]',
    dot: 'bg-[#6B7280]',
    label: 'To Do',
  },
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-[6px]',
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

export type { TaskStatus };
