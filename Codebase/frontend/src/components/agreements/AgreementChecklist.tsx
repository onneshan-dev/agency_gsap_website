import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { api } from '@/lib/api';
import type { Agreement } from '@/types/supabase';
import { toast } from 'sonner';
import {
  Loader2,
  ChevronDown,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  confirmed: boolean;
}

interface AgreementChecklistProps {
  agreementId: string;
  isClient?: boolean;
  onConfirmed?: () => void;
}

export const AgreementChecklist: React.FC<AgreementChecklistProps> = ({
  agreementId,
  isClient = false,
  onConfirmed,
}) => {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchAgreement = async () => {
      setLoading(true);
      try {
        const data = await api.get<Agreement>(
          `/api/agreements/${agreementId}`,
        );
        if (cancelled) return;
        setAgreement(data);
        const checklist = (data.checklist_items as ChecklistItem[]) ?? [];
        setItems(checklist.map((item) => ({ ...item, confirmed: item.confirmed ?? false })));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load agreement',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAgreement();
    return () => {
      cancelled = true;
    };
  }, [agreementId]);

  const confirmedCount = items.filter((i) => i.confirmed).length;
  const allConfirmed = items.length > 0 && confirmedCount === items.length;
  const progressPercent = items.length ? (confirmedCount / items.length) * 100 : 0;

  const toggleItem = (id: string) => {
    if (!isClient || agreement?.status === 'confirmed') return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, confirmed: !item.confirmed } : item,
      ),
    );
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await api.post(`/api/agreements/${agreementId}/confirm`, {
        confirmed_items: items,
      });
      toast.success('Agreement confirmed successfully!');
      onConfirmed?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to confirm agreement',
      );
    } finally {
      setConfirming(false);
    }
  };

  const isAlreadyConfirmed = agreement?.status === 'confirmed';

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.confirmed) - Number(b.confirmed)),
    // We only sort on initial load; keep insertion order during interactions
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const displayItems = items.length ? items : sortedItems;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-text-muted" />
      </div>
    );
  }

  if (!agreement) {
    return (
      <p className="py-8 text-center text-sm text-admin-text-muted">
        Agreement not found.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Progress Header ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={20}
              className={cn(
                isAlreadyConfirmed
                  ? 'text-emerald-600'
                  : 'text-admin-text-secondary',
              )}
            />
            <h3 className="text-base font-semibold text-admin-text-primary">
              Agreement Checklist
            </h3>
          </div>
          <span className="text-sm tabular-nums text-admin-text-secondary">
            {confirmedCount} / {items.length} confirmed
          </span>
        </div>
        <Progress
          value={progressPercent}
          className={cn(
            'h-2',
            isAlreadyConfirmed ? 'bg-emerald-100' : 'bg-admin-bg',
          )}
        />
      </div>

      {/* ── Checklist Items ─────────────────────────────── */}
      <div className="space-y-2">
        {displayItems.map((item) => {
          const isOpen = expanded.has(item.id);
          return (
            <Collapsible
              key={item.id}
              open={isOpen}
              onOpenChange={() => toggleExpanded(item.id)}
            >
              <div
                className={cn(
                  'rounded-lg border transition-colors',
                  item.confirmed
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-admin-border bg-admin-surface',
                )}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {isClient && !isAlreadyConfirmed ? (
                    <Checkbox
                      checked={item.confirmed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className={cn(
                        item.confirmed &&
                          'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600',
                      )}
                    />
                  ) : item.confirmed ? (
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-emerald-600"
                    />
                  ) : (
                    <Circle
                      size={18}
                      className="shrink-0 text-admin-text-muted"
                    />
                  )}

                  <CollapsibleTrigger className="flex flex-1 items-center justify-between text-left">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        item.confirmed
                          ? 'text-emerald-800'
                          : 'text-admin-text-primary',
                      )}
                    >
                      {item.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'shrink-0 text-admin-text-muted transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="px-4 pb-4 pl-11">
                    <p className="text-sm leading-relaxed text-admin-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* ── Confirm Button ──────────────────────────────── */}
      {isClient && !isAlreadyConfirmed && (
        <div className="pt-2">
          <Button
            onClick={handleConfirm}
            disabled={!allConfirmed || confirming}
            className={cn(
              'w-full',
              allConfirmed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-admin-bg text-admin-text-muted cursor-not-allowed',
            )}
          >
            {confirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck size={16} />
            )}
            {allConfirmed
              ? 'Confirm Agreement'
              : `Please confirm all ${items.length} items to proceed`}
          </Button>
        </div>
      )}

      {isAlreadyConfirmed && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800">
            This agreement was confirmed
            {agreement.confirmed_at
              ? ` on ${new Date(agreement.confirmed_at).toLocaleDateString()}`
              : ''}
            .
          </p>
        </div>
      )}
    </div>
  );
};
