import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type { Proposal, Quote, Agreement } from '@/types/supabase';
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
  CheckCircle,
  Circle,
  MessageSquare,
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
  converted: { label: 'Converted to Project', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
};

const PROPOSAL_JOURNEY = [
  'submitted',
  'under_review',
  'in_discussion',
  'quoted',
  'accepted',
  'converted',
] as const;

function parseDocuments(docs: unknown): { name: string; url: string; key: string }[] {
  if (!docs || !Array.isArray(docs)) return [];
  return docs;
}

export default function ClientProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProposal = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get<Proposal>(`/api/proposals/${id}`);
      setProposal(data);

      if (['quoted', 'accepted', 'converted'].includes(data.status)) {
        try {
          const q = await api.get<Quote>(`/api/proposals/${id}/quote`);
          setQuote(q);

          if (['accepted', 'converted'].includes(data.status) && q?.id) {
            try {
              const a = await api.get<Agreement>(`/api/quotes/${q.id}/agreement`);
              setAgreement(a);
            } catch {
              /* agreement may not exist yet */
            }
          }
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
    if (id) {
      fetchProposal();
    }
  }, [id, fetchProposal]);

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
            The proposal you're looking for doesn't exist or you don't have access.
          </p>
          <button
            onClick={() => navigate('/client/dashboard')}
            className="text-sm font-medium text-admin-primary hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </AdminLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.submitted;
  const documents = parseDocuments(proposal.documents);
  const currentStepIndex = PROPOSAL_JOURNEY.indexOf(proposal.status as typeof PROPOSAL_JOURNEY[number]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-admin-surface border border-admin-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-admin-text-primary mb-5">Proposal Journey</h2>
          <div className="flex items-center overflow-x-auto pb-2">
            {PROPOSAL_JOURNEY.map((step, i) => {
              const isCompleted = currentStepIndex >= i;
              const isCurrent = currentStepIndex === i;
              const isRejected = proposal.status === 'rejected';
              const stepLabel = STATUS_CONFIG[step]?.label || step;

              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[90px]">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                        isRejected && isCurrent
                          ? 'border-red-400 bg-red-50'
                          : isCompleted
                            ? 'border-admin-primary bg-admin-primary'
                            : 'border-admin-border bg-admin-bg',
                      )}
                    >
                      {isCompleted && !isRejected ? (
                        <CheckCircle size={16} className="text-white" />
                      ) : (
                        <Circle
                          size={16}
                          className={isRejected && isCurrent ? 'text-red-400' : 'text-admin-text-muted'}
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-2 text-center whitespace-nowrap',
                        isCurrent ? 'font-semibold text-admin-text-primary' : 'text-admin-text-muted',
                      )}
                    >
                      {stepLabel}
                    </span>
                  </div>
                  {i < PROPOSAL_JOURNEY.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 w-8 sm:w-12 flex-shrink-0 mt-[-20px]',
                        currentStepIndex > i ? 'bg-admin-primary' : 'bg-admin-border',
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proposal Details */}
            <div className="bg-admin-surface border border-admin-border rounded-xl p-6 space-y-5">
              <h2 className="text-base font-semibold text-admin-text-primary flex items-center gap-2">
                <FileText size={16} className="text-admin-primary" />
                Project Description
              </h2>
              <p className="text-sm text-admin-text-secondary leading-relaxed whitespace-pre-wrap">
                {proposal.description}
              </p>

              {documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-admin-text-primary mb-3 flex items-center gap-2">
                    <File size={14} />
                    Attached Documents ({documents.length})
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
            {quote && ['quoted', 'accepted', 'converted'].includes(proposal.status) && (
              <div className="bg-admin-surface border border-admin-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-admin-text-primary mb-4 flex items-center gap-2">
                  <DollarSign size={16} className="text-admin-primary" />
                  Quote
                </h2>
                {/* QuoteView will be imported here once created */}
                <div className="text-sm text-admin-text-muted italic bg-admin-bg rounded-lg p-4 border border-dashed border-admin-border">
                  QuoteView component will render here.
                  {/* TODO: import QuoteView from '@/components/quotes/QuoteView' */}
                </div>
              </div>
            )}

            {/* Agreement Section */}
            {agreement && ['accepted', 'converted'].includes(proposal.status) && (
              <div className="bg-admin-surface border border-admin-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-admin-text-primary mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-admin-primary" />
                  Agreement
                </h2>
                {/* AgreementChecklist will be imported here once created */}
                <div className="text-sm text-admin-text-muted italic bg-admin-bg rounded-lg p-4 border border-dashed border-admin-border">
                  AgreementChecklist component will render here.
                  {/* TODO: import AgreementChecklist from '@/components/agreements/AgreementChecklist' */}
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
                    Chat will be available here soon.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-admin-surface border border-admin-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-admin-text-primary">Details</h3>

              <div className="space-y-3">
                {proposal.category && (
                  <div className="flex items-start gap-3">
                    <Tag size={15} className="text-admin-text-muted mt-0.5" />
                    <div>
                      <p className="text-xs text-admin-text-muted">Category</p>
                      <p className="text-sm font-medium text-admin-text-primary">
                        {CATEGORY_LABELS[proposal.category] || proposal.category}
                      </p>
                    </div>
                  </div>
                )}

                {proposal.budget_range && (
                  <div className="flex items-start gap-3">
                    <DollarSign size={15} className="text-admin-text-muted mt-0.5" />
                    <div>
                      <p className="text-xs text-admin-text-muted">Budget</p>
                      <p className="text-sm font-medium text-admin-text-primary">
                        {BUDGET_LABELS[proposal.budget_range] || proposal.budget_range}
                      </p>
                    </div>
                  </div>
                )}

                {proposal.timeline_preference && (
                  <div className="flex items-start gap-3">
                    <Clock size={15} className="text-admin-text-muted mt-0.5" />
                    <div>
                      <p className="text-xs text-admin-text-muted">Timeline</p>
                      <p className="text-sm font-medium text-admin-text-primary">
                        {TIMELINE_LABELS[proposal.timeline_preference] || proposal.timeline_preference}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar size={15} className="text-admin-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-admin-text-muted">Submitted</p>
                    <p className="text-sm font-medium text-admin-text-primary">
                      {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={15} className="text-admin-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-admin-text-muted">Last Updated</p>
                    <p className="text-sm font-medium text-admin-text-primary">
                      {format(new Date(proposal.updated_at), 'MMM d, yyyy')}
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
