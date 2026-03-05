import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Clock, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export interface StatusDurationEntry {
  id: string;
  proposal_id: string;
  status: string;
  entered_at: string;
  exited_at?: string;
  duration_seconds?: number;
  assigned_to?: string | null;
  assigned_to_profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  } | null;
  sla_target_hours?: number | null;
  sla_met?: boolean | null;
  notes?: string | null;
}

interface TimeInStatusProps {
  proposalId: string;
  className?: string;
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  in_discussion: 'In Discussion',
  quoted: 'Quoted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  converted: 'Converted',
};

export function TimeInStatus({ proposalId, className }: TimeInStatusProps) {
  const [timeline, setTimeline] = useState<StatusDurationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [proposalId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const data = await api.get<StatusDurationEntry[]>(`/api/sla/proposals/${proposalId}/timeline`);
      setTimeline(data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'In progress';
    
    const hours = seconds / 3600;
    if (hours < 1) {
      return `${Math.round(seconds / 60)} minutes`;
    }
    if (hours < 24) {
      return `${Math.round(hours)} hours`;
    }
    const days = hours / 24;
    if (days < 30) {
      return `${Math.round(days * 10) / 10} days`;
    }
    return `${Math.round(days / 30 * 10) / 10} months`;
  };

  if (loading) {
    return (
      <div className={cn('space-y-3 animate-pulse', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No timeline data available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {timeline.map((entry, index) => (
        <div
          key={entry.id}
          className={cn(
            'relative pl-6 pb-4',
            index !== timeline.length - 1 && 'border-l-2 border-gray-200'
          )}
        >
          {/* Timeline dot */}
          <div
            className={cn(
              'absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-[7px]',
              !entry.exited_at ? 'bg-admin-primary ring-4 ring-admin-primary/20' : 'bg-gray-300'
            )}
          />

          <div className="space-y-1">
            {/* Status label */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-admin-text-primary">
                {statusLabels[entry.status] || entry.status}
              </span>
              {entry.sla_met === false && (
                <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                  SLA Missed
                </span>
              )}
              {entry.sla_met === true && (
                <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded">
                  SLA Met
                </span>
              )}
            </div>

            {/* Duration */}
            <div className="text-sm text-admin-text-secondary">
              {entry.duration_seconds ? (
                <span className="font-medium">{formatDuration(entry.duration_seconds)}</span>
              ) : (
                <span className="text-admin-primary font-medium">
                  {formatDistanceToNow(new Date(entry.entered_at), { addSuffix: true })}
                </span>
              )}
              {entry.sla_target_hours && (
                <span className="text-xs text-gray-400 ml-2">
                  (Target: {entry.sla_target_hours}h)
                </span>
              )}
            </div>

            {/* Assignment */}
            {entry.assigned_to_profile && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>Assigned to {entry.assigned_to_profile.full_name}</span>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-400">
              {format(new Date(entry.entered_at), 'MMM d, yyyy · h:mm a')}
              {entry.exited_at && (
                <span> → {format(new Date(entry.exited_at), 'MMM d, yyyy · h:mm a')}</span>
              )}
            </div>

            {/* Notes */}
            {entry.notes && (
              <p className="text-xs text-gray-500 italic mt-1">{entry.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CurrentStatusTime({ enteredAt, className }: { enteredAt: string; className?: string }) {
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeDisplay(formatDistanceToNow(new Date(enteredAt), { addSuffix: false }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [enteredAt]);

  return (
    <span className={cn('text-sm text-gray-500', className)}>
      {timeDisplay}
    </span>
  );
}