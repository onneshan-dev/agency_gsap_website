import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import {
  GitCommit,
  FileText,
  MessageSquare,
  DollarSign,
  Edit3,
  Upload,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Revision {
  id: string;
  proposal_id: string;
  revision_number: number;
  changed_by: string;
  changed_by_name?: string;
  changed_by_email?: string;
  changed_by_avatar?: string;
  change_type: 'status_change' | 'content_edit' | 'quote_update' | 'admin_notes' | 'document_upload' | 'initial';
  changed_fields: string[];
  previous_values: Record<string, any>;
  new_values: Record<string, any>;
  change_reason?: string;
  snapshot: Record<string, any>;
  created_at: string;
}

interface RevisionTimelineProps {
  proposalId: string;
  className?: string;
}

const changeTypeConfig: Record<string, { label: string; icon: typeof GitCommit; color: string }> = {
  status_change: { label: 'Status Change', icon: RotateCcw, color: 'text-blue-500 bg-blue-50' },
  content_edit: { label: 'Content Edited', icon: Edit3, color: 'text-amber-500 bg-amber-50' },
  quote_update: { label: 'Quote Updated', icon: DollarSign, color: 'text-emerald-500 bg-emerald-50' },
  admin_notes: { label: 'Admin Notes', icon: MessageSquare, color: 'text-purple-500 bg-purple-50' },
  document_upload: { label: 'Document Uploaded', icon: Upload, color: 'text-indigo-500 bg-indigo-50' },
  initial: { label: 'Created', icon: FileText, color: 'text-gray-500 bg-gray-50' },
};

const fieldLabels: Record<string, string> = {
  status: 'Status',
  title: 'Title',
  description: 'Description',
  category: 'Category',
  budget_range: 'Budget Range',
  timeline_preference: 'Timeline',
  admin_notes: 'Admin Notes',
  documents: 'Documents',
};

const formatValue = (field: string, value: any): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 100);
  return String(value);
};

export function RevisionTimeline({ proposalId, className }: RevisionTimelineProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRevisions, setExpandedRevisions] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchRevisions();
  }, [proposalId]);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const data = await api.get<Revision[]>(`/api/proposals/${proposalId}/revisions`);
      setRevisions(data);
    } catch (error) {
      console.error('Error fetching revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (revisionNumber: number) => {
    setExpandedRevisions(prev => {
      const next = new Set(prev);
      if (next.has(revisionNumber)) {
        next.delete(revisionNumber);
      } else {
        next.add(revisionNumber);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className={cn('space-y-4 animate-pulse', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No revision history available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {revisions.map((revision, index) => {
        const config = changeTypeConfig[revision.change_type] || changeTypeConfig.initial;
        const Icon = config.icon;
        const isExpanded = expandedRevisions.has(revision.revision_number);
        const isLatest = index === 0;

        return (
          <div
            key={revision.id}
            className={cn(
              'relative pl-8 pb-4',
              index !== revisions.length - 1 && 'border-l-2 border-gray-200'
            )}
          >
            {/* Timeline dot */}
            <div
              className={cn(
                'absolute left-0 top-0 w-5 h-5 rounded-full -translate-x-[11px] flex items-center justify-center',
                config.color,
                isLatest && 'ring-2 ring-offset-2 ring-admin-primary'
              )}
            >
              <Icon className="w-2.5 h-2.5" />
            </div>

            <div className="bg-admin-surface border border-admin-border rounded-lg p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.color)}>
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      Rev #{revision.revision_number}
                    </span>
                    {isLatest && (
                      <span className="text-xs text-admin-primary font-medium">
                        Latest
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(revision.created_at), { addSuffix: true })}
                    <span className="text-gray-300 mx-1">·</span>
                    {format(new Date(revision.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>

                {/* User avatar/name */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {revision.changed_by_avatar ? (
                    <img
                      src={revision.changed_by_avatar}
                      alt={revision.changed_by_name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  <span className="hidden sm:inline">{revision.changed_by_name || revision.changed_by_email}</span>
                </div>
              </div>

              {/* Change reason */}
              {revision.change_reason && (
                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                  {revision.change_reason}
                </p>
              )}

              {/* Changed fields summary */}
              {revision.changed_fields.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => toggleExpand(revision.revision_number)}
                    className="flex items-center gap-1 text-xs text-admin-primary hover:underline"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Hide changes' : `Show ${revision.changed_fields.length} change${revision.changed_fields.length > 1 ? 's' : ''}`}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 text-sm">
                      {revision.changed_fields.map((field) => (
                        <div key={field} className="bg-gray-50 rounded p-2">
                          <p className="font-medium text-gray-700 mb-1">
                            {fieldLabels[field] || field}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-red-500">−</span>
                              <span className="text-gray-500 ml-1 line-through">
                                {formatValue(field, revision.previous_values[field])}
                              </span>
                            </div>
                            <div>
                              <span className="text-emerald-500">+</span>
                              <span className="text-gray-700 ml-1">
                                {formatValue(field, revision.new_values[field])}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RevisionBadge({ count }: { count: number }) {
  if (count <= 1) return null;
  
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      <GitCommit className="w-3 h-3" />
      {count} revisions
    </span>
  );
}