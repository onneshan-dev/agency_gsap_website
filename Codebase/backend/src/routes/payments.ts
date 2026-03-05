import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin, requireAny } from '../middleware/roles.js';
import { notify } from '../services/notification.js';

const router = Router();

// POST /api/invoices — admin creates invoice
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { project_id, milestone_id, client_id, amount, currency, description, line_items, due_date } = req.body;

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert({
        project_id,
        milestone_id: milestone_id || null,
        client_id,
        amount,
        currency: currency || 'BDT',
        description: description || null,
        line_items: line_items || null,
        due_date: due_date || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// GET /api/invoices — list invoices
router.get('/', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    let query = supabaseAdmin
      .from('invoices')
      .select('*, projects!invoices_project_id_fkey(name), profiles!invoices_client_id_fkey(full_name, email)')
      .order('created_at', { ascending: false });

    if (req.userRole === 'client') {
      query = query.eq('client_id', req.userId!);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('List invoices error:', error);
    res.status(500).json({ error: 'Failed to list invoices' });
  }
});

// POST /api/invoices/:id/send — send invoice to client
router.post('/:id/send', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', req.params.id)
      .select('*, projects!invoices_project_id_fkey(name)')
      .single();

    if (error) throw error;

    if (milestone_id_from_invoice(invoice)) {
      await supabaseAdmin
        .from('milestones')
        .update({ payment_status: 'invoiced' })
        .eq('id', invoice.milestone_id);
    }

    await notify({
      userId: invoice.client_id,
      type: 'invoice_sent',
      title: 'Invoice Received',
      message: `An invoice of ${invoice.currency} ${invoice.amount} has been issued for "${invoice.projects?.name}".`,
      data: { invoice_id: invoice.id, project_id: invoice.project_id, url: `/client/projects/${invoice.project_id}` },
      channels: ['in_app', 'email', 'whatsapp'],
    });

    res.json(invoice);
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

function milestone_id_from_invoice(invoice: Record<string, unknown>): boolean {
  return !!invoice.milestone_id;
}

// PATCH /api/invoices/:id/mark-paid — admin marks as paid
router.patch('/:id/mark-paid', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { payment_method, payment_reference } = req.body;

    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: payment_method || null,
        payment_reference: payment_reference || null,
      })
      .eq('id', req.params.id)
      .select('*, projects!invoices_project_id_fkey(name)')
      .single();

    if (error) throw error;

    if (invoice.milestone_id) {
      await supabaseAdmin
        .from('milestones')
        .update({ payment_status: 'paid' })
        .eq('id', invoice.milestone_id);
    }

    await notify({
      userId: invoice.client_id,
      type: 'payment_received',
      title: 'Payment Confirmed',
      message: `Payment of ${invoice.currency} ${invoice.amount} for "${invoice.projects?.name}" has been confirmed.`,
      data: { invoice_id: invoice.id, project_id: invoice.project_id },
      channels: ['in_app', 'email'],
    });

    res.json(invoice);
  } catch (error) {
    console.error('Mark paid error:', error);
    res.status(500).json({ error: 'Failed to mark as paid' });
  }
});

export default router;
