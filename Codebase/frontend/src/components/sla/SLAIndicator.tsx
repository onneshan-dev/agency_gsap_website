import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SLAStatus {
  status: string;
  hours_in_status: number;
  sla_target_hours: number | null;
  sla_status: 'on_track' | 'warning' | 'breached' | 'no_sla';
  hours_remaining: number | null;
}

interface SLAIndicatorProps {
  proposalId: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const statusConfig = {
  on_track: {
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle,
    label: 'On Track',
  },
  warning: {
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertTriangle,
    label: 'At Risk',
  },
  breached: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    label: 'Overdue',
  },
  no_sla: {
    color: 'bg-gray-400',
    textColor: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: Clock,
    label: 'No SLA',
  },
};

export function SLAIndicator({
  proposalId,
  size = 'md',
  showDetails = true,
  className,
}: SLAIndicatorProps) {
  const [slaStatus, setSlaStatus] = useState<SLAStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSLAStatus();
  }, [proposalId]);

  const fetchSLAStatus = async () => {
    try {
      setLoading(true);
      const data = await api.get<SLAStatus>(`/api/sla/proposals/${proposalId}/status`);
      setSlaStatus(data);
    } catch (error) {
      console.error('Error fetching SLA status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('animate-pulse bg-gray-200 rounded', className)}>
        <div className={cn(
          'bg-gray-200 rounded-full',
          size === 'sm' && 'w-2 h-2',
          size === 'md' && 'w-3 h-3',
          size === 'lg' && 'w-4 h-4'
        )} />
      </div>
    );
  }

  if (!slaStatus) {
    return null;
  }

  const config = statusConfig[slaStatus.sla_status];
  const Icon = config.icon;

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    }
    return `${Math.round(hours / 24 * 10) / 10}d`;
  };

  const tooltipContent = (
    <div className="space-y-2">
      <p className="font-medium">{config.label}</p>
      {slaStatus.sla_target_hours && (
        <>
          <p className="text-sm text-gray-500">
            Time in status: {formatHours(slaStatus.hours_in_status)}
          </p>
          <p className="text-sm text-gray-500">
            SLA target: {formatHours(slaStatus.sla_target_hours)}
          </p>
          {slaStatus.hours_remaining !== null && (
            <p className={cn(
              'text-sm font-medium',
              slaStatus.hours_remaining < 0 ? 'text-red-500' : 'text-emerald-600'
            )}>
              {slaStatus.hours_remaining < 0
                ? `Overdue by ${formatHours(Math.abs(slaStatus.hours_remaining))}`
                : `${formatHours(slaStatus.hours_remaining)} remaining`}
            </p>
          )}
        </>
      )}
    </div>
  );

  if (size === 'sm') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('relative', className)}>
              <div className={cn('rounded-full', config.color, 'w-2 h-2')} />
            </div>
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-2 px-2.5 py-1 rounded-full border',
              config.bgColor,
              config.borderColor,
              className
            )}
          >
            <Icon className={cn('w-3.5 h-3.5', config.textColor)} />
            {showDetails && (
              <span className={cn('text-xs font-medium', config.textColor)}>
                {config.label}
                {slaStatus.sla_target_hours && (
                  <span className="ml-1 opacity-75">
                    · {formatHours(Math.abs(slaStatus.hours_remaining || 0))}
                    {slaStatus.hours_remaining && slaStatus.hours_remaining < 0 ? ' overdue' : ' left'}
                  </span>
                )}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SLAStatusBadge({ status, size = 'md' }: { status: SLAStatus['sla_status']; size?: 'sm' | 'md' }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs', config.textColor)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        config.bgColor,
        config.borderColor,
        config.textColor
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}