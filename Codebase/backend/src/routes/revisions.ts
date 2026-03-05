import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin, requireAny } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import {
  getProposalRevisions,
  getRevision,
  compareRevisions,
  revertToRevision,
} from '../services/revisionTracking.js';

const router = Router({ mergeParams: true });

// Schema for revert request
const revertSchema = z.object({
  reason: z.string().min(1).max(500),
});

// ============================================
// GET /api/proposals/:id/revisions - Get all revisions for a proposal
// ============================================
router.get('/', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { id: proposalId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

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

    const revisions = await getProposalRevisions(proposalId, { limit, offset });
    res.json(revisions);
  } catch (error) {
    console.error('Error fetching revisions:', error);
    res.status(500).json({ error: 'Failed to fetch revisions' });
  }
});

// ============================================
// GET /api/proposals/:id/revisions/:revisionNumber - Get specific revision
// ============================================
router.get('/:revisionNumber', requireAny, async (req: AuthenticatedRequest, res) => {
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

    const revision = await getRevision(proposalId, revNum);
    
    if (!revision) {
      res.status(404).json({ error: 'Revision not found' });
      return;
    }

    res.json(revision);
  } catch (error) {
    console.error('Error fetching revision:', error);
    res.status(500).json({ error: 'Failed to fetch revision' });
  }
});

// ============================================
// GET /api/proposals/:id/revisions/compare - Compare two revisions
// ============================================
router.get('/compare', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { id: proposalId } = req.params;
    const from = parseInt(req.query.from as string);
    const to = parseInt(req.query.to as string);

    if (isNaN(from) || isNaN(to) || from < 1 || to < 1) {
      res.status(400).json({ error: 'Invalid revision numbers' });
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

    const differences = await compareRevisions(proposalId, from, to);
    
    if (!differences) {
      res.status(404).json({ error: 'Could not compare revisions' });
      return;
    }

    res.json({
      from_revision: from,
      to_revision: to,
      differences,
    });
  } catch (error) {
    console.error('Error comparing revisions:', error);
    res.status(500).json({ error: 'Failed to compare revisions' });
  }
});

// ============================================
// POST /api/proposals/:id/revisions/:revisionNumber/revert - Revert to a revision
// ============================================
router.post(
  '/:revisionNumber/revert',
  requireAdmin,
  validate(revertSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id: proposalId, revisionNumber } = req.params;
      const revNum = parseInt(revisionNumber);
      const { reason } = req.body;

      if (isNaN(revNum) || revNum < 1) {
        res.status(400).json({ error: 'Invalid revision number' });
        return;
      }

      const success = await revertToRevision(
        proposalId,
        revNum,
        req.userId!,
        reason
      );

      if (!success) {
        res.status(500).json({ error: 'Failed to revert to revision' });
        return;
      }

      // Fetch the updated revisions list
      const revisions = await getProposalRevisions(proposalId, { limit: 10 });
      
      res.json({
        success: true,
        message: `Reverted to revision ${revNum}`,
        revisions,
      });
    } catch (error) {
      console.error('Error reverting revision:', error);
      res.status(500).json({ error: 'Failed to revert to revision' });
    }
  }
);

// ============================================
// GET /api/proposals/:id/revisions/latest - Get latest revision
// ============================================
router.get('/latest', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { id: proposalId } = req.params;

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

    const { data: proposal } = await supabaseAdmin
      .from('proposals')
      .select('current_revision_number')
      .eq('id', proposalId)
      .single();

    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    const revision = await getRevision(proposalId, proposal.current_revision_number);
    
    if (!revision) {
      res.status(404).json({ error: 'No revisions found' });
      return;
    }

    res.json(revision);
  } catch (error) {
    console.error('Error fetching latest revision:', error);
    res.status(500).json({ error: 'Failed to fetch latest revision' });
  }
});

export default router;