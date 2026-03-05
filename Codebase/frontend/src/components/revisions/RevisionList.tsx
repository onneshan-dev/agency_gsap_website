import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Revision } from '@/types/supabase';

interface RevisionListProps {
  projectId: string;
  isAdmin?: boolean;
}

type RevisionStatus = Revision['status'];

const STATUS_CONFIG: Record<
  RevisionStatus,
  { icon: React.ElementType; color: string; badgeClass: string; label: string }
> = {
  requested: {
    icon: AlertCircle,
    color: 'text-amber-500 bg-amber-50',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    label: 'Requested',
  },
  in_progress: {
    icon: Clock,
    color: 'text-blue-500 bg-blue-50',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    label: 'In Progress',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500 bg-green-50',
    badgeClass: 'border-green-200 bg-green-50 text-green-700',
    label: 'Completed',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-500 bg-red-50',
    badgeClass: 'border-red-200 bg-red-50 text-red-700',
    label: 'Rejected',
  },
};

interface RevisionWithRequester extends Revision {
  requested_by_profile?: { full_name: string | null };
}

export default function RevisionList({ projectId, isAdmin = false }: RevisionListProps) {
  const [revisions, setRevisions] = useState<RevisionWithRequester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRevisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<RevisionWithRequester[]>(
        `/api/projects/${projectId}/revisions`
      );
      setRevisions(data);
    } catch (err) {
      console.error('Failed to fetch revisions:', err);
      toast.error('Failed to load revisions');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const handleStatusChange = async (revisionId: string, status: RevisionStatus) => {
    setUpdatingId(revisionId);
    try {
      await api.patch(`/api/projects/${projectId}/revisions/${revisionId}`, { status });
      setRevisions((prev) =>
        prev.map((r) => (r.id === revisionId ? { ...r, status } : r))
      );
      toast.success(`Revision marked as ${status.replace('_', ' ')}`);
    } catch (err) {
      console.error('Failed to update revision:', err);
      toast.error('Failed to update revision');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (revisionId: string) => {
    setUpdatingId(revisionId);
    try {
      await api.patch(`/api/projects/${projectId}/revisions/${revisionId}`, {
        admin_notes: adminNotes,
      });
      setRevisions((prev) =>
        prev.map((r) =>
          r.id === revisionId ? { ...r, admin_notes: adminNotes } : r
        )
      );
      setEditingId(null);
      setAdminNotes('');
      toast.success('Notes saved');
    } catch (err) {
      console.error('Failed to save notes:', err);
      toast.error('Failed to save notes');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-text-muted)]" />
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <RotateCcw className="h-10 w-10 text-[var(--admin-text-muted)]/40 mb-3" />
        <p className="text-sm text-[var(--admin-text-muted)]">No revisions requested</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {revisions.map((revision, index) => {
        const config = STATUS_CONFIG[revision.status];
        const StatusIcon = config.icon;
        const isLast = index === revisions.length - 1;

        return (
          <div key={revision.id}>
            <div className="flex gap-4 py-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.color}`}
                >
                  <StatusIcon className="h-4 w-4" />
                </div>
                {!isLast && <div className="w-0.5 flex-1 mt-2 bg-[var(--admin-border)]" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--admin-primary)] text-[10px] font-bold text-white">
                      #{revision.revision_number}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
                      {config.label}
                    </Badge>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={revision.status}
                        onValueChange={(value: RevisionStatus) =>
                          handleStatusChange(revision.id, value)
                        }
                        disabled={updatingId === revision.id}
                      >
                        <SelectTrigger size="sm" className="h-7 text-xs w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="requested">Requested</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <p className="text-sm text-[var(--admin-text-primary)] leading-relaxed">
                  {revision.description}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--admin-text-muted)]">
                  <span>
                    {formatDistanceToNow(new Date(revision.created_at), { addSuffix: true })}
                  </span>
                  {revision.requested_by_profile?.full_name && (
                    <span>by {revision.requested_by_profile.full_name}</span>
                  )}
                  {revision.resolved_at && (
                    <span className="text-green-600">
                      Resolved {format(new Date(revision.resolved_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                {/* Admin notes display */}
                {revision.admin_notes && editingId !== revision.id && (
                  <div className="mt-3 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageSquare className="h-3 w-3 text-[var(--admin-text-muted)]" />
                      <span className="text-[11px] font-medium text-[var(--admin-text-muted)]">
                        Admin Notes
                      </span>
                    </div>
                    <p className="text-xs text-[var(--admin-text-secondary)]">
                      {revision.admin_notes}
                    </p>
                  </div>
                )}

                {/* Admin notes editor */}
                {isAdmin && editingId === revision.id && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this revision..."
                      className="text-sm min-h-[80px] border-[var(--admin-border)] bg-[var(--admin-surface)]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90"
                        onClick={() => handleSaveNotes(revision.id)}
                        disabled={updatingId === revision.id}
                      >
                        {updatingId === revision.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setEditingId(null);
                          setAdminNotes('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {isAdmin && editingId !== revision.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 px-2 text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]"
                    onClick={() => {
                      setEditingId(revision.id);
                      setAdminNotes(revision.admin_notes || '');
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {revision.admin_notes ? 'Edit notes' : 'Add notes'}
                  </Button>
                )}
              </div>
            </div>
            {!isLast && <Separator className="bg-[var(--admin-border)] ml-[52px]" />}
          </div>
        );
      })}
    </div>
  );
}
