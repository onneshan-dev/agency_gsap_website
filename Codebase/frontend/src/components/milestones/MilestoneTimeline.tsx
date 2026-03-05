import { format } from 'date-fns';
import {
  CheckCircle2,
  Circle,
  Clock,
  MinusCircle,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Milestone } from '@/types/supabase';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  isAdmin?: boolean;
  onUpdate?: (id: string, data: Partial<Milestone>) => void;
}

type MilestoneStatus = Milestone['status'];

const STATUS_CONFIG: Record<
  MilestoneStatus,
  { icon: React.ElementType; color: string; lineColor: string; label: string }
> = {
  pending: {
    icon: Circle,
    color: 'text-[var(--admin-text-muted)] border-[var(--admin-border)] bg-[var(--admin-surface)]',
    lineColor: 'bg-[var(--admin-border)]',
    label: 'Pending',
  },
  in_progress: {
    icon: Clock,
    color: 'text-blue-600 border-blue-200 bg-blue-50',
    lineColor: 'bg-blue-200',
    label: 'In Progress',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-600 border-green-200 bg-green-50',
    lineColor: 'bg-green-400',
    label: 'Completed',
  },
  skipped: {
    icon: MinusCircle,
    color: 'text-[var(--admin-text-muted)] border-dashed border-[var(--admin-border)] bg-[var(--admin-bg)]',
    lineColor: 'bg-[var(--admin-border)] [mask-image:repeating-linear-gradient(0deg,transparent,transparent_4px,black_4px,black_8px)]',
    label: 'Skipped',
  },
};

const PHASE_COLORS: Record<string, string> = {
  requirements: 'bg-purple-100 text-purple-700',
  design: 'bg-pink-100 text-pink-700',
  development: 'bg-blue-100 text-blue-700',
  testing: 'bg-amber-100 text-amber-700',
  review: 'bg-cyan-100 text-cyan-700',
  revision: 'bg-orange-100 text-orange-700',
  delivery: 'bg-green-100 text-green-700',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  not_applicable: '',
  pending: 'text-amber-600',
  invoiced: 'text-blue-600',
  paid: 'text-green-600',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MilestoneTimeline({
  milestones,
  isAdmin = false,
  onUpdate,
}: MilestoneTimelineProps) {
  const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-10 w-10 text-[var(--admin-text-muted)]/40 mb-3" />
        <p className="text-sm text-[var(--admin-text-muted)]">No milestones yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {sorted.map((milestone, index) => {
        const config = STATUS_CONFIG[milestone.status];
        const StatusIcon = config.icon;
        const isLast = index === sorted.length - 1;

        return (
          <div key={milestone.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${config.color}`}
              >
                <StatusIcon className="h-5 w-5" />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 mt-2 ${config.lineColor}`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-2 pt-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--admin-text-primary)] leading-tight">
                    {milestone.title}
                  </h4>
                  {milestone.description && (
                    <p className="mt-1 text-xs text-[var(--admin-text-muted)] line-clamp-2">
                      {milestone.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    className={`text-[10px] font-medium px-2 py-0.5 border-0 ${
                      PHASE_COLORS[milestone.phase] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {milestone.phase.replace('_', ' ')}
                  </Badge>

                  {isAdmin && onUpdate ? (
                    <Select
                      value={milestone.status}
                      onValueChange={(value: MilestoneStatus) =>
                        onUpdate(milestone.id, { status: value })
                      }
                    >
                      <SelectTrigger size="sm" className="h-7 text-xs w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="skipped">Skipped</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${
                        milestone.status === 'completed'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : milestone.status === 'in_progress'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : milestone.status === 'skipped'
                          ? 'border-dashed border-[var(--admin-border)] text-[var(--admin-text-muted)]'
                          : 'border-[var(--admin-border)] text-[var(--admin-text-muted)]'
                      }`}
                    >
                      {config.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--admin-text-muted)]">
                {milestone.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                  </span>
                )}

                {milestone.payment_amount > 0 &&
                  milestone.payment_status !== 'not_applicable' && (
                    <span
                      className={`flex items-center gap-1 ${
                        PAYMENT_STATUS_COLORS[milestone.payment_status] || ''
                      }`}
                    >
                      <CreditCard className="h-3 w-3" />
                      {formatCurrency(milestone.payment_amount)}
                      <span className="capitalize">
                        · {milestone.payment_status.replace('_', ' ')}
                      </span>
                    </span>
                  )}

                {milestone.completed_at && (
                  <span className="text-green-600">
                    Completed {format(new Date(milestone.completed_at), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
