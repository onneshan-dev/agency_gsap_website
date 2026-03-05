import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  barColor?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  showPercentage = true,
  barColor = 'bg-[#2563EB]',
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('flex flex-col gap-[4px]', className)}>
      {showPercentage && (
        <span className="text-[11px] text-[#9A9AA0]">{clampedProgress}%</span>
      )}
      <div className="w-full h-[6px] bg-[#E2E8F0] rounded-[3px] overflow-hidden">
        <div
          className={cn('h-full rounded-[3px] transition-all duration-300', barColor)}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
