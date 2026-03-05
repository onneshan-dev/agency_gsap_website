import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Proposal, Quote, Profile } from '@/types/supabase';
import {
  Loader2,
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Tag,
  File,
  ExternalLink,
  User,
  Mail,
  Phone,
  Save,
  MessageSquare,
  Plus,
  Edit,
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  web_app: 'Web Application',
  mobile_app: 'Mobile Application',
  ecommerce: 'E-Commerce',
  saas: 'SaaS Platform',
  other: 'Other',
};

const BUDGET_LABELS: Record<string, string> = {
  under_5k: 'Under $5,000',
  '5k_15k': '$5,000 – $15,000',
  '15k_50k': '$15,000 – $50,000',
  '50k_plus': '$50,000+',
  not_sure: 'Not Sure Yet',
};

const TIMELINE_LABELS: Record<string, string> = {
  '1_month': '1 Month',
  '1_3_months': '1 – 3 Months',
  '3_6_months': '3 – 6 Months',
  '6_plus': '6+ Months',
  flexible: 'Flexible',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
  submitted: { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  under_review: { label: 'Under Review', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  in_discussion: { label: 'In Discussion', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  quoted: { label: 'Quoted', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  accepted: { label: 'Accepted', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  converted: { label: 'Converted', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
};

const ADMIN_STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'in_discussion', label: 'In Discussion' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted' },
];

function parseDocuments(docs: unknown): { name: string; url: string; key: string }[] {
  if (!docs || !Array.isArray(docs)) return [];
  return docs;
}

export default function AdminProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [client, setClient] = useState<Profile | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const p = await api.get<Proposal>(`/api/proposals/${id}`);
      setProposal(p);
      setSelectedStatus(p.status);
      setAdminNotes(p.admin_notes || '');

      try {
        const c = await api.get<Profile>(`/api/proposals/${id}/client`);
        setClient(c);
      } catch {
        /* client profile fetch may not exist as a separate endpoint */
      }

      if (['quoted', 'accepted', 'converted'].includes(p.status)) {
        try {
          const q = await api.get<Quote>(`/api/proposals/${id}/quote`);
          setQuote(q);
        } catch {
          /* quote may not exist yet */
        }
      }
    } catch (err) {
      console.error('Error fetching proposal:', err);
      toast.error('Failed to load proposal');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(newStatus: string) {
    if (!proposal || newStatus === proposal.status) return;

    setIsStatusUpdating(true);
    try {
      await api.patch(`/api/proposals/${id}`, { status: newStatus });
      setProposal((prev) => (prev ? { ...prev, status: newStatus as Proposal['status'] } : prev));
      setSelectedStatus(newStatus);
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
      setSelectedStatus(proposal.status);
    } finally {
      setIsStatusUpdating(false);
    }
  }

  async function handleSaveNotes() {
    if (!proposal) return;

    setIsSaving(true);
    try {
      await api.patch(`/api/proposals/${id}`, { admin_notes: adminNotes });
      setProposal((prev) => (prev ? { ...prev, admin_notes: adminNotes } : prev));
      toast.success('Notes saved');
    } catch (err) {
      console.error('Error saving notes:', err);
      toast.error('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!proposal) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-admin-text-muted" size={32} />
          </div>
          <h3 className="text-lg font-medium text-admin-text-primary mb-1">Proposal Not Found</h3>
          <p className="text-sm text-admin-text-muted mb-6">
            This proposal doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/admin/proposals')}
            className="text-sm font-medium text-admin-primary hover:underline"
          >
            Back to Proposals
          </button>
        </div>
      </AdminLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.submitted;
  const documents = parseDocuments(proposal.documents);
  const canCreateQuote = ['under_review', 'in_discussion'].includes(proposal.status);
  const hasQuote = !!quote;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="self-start p-2 rounded-lg border border-admin-border text-admin-text-secondary hover:bg-admin-surface transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-admin-text-primary truncate">
                {proposal.title}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border',
                  statusCfg.color,
                  statusCfg.bg,
                  statusCfg.border,
                )}
              >
                {statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-admin-text-muted mt-1">
              Submitted {format(new Date(proposal.created_at), 'MMMM d, yyyy')}
              {proposal.updated_at !== proposal.created_at &&
                ` · Updated ${format(new Date(proposal.updated_at), 'MMM d, yyyy')}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            {client && (
              <div className="bg-admin-surface border border-admin-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-admin-text-primary mb-4 flex items-center gap-2">
                  <User size={15} className="text-admin-primary" />
                  Client Information
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-admin-bg rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-admin-text-muted" size={20} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-admin-text-primary">
                      {client.full_name || 'Unnamed Client'}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-admin-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} />
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} />
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Proposal Details */}
            <div className="bg-admin-surface border border-admin-border rounded-xl p-6 space-y-5">
              <h2 className="text-base font-semibold text-admin-text-primary flex items-center gap-2">
                <FileText size={16} className="text-admin-primary" />
                Proposal Details
              </h2>

              <p className="text-sm text-admin-text-secondary leading-relaxed whitespace-pre-wrap">
                {proposal.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {proposal.category && (
                  <div className="bg-admin-bg rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs text-admin-text-muted mb-1">
                      <Tag size={12} />
                      Category
                    </div>
                    <p className="text-sm font-medium text-admin-text-primary">
                      {CATEGORY_LABELS[proposal.category] || proposal.category}
                    </p>
                  </div>
                )}
                {proposal.budget_range && (
                  <div className="bg-admin-bg rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs text-admin-text-muted mb-1">
                      <DollarSign size={12} />
                      Budget
                    </div>
                    <p className="text-sm font-medium text-admin-text-primary">
                      {BUDGET_LABELS[proposal.budget_range] || proposal.budget_range}
                    </p>
                  </div>
                )}
                {proposal.timeline_preference && (
                  <div className="bg-admin-bg rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs text-admin-text-muted mb-1">
                      <Clock size={12} />
                      Timeline
                    </div>
                    <p className="text-sm font-medium text-admin-text-primary">
                      {TIMELINE_LABELS[proposal.timeline_preference] || proposal.timeline_preference}
                    </p>
                  </div>
                )}
              </div>

              {documents.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-sm font-medium text-admin-text-primary mb-3 flex items-center gap-2">
                    <File size={14} />
                    Documents ({documents.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {documents.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-admin-bg rounded-lg text-xs text-admin-text-secondary hover:text-admin-primary hover:bg-admin-border transition-colors"
                      >
                        <File size={12} />
                        <span className="truncate max-w-[140px]">{doc.name}</span>
                        <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quote Section */}
            {hasQuote && (
              <div className="bg-admin-surface border border-admin-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-admin-text-primary flex items-center gap-2">
                    <DollarSign size={16} className="text-admin-primary" />
                    Quote
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/proposals/${id}/quote/edit`)}
                    className="border-admin-border text-admin-text-secondary hover:bg-admin-bg"
                  >
                    <Edit size={14} className="mr-1.5" />
                    Edit Quote
                  </Button>
                </div>
                {/* QuoteBuilder / QuoteView will go here */}
                <div className="text-sm text-admin-text-muted italic bg-admin-bg rounded-lg p-4 border border-dashed border-admin-border">
                  QuoteBuilder component will render here.
                  {/* TODO: import QuoteBuilder from '@/components/quotes/QuoteBuilder' */}
                </div>
              </div>
            )}

            {/* Chat Placeholder */}
            <div className="bg-admin-surface border border-admin-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-admin-text-primary mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-admin-primary" />
                Discussion
              </h2>
              <div className="h-48 flex items-center justify-center bg-admin-bg rounded-lg border border-dashed border-admin-border">
                <div className="text-center">
                  <MessageSquare size={28} className="text-admin-text-muted mx-auto mb-2" />
                  <p className="text-sm text-admin-text-muted">
                    Chat panel will be available here.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <div className="bg-admin-surface border border-admin-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-admin-text-primary">Status Management</h3>

              <div className="space-y-2">
                <Label className="text-xs text-admin-text-muted">Change Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusChange}
                  disabled={isStatusUpdating}
                >
                  <SelectTrigger className="w-full h-10 bg-admin-bg border-admin-border text-admin-text-primary rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              STATUS_CONFIG[opt.value]?.bg?.replace('bg-', 'bg-') || 'bg-gray-200',
                            )}
                            style={{
                              backgroundColor:
                                opt.value === 'submitted' ? '#3b82f6'
                                : opt.value === 'under_review' ? '#f59e0b'
                                : opt.value === 'in_discussion' ? '#8b5cf6'
                                : opt.value === 'quoted' ? '#6366f1'
                                : opt.value === 'accepted' ? '#10b981'
                                : opt.value === 'rejected' ? '#ef4444'
                                : '#14b8a6',
                            }}
                          />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isStatusUpdating && (
                  <p className="text-xs text-admin-text-muted flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" />
                    Updating...
                  </p>
                )}
              </div>

              {/* Create Quote Button */}
              {canCreateQuote && !hasQuote && (
                <Button
                  onClick={() => navigate(`/admin/proposals/${id}/quote/new`)}
                  className="w-full bg-admin-primary text-white hover:bg-admin-primary/90 rounded-lg"
                >
                  <Plus size={16} className="mr-2" />
                  Create Quote
                </Button>
              )}

              {hasQuote && !['accepted', 'converted'].includes(proposal.status) && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/proposals/${id}/quote/edit`)}
                  className="w-full border-admin-border text-admin-text-secondary hover:bg-admin-bg rounded-lg"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Quote
                </Button>
              )}
            </div>

            {/* Admin Notes */}
            <div className="bg-admin-surface border border-admin-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-admin-text-primary">Admin Notes</h3>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this proposal..."
                rows={5}
                className="bg-admin-bg border-admin-border text-admin-text-primary placeholder:text-admin-text-muted rounded-lg resize-none text-sm focus:ring-admin-primary/20 focus:border-admin-primary"
              />
              <Button
                onClick={handleSaveNotes}
                disabled={isSaving || adminNotes === (proposal.admin_notes || '')}
                variant="outline"
                className="w-full border-admin-border text-admin-text-secondary hover:bg-admin-bg rounded-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} className="mr-2" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>

            {/* Timestamps */}
            <div className="bg-admin-surface border border-admin-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-admin-text-primary">Timeline</h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <Calendar size={14} className="text-admin-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-admin-text-muted">Submitted</p>
                    <p className="text-sm font-medium text-admin-text-primary">
                      {format(new Date(proposal.created_at), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={14} className="text-admin-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-admin-text-muted">Last Updated</p>
                    <p className="text-sm font-medium text-admin-text-primary">
                      {format(new Date(proposal.updated_at), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
