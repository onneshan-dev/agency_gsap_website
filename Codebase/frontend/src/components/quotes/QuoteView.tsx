import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Quote } from '@/types/supabase';
import { format } from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  CalendarDays,
  Receipt,
  FileText,
  Clock,
  Loader2,
} from 'lucide-react';

interface LineItem {
  description: string;
  amount: number;
}

interface PaymentScheduleItem {
  milestone_title: string;
  amount: number;
  due_condition: string;
}

interface QuoteViewProps {
  quote: Quote;
  onRespond?: (
    action: 'accepted' | 'negotiating' | 'rejected',
    notes?: string,
  ) => void;
  isClient?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  sent: {
    label: 'Sent',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  negotiating: {
    label: 'Negotiating',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  expired: {
    label: 'Expired',
    className: 'bg-gray-50 text-gray-500 border-gray-200',
  },
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
};

export const QuoteView: React.FC<QuoteViewProps> = ({
  quote,
  onRespond,
  isClient = false,
}) => {
  const [action, setAction] = useState<
    'accepted' | 'negotiating' | 'rejected' | null
  >(null);
  const [clientNotes, setClientNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const lineItems = (quote.line_items as LineItem[]) ?? [];
  const paymentSchedule = (quote.payment_schedule as PaymentScheduleItem[]) ?? [];
  const status = statusConfig[quote.status] ?? statusConfig.draft;

  const canRespond = isClient && quote.status === 'sent' && onRespond;

  const handleSubmit = async (chosen: 'accepted' | 'negotiating' | 'rejected') => {
    if (!onRespond) return;
    setSubmitting(true);
    try {
      await onRespond(
        chosen,
        chosen === 'negotiating' ? clientNotes : undefined,
      );
    } finally {
      setSubmitting(false);
      setAction(null);
      setClientNotes('');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-admin-text-primary">
          Quotation
        </h3>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </div>

      {/* ── Scope ───────────────────────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-admin-text-secondary text-sm font-medium">
          <FileText size={15} />
          Scope Summary
        </div>
        <p className="text-sm text-admin-text-primary leading-relaxed whitespace-pre-wrap rounded-lg bg-admin-bg/50 border border-admin-border p-4">
          {quote.scope_summary}
        </p>
      </section>

      <Separator className="bg-admin-border" />

      {/* ── Line Items Table ────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-admin-text-secondary text-sm font-medium">
          <Receipt size={15} />
          Line Items
        </div>
        <div className="overflow-hidden rounded-lg border border-admin-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-admin-bg/60">
                <th className="px-4 py-2.5 text-left font-medium text-admin-text-secondary">
                  Description
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-admin-text-secondary w-32">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-t border-admin-border hover:bg-admin-bg/30 transition-colors"
                >
                  <td className="px-4 py-2.5 text-admin-text-primary">
                    {item.description}
                  </td>
                  <td className="px-4 py-2.5 text-right text-admin-text-primary tabular-nums">
                    {quote.currency}{' '}
                    {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-admin-border bg-admin-bg/40">
                <td className="px-4 py-3 text-right font-semibold text-admin-text-primary">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-bold text-admin-text-primary tabular-nums">
                  {quote.currency}{' '}
                  {quote.total_amount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <Separator className="bg-admin-border" />

      {/* ── Timeline ────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-admin-text-secondary text-sm font-medium">
          <CalendarDays size={15} />
          Timeline
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-admin-border bg-admin-bg/30 p-3">
            <p className="text-xs text-admin-text-muted mb-1">Start</p>
            <p className="text-sm font-medium text-admin-text-primary">
              {formatDate(quote.timeline_start)}
            </p>
          </div>
          <div className="rounded-lg border border-admin-border bg-admin-bg/30 p-3">
            <p className="text-xs text-admin-text-muted mb-1">End</p>
            <p className="text-sm font-medium text-admin-text-primary">
              {formatDate(quote.timeline_end)}
            </p>
          </div>
          <div className="rounded-lg border border-admin-border bg-admin-bg/30 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={12} className="text-admin-text-muted" />
              <p className="text-xs text-admin-text-muted">Valid Until</p>
            </div>
            <p className="text-sm font-medium text-admin-text-primary">
              {formatDate(quote.valid_until)}
            </p>
          </div>
        </div>
      </section>

      {/* ── Payment Schedule ────────────────────────────── */}
      {paymentSchedule.length > 0 && (
        <>
          <Separator className="bg-admin-border" />
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-admin-text-secondary text-sm font-medium">
              <Receipt size={15} />
              Payment Schedule
            </div>
            <div className="overflow-hidden rounded-lg border border-admin-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-admin-bg/60">
                    <th className="px-4 py-2.5 text-left font-medium text-admin-text-secondary">
                      Milestone
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-admin-text-secondary w-32">
                      Amount
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-admin-text-secondary">
                      Due Condition
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentSchedule.map((ps, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-admin-border hover:bg-admin-bg/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-admin-text-primary">
                        {ps.milestone_title}
                      </td>
                      <td className="px-4 py-2.5 text-right text-admin-text-primary tabular-nums">
                        {quote.currency}{' '}
                        {ps.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-admin-text-secondary">
                        {ps.due_condition}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ── Client Notes (if any) ───────────────────────── */}
      {quote.client_notes && (
        <>
          <Separator className="bg-admin-border" />
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-admin-text-secondary text-sm font-medium">
              <MessageSquare size={15} />
              Client Notes
            </div>
            <p className="text-sm text-admin-text-primary whitespace-pre-wrap rounded-lg bg-amber-50/50 border border-amber-200/60 p-4">
              {quote.client_notes}
            </p>
          </section>
        </>
      )}

      {/* ── Client Actions ──────────────────────────────── */}
      {canRespond && (
        <>
          <Separator className="bg-admin-border" />
          <section className="space-y-4">
            {action === 'negotiating' ? (
              <div className="space-y-3">
                <Textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Share your feedback, concerns, or requested changes…"
                  rows={3}
                  className="bg-admin-bg border-admin-border text-admin-text-primary placeholder:text-admin-text-muted resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAction(null);
                      setClientNotes('');
                    }}
                    disabled={submitting}
                    className="border-admin-border text-admin-text-secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmit('negotiating')}
                    disabled={submitting || !clientNotes.trim()}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare size={14} />
                    )}
                    Submit Feedback
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleSubmit('accepted')}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {submitting && action === 'accepted' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Accept Quote
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAction('negotiating')}
                  disabled={submitting}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <MessageSquare size={16} />
                  Negotiate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('rejected')}
                  disabled={submitting}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  {submitting && action === 'rejected' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Reject
                </Button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
