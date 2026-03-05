import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin, requireAny, requireClient } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { notify } from '../services/notification.js';
const router = Router();
const createQuoteSchema = z.object({
    proposal_id: z.string().uuid(),
    scope_summary: z.string().min(10),
    line_items: z.array(z.object({
        description: z.string(),
        amount: z.number().min(0),
    })).min(1),
    total_amount: z.number().min(0),
    currency: z.string().default('BDT'),
    timeline_start: z.string().optional(),
    timeline_end: z.string().optional(),
    payment_schedule: z.array(z.object({
        milestone_title: z.string(),
        amount: z.number().min(0),
        due_condition: z.string(),
    })).optional(),
    valid_until: z.string().optional(),
});
// POST /api/quotes — admin creates a quote
router.post('/', requireAdmin, validate(createQuoteSchema), async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('quotes')
            .insert({ ...req.body, created_by: req.userId, status: 'draft' })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        console.error('Create quote error:', error);
        res.status(500).json({ error: 'Failed to create quote' });
    }
});
// GET /api/quotes/:id — view quote detail
router.get('/:id', requireAny, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('quotes')
            .select('*, proposals!quotes_proposal_id_fkey(title, client_id)')
            .eq('id', req.params.id)
            .single();
        if (error)
            throw error;
        if (!data) {
            res.status(404).json({ error: 'Quote not found' });
            return;
        }
        if (req.userRole === 'client' && data.proposals?.client_id !== req.userId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        res.json(data);
    }
    catch (error) {
        console.error('Get quote error:', error);
        res.status(500).json({ error: 'Failed to get quote' });
    }
});
// PATCH /api/quotes/:id — admin updates draft quote
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('quotes')
            .update({ ...req.body, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('Update quote error:', error);
        res.status(500).json({ error: 'Failed to update quote' });
    }
});
// POST /api/quotes/:id/send — admin sends quote to client
router.post('/:id/send', requireAdmin, async (req, res) => {
    try {
        const { data: quote, error } = await supabaseAdmin
            .from('quotes')
            .update({ status: 'sent', updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select('*, proposals!quotes_proposal_id_fkey(title, client_id)')
            .single();
        if (error)
            throw error;
        // Update proposal status to 'quoted'
        await supabaseAdmin
            .from('proposals')
            .update({ status: 'quoted', updated_at: new Date().toISOString() })
            .eq('id', quote.proposal_id);
        await notify({
            userId: quote.proposals.client_id,
            type: 'quote_received',
            title: 'New Quote Received',
            message: `A quote for your proposal "${quote.proposals.title}" is ready for review.`,
            data: { quote_id: quote.id, proposal_id: quote.proposal_id, url: `/client/proposals/${quote.proposal_id}` },
            channels: ['in_app', 'email', 'whatsapp'],
        });
        res.json(quote);
    }
    catch (error) {
        console.error('Send quote error:', error);
        res.status(500).json({ error: 'Failed to send quote' });
    }
});
// POST /api/quotes/:id/respond — client accepts/negotiates/rejects
router.post('/:id/respond', requireClient, async (req, res) => {
    try {
        const { action, client_notes } = req.body;
        if (!['accepted', 'negotiating', 'rejected'].includes(action)) {
            res.status(400).json({ error: 'Invalid action' });
            return;
        }
        const updateData = {
            status: action,
            updated_at: new Date().toISOString(),
        };
        if (client_notes)
            updateData.client_notes = client_notes;
        const { data: quote, error } = await supabaseAdmin
            .from('quotes')
            .update(updateData)
            .eq('id', req.params.id)
            .select('*, proposals!quotes_proposal_id_fkey(title, client_id)')
            .single();
        if (error)
            throw error;
        if (action === 'accepted') {
            await supabaseAdmin
                .from('proposals')
                .update({ status: 'accepted', updated_at: new Date().toISOString() })
                .eq('id', quote.proposal_id);
            // Auto-create agreement
            const checklist = [
                { label: 'Project Scope', description: quote.scope_summary, confirmed: false, confirmed_at: null },
                { label: 'Timeline', description: `${quote.timeline_start || 'TBD'} to ${quote.timeline_end || 'TBD'}`, confirmed: false, confirmed_at: null },
                { label: 'Budget', description: `${quote.currency} ${quote.total_amount}`, confirmed: false, confirmed_at: null },
                { label: 'Payment Terms', description: JSON.stringify(quote.payment_schedule || []), confirmed: false, confirmed_at: null },
                { label: 'Revision Policy', description: 'As discussed and agreed upon', confirmed: false, confirmed_at: null },
            ];
            const { data: agreement } = await supabaseAdmin
                .from('agreements')
                .insert({
                quote_id: quote.id,
                client_id: quote.proposals.client_id,
                checklist_items: checklist,
                status: 'pending',
            })
                .select()
                .single();
            await notify({
                userId: quote.proposals.client_id,
                type: 'agreement_ready',
                title: 'Agreement Ready for Review',
                message: `Please review and confirm the agreement for "${quote.proposals.title}".`,
                data: { agreement_id: agreement?.id, proposal_id: quote.proposal_id, url: `/client/proposals/${quote.proposal_id}` },
                channels: ['in_app', 'email'],
            });
        }
        if (action === 'negotiating') {
            await supabaseAdmin
                .from('proposals')
                .update({ status: 'in_discussion', updated_at: new Date().toISOString() })
                .eq('id', quote.proposal_id);
        }
        const actionLabels = {
            accepted: 'accepted the quote',
            negotiating: 'requested negotiation on the quote',
            rejected: 'rejected the quote',
        };
        const { data: admins } = await supabaseAdmin.from('profiles').select('id').eq('role', 'admin');
        if (admins) {
            for (const admin of admins) {
                await notify({
                    userId: admin.id,
                    type: 'quote_response',
                    title: 'Quote Response',
                    message: `Client has ${actionLabels[action]} for "${quote.proposals.title}".`,
                    data: { quote_id: quote.id, proposal_id: quote.proposal_id, url: `/admin/proposals/${quote.proposal_id}` },
                    channels: ['in_app', 'email'],
                });
            }
        }
        res.json(quote);
    }
    catch (error) {
        console.error('Respond to quote error:', error);
        res.status(500).json({ error: 'Failed to respond to quote' });
    }
});
export default router;
//# sourceMappingURL=quotes.js.map