import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { api } from '@/lib/api';
import type { Proposal } from '@/types/supabase';
import { cn } from '@/lib/utils';
import {
  Search,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  CheckCircle,
  Loader2,
  File,
  Eye,
  Plus,
  Clock,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SLAIndicator, ProposalsAtRisk } from '@/components/sla';

interface ProposalWithClient extends Proposal {
  profiles?: {
    full_name: string | null;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Plus },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Eye },
  in_discussion: { label: 'In Discussion', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: MessageSquare },
  quoted: { label: 'Quoted', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: FileText },
  accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
};

export default function ClientProposalsPage() {
  const [proposals, setProposals] = useState<ProposalWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProposals = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const data = await api.get<ProposalWithClient[]>(`/api/proposals${params}`);
      setProposals(data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const filteredProposals = proposals.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.profiles?.full_name?.toLowerCase().includes(q) ||
      p.profiles?.email.toLowerCase().includes(q)
    );
  });

  const statusCounts = proposals.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const formatDocuments = (docs: unknown): { name: string; url: string; key: string }[] => {
    if (!docs || !Array.isArray(docs)) return [];
    return docs;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-admin-text-primary">Client Proposals</h1>
            <p className="text-admin-text-secondary mt-1">
              Review, discuss, and convert client proposals into projects.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status} className={cn('px-3 py-1 text-xs font-medium rounded-full border', cfg?.color)}>
                  {cfg?.label || status}: {count}
                </div>
              );
            })}
          </div>
        </div>

        {/* Proposals at Risk Alert */}
        <ProposalsAtRisk />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by title, client name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-admin-surface border border-admin-border rounded-lg text-sm text-admin-text-primary placeholder:text-admin-text-muted focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-admin-surface border border-admin-border rounded-lg text-sm text-admin-text-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          >
            <option value="all">All Proposals</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="in_discussion">In Discussion</option>
            <option value="quoted">Quoted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="converted">Converted</option>
          </select>
        </div>

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredProposals.map((proposal) => {
            const documents = formatDocuments(proposal.documents);
            const cfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft;
            const StatusIcon = cfg.icon;

            return (
              <Link
                key={proposal.id}
                to={`/admin/proposals/${proposal.id}`}
                className={cn(
                  'block bg-admin-surface border rounded-xl p-5 transition-all hover:shadow-md',
                  proposal.status === 'converted' ? 'border-emerald-200/50' : 'border-admin-border hover:border-admin-primary/30',
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-admin-bg rounded-full flex items-center justify-center">
                      <User className="text-admin-text-muted" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-admin-text-primary">
                        {proposal.profiles?.full_name || 'Unnamed Client'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-admin-text-muted">
                        <Mail size={12} />
                        <span>{proposal.profiles?.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', cfg.color)}>
                      <StatusIcon size={12} />
                      {cfg.label}
                    </span>
                    {/* SLA Indicator */}
                    {!['draft', 'converted', 'rejected'].includes(proposal.status) && (
                      <SLAIndicator proposalId={proposal.id} size="sm" showDetails={false} />
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-admin-text-primary mb-2">{proposal.title}</h4>

                <div className="flex flex-wrap gap-3 mb-3 text-xs text-admin-text-muted">
                  {proposal.profiles?.phone && (
                    <span className="flex items-center gap-1"><Phone size={12} />{proposal.profiles.phone}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {format(new Date(proposal.created_at), 'MMM dd, yyyy')}
                  </span>
                  {proposal.category && (
                    <span className="px-2 py-0.5 bg-admin-bg rounded text-admin-text-secondary">
                      {proposal.category.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <p className="text-sm text-admin-text-secondary bg-admin-bg rounded-lg p-3 line-clamp-3 mb-3">
                  {proposal.description}
                </p>

                {documents.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-admin-text-muted">
                    <File size={12} />
                    <span>{documents.length} document(s)</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {filteredProposals.length === 0 && (
          <div className="text-center py-16 bg-admin-surface rounded-xl border border-admin-border">
            <div className="w-16 h-16 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-admin-text-muted" size={32} />
            </div>
            <h3 className="text-lg font-medium text-admin-text-primary mb-1">
              {searchQuery || statusFilter !== 'all' ? 'No proposals found' : 'No proposals yet'}
            </h3>
            <p className="text-sm text-admin-text-muted max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Client project proposals will appear here when they submit them.'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
