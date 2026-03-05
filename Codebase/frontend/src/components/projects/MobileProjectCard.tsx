import { StatusBadge, type Status } from './StatusBadge';
import { cn } from '@/lib/utils';

interface MobileProjectCardProps {
  id: string;
  name: string;
  type: string;
  badgeColor: string;
  badgeTextColor: string;
  status: Status;
  progress: number;
  client: string;
  dueDate: string;
  className?: string;
  onClick?: (id: string) => void;
}

export function MobileProjectCard({
  id,
  name,
  type,
  badgeColor,
  badgeTextColor,
  status,
  progress,
  client,
  dueDate,
  className,
  onClick,
}: MobileProjectCardProps) {
  return (
    <div
      onClick={() => onClick?.(id)}
      className={cn(
        'bg-white border border-[#E5E3DE] rounded-[12px] p-4 flex flex-col gap-3 cursor-pointer hover:border-[#2D5A3D] hover:shadow-sm transition-all',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[16px] font-bold',
              badgeColor,
              badgeTextColor
            )}
          >
            {name.charAt(0)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-semibold text-[#1A1A1E]">{name}</span>
            <span className="text-[12px] text-[#9A9AA0]">{type}</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#9A9AA0]">Progress</span>
          <span className="text-[12px] font-semibold text-[#1A1A1E]">{progress}%</span>
        </div>
        <div className="w-full h-[6px] bg-[#E2E8F0] rounded-[3px] overflow-hidden">
          <div
            className="h-full bg-[#2563EB] rounded-[3px] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-[12px] text-[#9A9AA0]">
        {client} · {dueDate}
      </div>
    </div>
  );
}
