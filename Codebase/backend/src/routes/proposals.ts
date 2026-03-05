import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin, requireClient, requireAny } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { notify, notifyAdmins } from '../services/notification.js';
import { startStatusTracking, trackStatusChange } from '../services/slaTracking.js';
import { trackStatusChangeRevision, trackAdminNotesChange } from '../services/revisionTracking.js';

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
router.post('/', requireClient, validate(createProposalSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('proposals').insert({
      client_id: req.userId!,
      ...req.body,
      status: 'submitted',
    }).select().single();

    if (error) throw error;

    // Start SLA tracking for the new proposal
    await startStatusTracking(data.id, 'submitted', null, 'Proposal submitted by client');

    await notifyAdmins(
      'proposal_status',
      'New Proposal Submitted',
      `A new proposal "${req.body.title}" has been submitted.`,
      { proposal_id: data.id, url: `/admin/proposals/${data.id}` },
      ['in_app'],
    );

    res.status(201).json(data);
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// GET /api/proposals — admin lists all proposals
router.get('/', requireAdmin, async (req: AuthenticatedRequest, res) => {
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
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('List proposals error:', error);
    res.status(500).json({ error: 'Failed to list proposals' });
  }
});

// GET /api/proposals/mine — client lists own proposals
router.get('/mine', requireClient, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .eq('client_id', req.userId!)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('List my proposals error:', error);
    res.status(500).json({ error: 'Failed to list proposals' });
  }
});

// GET /api/proposals/:id — both admin and client view detail
router.get('/:id', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select('*, profiles!proposals_client_id_fkey(full_name, email, phone, avatar_url)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) { res.status(404).json({ error: 'Proposal not found' }); return; }

    if (req.userRole === 'client' && data.client_id !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({ error: 'Failed to get proposal' });
  }
});

// PATCH /api/proposals/:id/status — admin updates proposal status
router.patch('/:id/status', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { status, admin_notes, assigned_to, change_reason } = req.body;
    const validStatuses = ['under_review', 'in_discussion', 'quoted', 'rejected', 'accepted', 'converted'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Get current proposal state before update
    const { data: beforeProposal } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .eq('id', req.params.id)
      .single();

    const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .update(updateData)
      .eq('id', req.params.id)
      .select('*, profiles!proposals_client_id_fkey(full_name, email)')
      .single();

    if (error) throw error;

    // Track the status change for SLA tracking
    await trackStatusChange(
      data.id,
      status,
      assigned_to || null,
      admin_notes || `Status changed to ${status}`
    );

    // Track revision
    await trackStatusChangeRevision(
      data.id,
      req.userId!,
      beforeProposal?.status || '',
      status,
      data,
      change_reason || admin_notes || `Status changed from ${beforeProposal?.status} to ${status}`
    );

    const statusLabels: Record<string, string> = {
      under_review: 'is now under review',
      in_discussion: 'is now in discussion',
      quoted: 'has received a quote',
      rejected: 'has been declined',
      accepted: 'has been accepted',
      converted: 'has been converted to a project',
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
  } catch (error) {
    console.error('Update proposal status error:', error);
    res.status(500).json({ error: 'Failed to update proposal' });
  }
});

// DELETE /api/proposals/:id — client deletes own draft
router.delete('/:id', requireClient, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: proposal } = await supabaseAdmin
      .from('proposals')
      .select('client_id, status')
      .eq('id', req.params.id)
      .single();

    if (!proposal) { res.status(404).json({ error: 'Not found' }); return; }
    if (proposal.client_id !== req.userId) { res.status(403).json({ error: 'Access denied' }); return; }
    if (proposal.status !== 'draft') { res.status(400).json({ error: 'Can only delete draft proposals' }); return; }

    const { error } = await supabaseAdmin.from('proposals').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete proposal error:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
});

// ============================================
// Revision History Routes - Mounted at /api/proposals/:id/revisions
// ============================================

// GET /api/proposals/:id/revisions - Get all revisions
router.get('/:id/revisions', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { id: proposalId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    // Check access for clients
    if (req.userRole === 'client') {
      const { data: proposal } = await supabaseAdmin
        .from('proposals')
        .select('client_id')
        .eq('id', proposalId)
        .single();

      if (!proposal || proposal.client_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    const { data: revisions, error } = await supabaseAdmin
      .from('proposal_revision_history')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('revision_number', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(revisions || []);
  } catch (error) {
    console.error('Error fetching revisions:', error);
    res.status(500).json({ error: 'Failed to fetch revisions' });
  }
});

// GET /api/proposals/:id/revisions/:revisionNumber - Get specific revision
router.get('/:id/revisions/:revisionNumber', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { id: proposalId, revisionNumber } = req.params;
    const revNum = parseInt(revisionNumber);

    if (isNaN(revNum) || revNum < 1) {
      res.status(400).json({ error: 'Invalid revision number' });
      return;
    }

    // Check access for clients
    if (req.userRole === 'client') {
      const { data: proposal } = await supabaseAdmin
        .from('proposals')
        .select('client_id')
        .eq('id', proposalId)
        .single();

      if (!proposal || proposal.client_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    const { data: revision, error } = await supabaseAdmin
      .from('proposal_revision_history')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('revision_number', revNum)
      .single();

    if (error || !revision) {
      res.status(404).json({ error: 'Revision not found' });
      return;
    }

    res.json(revision);
  } catch (error) {
    console.error('Error fetching revision:', error);
    res.status(500).json({ error: 'Failed to fetch revision' });
  }
});

// GET /api/proposals/:id/revisions/compare - Compare two revisions
router.get('/:id/revisions/compare', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id: proposalId } = req.params;
    const from = parseInt(req.query.from as string);
    const to = parseInt(req.query.to as string);

    if (isNaN(from) || isNaN(to) || from < 1 || to < 1) {
      res.status(400).json({ error: 'Invalid revision numbers' });
      return;
    }

    // Use the database function to compare
    const { data: differences, error } = await supabaseAdmin.rpc('compare_revisions', {
      p_proposal_id: proposalId,
      p_from_revision: from,
      p_to_revision: to,
    });

    if (error) {
      // Fallback: manual comparison
      const [fromRev, toRev] = await Promise.all([
        supabaseAdmin
          .from('proposal_revisions')
          .select('snapshot')
          .eq('proposal_id', proposalId)
          .eq('revision_number', from)
          .single(),
        supabaseAdmin
          .from('proposal_revisions')
          .select('snapshot')
          .eq('proposal_id', proposalId)
          .eq('revision_number', to)
          .single(),
      ]);

      if (!fromRev.data || !toRev.data) {
        res.status(404).json({ error: 'Revisions not found' });
        return;
      }

      const diffs: { field_name: string; old_value: any; new_value: any }[] = [];
      const allKeys = new Set([
        ...Object.keys(fromRev.data.snapshot || {}),
        ...Object.keys(toRev.data.snapshot || {}),
      ]);

      allKeys.forEach(key => {
        const oldVal = fromRev.data.snapshot?.[key];
        const newVal = toRev.data.snapshot?.[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          diffs.push({ field_name: key, old_value: oldVal, new_value: newVal });
        }
      });

      res.json({ from_revision: from, to_revision: to, differences: diffs });
      return;
    }

    res.json({ from_revision: from, to_revision: to, differences });
  } catch (error) {
    console.error('Error comparing revisions:', error);
    res.status(500).json({ error: 'Failed to compare revisions' });
  }
});

export default router;
