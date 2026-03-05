import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin, requireClient, requireAny } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { notify, notifyAdmins } from '../services/notification.js';
const router = Router();
const createProposalSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10),
    category: z.enum(['web_app', 'mobile_app', 'ecommerce', 'saas', 'other']).optional(),
    budget_range: z.enum(['under_5k', '5k_15k', '15k_50k', '50k_plus', 'not_sure']).optional(),
    timeline_preference: z.enum(['1_month', '1_3_months', '3_6_months', '6_plus', 'flexible']).optional(),
    documents: z.array(z.object({
        name: z.string(),
        url: z.string(),
        key: z.string(),
    })).optional(),
});
// POST /api/proposals — client submits a new proposal
router.post('/', requireClient, validate(createProposalSchema), async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('proposals').insert({
            client_id: req.userId,
            ...req.body,
            status: 'submitted',
        }).select().single();
        if (error)
            throw error;
        await notifyAdmins('proposal_status', 'New Proposal Submitted', `A new proposal "${req.body.title}" has been submitted.`, { proposal_id: data.id, url: `/admin/proposals/${data.id}` }, ['in_app']);
        res.status(201).json(data);
    }
    catch (error) {
        console.error('Create proposal error:', error);
        res.status(500).json({ error: 'Failed to create proposal' });
    }
});
// GET /api/proposals — admin lists all proposals
router.get('/', requireAdmin, async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = supabaseAdmin
            .from('proposals')
            .select('*, profiles!proposals_client_id_fkey(full_name, email, phone, avatar_url)')
            .order('created_at', { ascending: false });
        if (status && typeof status === 'string') {
            query = query.eq('status', status);
        }
        if (search && typeof search === 'string') {
            query = query.ilike('title', `%${search}%`);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('List proposals error:', error);
        res.status(500).json({ error: 'Failed to list proposals' });
    }
});
// GET /api/proposals/mine — client lists own proposals
router.get('/mine', requireClient, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('proposals')
            .select('*')
            .eq('client_id', req.userId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('List my proposals error:', error);
        res.status(500).json({ error: 'Failed to list proposals' });
    }
});
// GET /api/proposals/:id — both admin and client view detail
router.get('/:id', requireAny, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('proposals')
            .select('*, profiles!proposals_client_id_fkey(full_name, email, phone, avatar_url)')
            .eq('id', req.params.id)
            .single();
        if (error)
            throw error;
        if (!data) {
            res.status(404).json({ error: 'Proposal not found' });
            return;
        }
        if (req.userRole === 'client' && data.client_id !== req.userId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        res.json(data);
    }
    catch (error) {
        console.error('Get proposal error:', error);
        res.status(500).json({ error: 'Failed to get proposal' });
    }
});
// PATCH /api/proposals/:id/status — admin updates proposal status
router.patch('/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const validStatuses = ['under_review', 'in_discussion', 'quoted', 'rejected'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        const updateData = { status, updated_at: new Date().toISOString() };
        if (admin_notes !== undefined)
            updateData.admin_notes = admin_notes;
        const { data, error } = await supabaseAdmin
            .from('proposals')
            .update(updateData)
            .eq('id', req.params.id)
            .select('*, profiles!proposals_client_id_fkey(full_name, email)')
            .single();
        if (error)
            throw error;
        const statusLabels = {
            under_review: 'is now under review',
            in_discussion: 'is now in discussion',
            quoted: 'has received a quote',
            rejected: 'has been declined',
        };
        await notify({
            userId: data.client_id,
            type: 'proposal_status',
            title: 'Proposal Update',
            message: `Your proposal "${data.title}" ${statusLabels[status] || 'has been updated'}.`,
            data: { proposal_id: data.id, url: `/client/proposals/${data.id}` },
            channels: status === 'rejected' ? ['in_app', 'email'] : ['in_app', 'email'],
        });
        res.json(data);
    }
    catch (error) {
        console.error('Update proposal status error:', error);
        res.status(500).json({ error: 'Failed to update proposal' });
    }
});
// DELETE /api/proposals/:id — client deletes own draft
router.delete('/:id', requireClient, async (req, res) => {
    try {
        const { data: proposal } = await supabaseAdmin
            .from('proposals')
            .select('client_id, status')
            .eq('id', req.params.id)
            .single();
        if (!proposal) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        if (proposal.client_id !== req.userId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        if (proposal.status !== 'draft') {
            res.status(400).json({ error: 'Can only delete draft proposals' });
            return;
        }
        const { error } = await supabaseAdmin.from('proposals').delete().eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete proposal error:', error);
        res.status(500).json({ error: 'Failed to delete proposal' });
    }
});
export default router;
//# sourceMappingURL=proposals.js.map