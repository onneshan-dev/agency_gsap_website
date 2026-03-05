import { useState } from 'react';
import { format } from 'date-fns';
import {
  Receipt,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  AlertCircle,
  CreditCard,
  Loader2,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Invoice, Json } from '@/types/supabase';

interface InvoiceViewProps {
  invoice: Invoice;
  isAdmin?: boolean;
  onMarkPaid?: (id: string) => void;
}

type InvoiceStatus = Invoice['status'];

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { icon: React.ElementType; color: string; badgeClass: string; label: string }
> = {
  draft: {
    icon: FileText,
    color: 'text-[var(--admin-text-muted)]',
    badgeClass: 'border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-text-muted)]',
    label: 'Draft',
  },
  sent: {
    icon: Send,
    color: 'text-blue-600',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    label: 'Sent',
  },
  paid: {
    icon: CheckCircle2,
    color: 'text-green-600',
    badgeClass: 'border-green-200 bg-green-50 text-green-700',
    label: 'Paid',
  },
  overdue: {
    icon: AlertCircle,
    color: 'text-red-600',
    badgeClass: 'border-red-200 bg-red-50 text-red-700',
    label: 'Overdue',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-[var(--admin-text-muted)]',
    badgeClass: 'border-[var(--admin-border)] bg-[var(--admin-bg)] text-[var(--admin-text-muted)]',
    label: 'Cancelled',
  },
};

interface LineItem {
  description?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
}

function parseLineItems(lineItems: Json | null): LineItem[] {
  if (!lineItems || !Array.isArray(lineItems)) return [];
  return lineItems as LineItem[];
}

export default function InvoiceView({
  invoice,
  isAdmin = false,
  onMarkPaid,
}: InvoiceViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = STATUS_CONFIG[invoice.status];
  const StatusIcon = config.icon;
  const lineItems = parseLineItems(invoice.line_items);

  const handleMarkPaid = async () => {
    if (!onMarkPaid) return;
    setIsSubmitting(true);
    try {
      await onMarkPaid(invoice.id);
      setDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5 border-b border-[var(--admin-border)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-bg)]">
            <Receipt className="h-5 w-5 text-[var(--admin-text-secondary)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--admin-text-primary)]">
                Invoice
              </h3>
              <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            {invoice.description && (
              <p className="mt-0.5 text-sm text-[var(--admin-text-muted)]">
                {invoice.description}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--admin-text-primary)]">
            {formatCurrency(invoice.amount, invoice.currency)}
          </p>
          <p className="text-xs text-[var(--admin-text-muted)] uppercase tracking-wide">
            {invoice.currency}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-4 space-y-4">
        {/* Dates row */}
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <p className="text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">
              Created
            </p>
            <p className="text-sm text-[var(--admin-text-secondary)] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(invoice.created_at), 'MMM d, yyyy')}
            </p>
          </div>

          {invoice.due_date && (
            <div>
              <p className="text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">
                Due Date
              </p>
              <p
                className={`text-sm flex items-center gap-1.5 ${
                  invoice.status === 'overdue'
                    ? 'text-red-600 font-medium'
                    : 'text-[var(--admin-text-secondary)]'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(invoice.due_date), 'MMM d, yyyy')}
              </p>
            </div>
          )}

          {invoice.paid_at && (
            <div>
              <p className="text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">
                Paid On
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {format(new Date(invoice.paid_at), 'MMM d, yyyy')}
              </p>
            </div>
          )}

          {invoice.payment_method && (
            <div>
              <p className="text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">
                Payment Method
              </p>
              <p className="text-sm text-[var(--admin-text-secondary)] flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                {invoice.payment_method}
              </p>
            </div>
          )}
        </div>

        {invoice.payment_reference && (
          <div>
            <p className="text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider mb-1">
              Reference
            </p>
            <p className="text-sm text-[var(--admin-text-secondary)] font-mono">
              {invoice.payment_reference}
            </p>
          </div>
        )}

        {/* Line items */}
        {lineItems.length > 0 && (
          <>
            <Separator className="bg-[var(--admin-border)]" />
            <div>
              <p className="text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider mb-3">
                Line Items
              </p>
              <div className="rounded-lg border border-[var(--admin-border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--admin-bg)]">
                      <th className="text-left px-4 py-2 text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
                        Description
                      </th>
                      <th className="text-right px-4 py-2 text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="text-right px-4 py-2 text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="text-right px-4 py-2 text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr
                        key={i}
                        className="border-t border-[var(--admin-border)]"
                      >
                        <td className="px-4 py-2.5 text-[var(--admin-text-primary)]">
                          {item.description || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--admin-text-secondary)]">
                          {item.quantity ?? '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--admin-text-secondary)]">
                          {item.rate != null
                            ? formatCurrency(item.rate, invoice.currency)
                            : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-[var(--admin-text-primary)]">
                          {item.amount != null
                            ? formatCurrency(item.amount, invoice.currency)
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--admin-border)] bg-[var(--admin-bg)]">
                      <td
                        colSpan={3}
                        className="px-4 py-2.5 text-right text-xs font-semibold text-[var(--admin-text-secondary)] uppercase"
                      >
                        Total
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-[var(--admin-text-primary)]">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Admin actions */}
      {isAdmin && invoice.status !== 'paid' && invoice.status !== 'cancelled' && onMarkPaid && (
        <div className="px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90 text-white"
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Mark as Paid
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Invoice as Paid</DialogTitle>
                <DialogDescription>
                  Record payment details for this invoice of{' '}
                  {formatCurrency(invoice.amount, invoice.currency)}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="payment-method"
                    className="text-sm text-[var(--admin-text-primary)]"
                  >
                    Payment Method
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="border-[var(--admin-border)]">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="payment-reference"
                    className="text-sm text-[var(--admin-text-primary)]"
                  >
                    Payment Reference / Transaction ID
                  </Label>
                  <Input
                    id="payment-reference"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. TXN-123456"
                    className="border-[var(--admin-border)]"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMarkPaid}
                  disabled={isSubmitting || !paymentMethod}
                  className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  )}
                  Confirm Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
