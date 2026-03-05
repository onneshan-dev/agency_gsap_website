import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import type { Quote } from '@/types/supabase';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Trash2,
  Send,
  Save,
  Calculator,
  CalendarDays,
  Receipt,
  FileText,
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

interface QuoteBuilderProps {
  proposalId: string;
  existingQuote?: Quote;
  onSaved: (quote: Quote) => void;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  proposalId,
  existingQuote,
  onSaved,
}) => {
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const [scopeSummary, setScopeSummary] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', amount: 0 },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalOverride, setTotalOverride] = useState(false);
  const [currency, setCurrency] = useState('BDT');
  const [timelineStart, setTimelineStart] = useState('');
  const [timelineEnd, setTimelineEnd] = useState('');
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>(
    [{ milestone_title: '', amount: 0, due_condition: '' }],
  );
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    if (!existingQuote) return;
    setScopeSummary(existingQuote.scope_summary);
    const items = (existingQuote.line_items as LineItem[]) ?? [];
    setLineItems(items.length ? items : [{ description: '', amount: 0 }]);
    setTotalAmount(existingQuote.total_amount);
    setCurrency(existingQuote.currency);
    setTimelineStart(existingQuote.timeline_start ?? '');
    setTimelineEnd(existingQuote.timeline_end ?? '');
    const schedule =
      (existingQuote.payment_schedule as PaymentScheduleItem[]) ?? [];
    setPaymentSchedule(
      schedule.length
        ? schedule
        : [{ milestone_title: '', amount: 0, due_condition: '' }],
    );
    setValidUntil(existingQuote.valid_until ?? '');
  }, [existingQuote]);

  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  useEffect(() => {
    if (!totalOverride) setTotalAmount(subtotal);
  }, [subtotal, totalOverride]);

  const updateLineItem = useCallback(
    (index: number, field: keyof LineItem, value: string | number) => {
      setLineItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    [],
  );

  const addLineItem = () =>
    setLineItems((prev) => [...prev, { description: '', amount: 0 }]);

  const removeLineItem = (index: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== index));

  const updatePayment = useCallback(
    (index: number, field: keyof PaymentScheduleItem, value: string | number) => {
      setPaymentSchedule((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    [],
  );

  const addPayment = () =>
    setPaymentSchedule((prev) => [
      ...prev,
      { milestone_title: '', amount: 0, due_condition: '' },
    ]);

  const removePayment = (index: number) =>
    setPaymentSchedule((prev) => prev.filter((_, i) => i !== index));

  const buildPayload = () => ({
    proposal_id: proposalId,
    scope_summary: scopeSummary,
    line_items: lineItems.filter((li) => li.description.trim()),
    total_amount: totalAmount,
    currency,
    timeline_start: timelineStart || null,
    timeline_end: timelineEnd || null,
    payment_schedule: paymentSchedule.filter((ps) => ps.milestone_title.trim()),
    valid_until: validUntil || null,
  });

  const handleSave = async () => {
    if (!scopeSummary.trim()) {
      toast.error('Scope summary is required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      const quote = existingQuote
        ? await api.patch<Quote>(`/api/quotes/${existingQuote.id}`, payload)
        : await api.post<Quote>('/api/quotes', payload);
      toast.success(existingQuote ? 'Quote updated' : 'Quote created');
      onSaved(quote);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!existingQuote) {
      toast.error('Save the quote first before sending');
      return;
    }
    setSending(true);
    try {
      const quote = await api.post<Quote>(
        `/api/quotes/${existingQuote.id}/send`,
      );
      toast.success('Quote sent to client');
      onSaved(quote);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send quote');
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    'bg-admin-bg border-admin-border text-admin-text-primary placeholder:text-admin-text-muted';

  return (
    <div className="space-y-8">
      {/* ── Scope ────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-admin-text-primary">
          <FileText size={18} />
          <h3 className="text-base font-semibold">Scope Summary</h3>
        </div>
        <Textarea
          value={scopeSummary}
          onChange={(e) => setScopeSummary(e.target.value)}
          placeholder="Describe the project scope, deliverables, and expectations…"
          rows={4}
          className={`${inputCls} resize-none`}
        />
      </section>

      <Separator className="bg-admin-border" />

      {/* ── Line Items ──────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-admin-text-primary">
            <Receipt size={18} />
            <h3 className="text-base font-semibold">Line Items</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLineItem}
            className="border-admin-border text-admin-text-secondary hover:bg-admin-bg"
          >
            <Plus size={14} />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                {idx === 0 && (
                  <Label className="text-admin-text-secondary text-xs">
                    Description
                  </Label>
                )}
                <Input
                  value={item.description}
                  onChange={(e) =>
                    updateLineItem(idx, 'description', e.target.value)
                  }
                  placeholder="e.g., UI/UX Design"
                  className={inputCls}
                />
              </div>
              <div className="w-36 space-y-1">
                {idx === 0 && (
                  <Label className="text-admin-text-secondary text-xs">
                    Amount ({currency})
                  </Label>
                )}
                <Input
                  type="number"
                  min={0}
                  value={item.amount || ''}
                  onChange={(e) =>
                    updateLineItem(idx, 'amount', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div className="pt-1">
                {idx === 0 && (
                  <div className="h-4 text-xs">&nbsp;</div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeLineItem(idx)}
                  disabled={lineItems.length === 1}
                  className="text-admin-text-muted hover:text-red-500"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-4 rounded-lg bg-admin-bg/60 px-4 py-3 border border-admin-border">
          <span className="text-sm text-admin-text-secondary">Subtotal:</span>
          <span className="font-semibold text-admin-text-primary">
            {currency} {subtotal.toLocaleString()}
          </span>
        </div>
      </section>

      <Separator className="bg-admin-border" />

      {/* ── Total & Currency ────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-admin-text-primary">
          <Calculator size={18} />
          <h3 className="text-base font-semibold">Total & Currency</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-admin-text-primary">
              Total Amount
            </Label>
            <Input
              type="number"
              min={0}
              value={totalAmount || ''}
              onChange={(e) => {
                setTotalOverride(true);
                setTotalAmount(parseFloat(e.target.value) || 0);
              }}
              className={inputCls}
            />
            {totalOverride && totalAmount !== subtotal && (
              <button
                type="button"
                onClick={() => {
                  setTotalOverride(false);
                  setTotalAmount(subtotal);
                }}
                className="text-xs text-admin-primary hover:underline"
              >
                Reset to subtotal ({currency} {subtotal.toLocaleString()})
              </button>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-admin-text-primary">Currency</Label>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="BDT"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <Separator className="bg-admin-border" />

      {/* ── Timeline ────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-admin-text-primary">
          <CalendarDays size={18} />
          <h3 className="text-base font-semibold">Timeline</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-admin-text-primary">Start Date</Label>
            <Input
              type="date"
              value={timelineStart}
              onChange={(e) => setTimelineStart(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-admin-text-primary">End Date</Label>
            <Input
              type="date"
              value={timelineEnd}
              onChange={(e) => setTimelineEnd(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-admin-text-primary">Valid Until</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <Separator className="bg-admin-border" />

      {/* ── Payment Schedule ────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-admin-text-primary">
            <Receipt size={18} />
            <h3 className="text-base font-semibold">Payment Schedule</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPayment}
            className="border-admin-border text-admin-text-secondary hover:bg-admin-bg"
          >
            <Plus size={14} />
            Add Milestone
          </Button>
        </div>

        <div className="space-y-3">
          {paymentSchedule.map((ps, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_8rem_1fr_auto] items-start gap-3"
            >
              <div className="space-y-1">
                {idx === 0 && (
                  <Label className="text-admin-text-secondary text-xs">
                    Milestone
                  </Label>
                )}
                <Input
                  value={ps.milestone_title}
                  onChange={(e) =>
                    updatePayment(idx, 'milestone_title', e.target.value)
                  }
                  placeholder="e.g., Design Approval"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1">
                {idx === 0 && (
                  <Label className="text-admin-text-secondary text-xs">
                    Amount
                  </Label>
                )}
                <Input
                  type="number"
                  min={0}
                  value={ps.amount || ''}
                  onChange={(e) =>
                    updatePayment(
                      idx,
                      'amount',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1">
                {idx === 0 && (
                  <Label className="text-admin-text-secondary text-xs">
                    Due Condition
                  </Label>
                )}
                <Input
                  value={ps.due_condition}
                  onChange={(e) =>
                    updatePayment(idx, 'due_condition', e.target.value)
                  }
                  placeholder="e.g., On delivery"
                  className={inputCls}
                />
              </div>
              <div className="pt-1">
                {idx === 0 && <div className="h-4 text-xs">&nbsp;</div>}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removePayment(idx)}
                  disabled={paymentSchedule.length === 1}
                  className="text-admin-text-muted hover:text-red-500"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-admin-border" />

      {/* ── Actions ─────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleSave}
          disabled={saving || sending}
          className="border-admin-border text-admin-text-secondary hover:bg-admin-bg"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {existingQuote ? 'Update Quote' : 'Save Draft'}
        </Button>
        {existingQuote && existingQuote.status === 'draft' && (
          <Button
            type="button"
            onClick={handleSend}
            disabled={saving || sending}
            className="bg-admin-primary hover:bg-admin-primary/90"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Send to Client
          </Button>
        )}
      </div>
    </div>
  );
};
