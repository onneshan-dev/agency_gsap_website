import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin, requireAny } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import {
  getSLAConfig,
  updateSLAConfig,
  getProposalSLAStatus,
  getProposalTimeline,
  getProposalsAtRisk,
} from '../services/slaTracking.js';

const router = Router();

// Schema for updating SLA config
const updateSLAConfigSchema = z.object({
  target_hours: z.number().min(1).optional(),
  warning_threshold_hours: z.number().min(1).optional(),
  is_active: z.boolean().optional(),
});

// ============================================
// GET /api/sla/config - Get all SLA configurations
// ============================================
router.get('/config', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const config = await getSLAConfig();
    res.json(config);
  } catch (error) {
    console.error('Error fetching SLA config:', error);
    res.status(500).json({ error: 'Failed to fetch SLA configuration' });
  }
});

// ============================================
// PATCH /api/sla/config/:status - Update SLA configuration for a status
// ============================================
router.patch(
  '/config/:status',
  requireAdmin,
  validate(updateSLAConfigSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { status } = req.params;
      const validStatuses = ['submitted', 'under_review', 'in_discussion', 'quoted', 'accepted'];
      
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const success = await updateSLAConfig(status, req.body);
      
      if (!success) {
        res.status(500).json({ error: 'Failed to update SLA configuration' });
        return;
      }

      // Return updated config
      const config = await getSLAConfig();
      res.json(config);
    } catch (error) {
      console.error('Error updating SLA config:', error);
      res.status(500).json({ error: 'Failed to update SLA configuration' });
    }
  }
);

// ============================================
// GET /api/sla/proposals/:id/status - Get SLA status for a proposal
// ============================================
router.get('/proposals/:id/status', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check access for clients
    if (req.userRole === 'client') {
      const { data: proposal } = await supabaseAdmin
        .from('proposals')
        .select('client_id')
        .eq('id', id)
        .single();

      if (!proposal || proposal.client_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    const slaStatus = await getProposalSLAStatus(id);
    
    if (!slaStatus) {
      res.status(404).json({ error: 'SLA status not found' });
      return;
    }

    res.json(slaStatus);
  } catch (error) {
    console.error('Error fetching SLA status:', error);
    res.status(500).json({ error: 'Failed to fetch SLA status' });
  }
});

// ============================================
// GET /api/sla/proposals/:id/timeline - Get full status timeline
// ============================================
router.get('/proposals/:id/timeline', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check access for clients
    if (req.userRole === 'client') {
      const { data: proposal } = await supabaseAdmin
        .from('proposals')
        .select('client_id')
        .eq('id', id)
        .single();

      if (!proposal || proposal.client_id !== req.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    const timeline = await getProposalTimeline(id);
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// ============================================
// GET /api/sla/at-risk - Get proposals at risk of SLA breach
// ============================================
router.get('/at-risk', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const atRisk = await getProposalsAtRisk(limit);
    res.json(atRisk);
  } catch (error) {
    console.error('Error fetching at-risk proposals:', error);
    res.status(500).json({ error: 'Failed to fetch at-risk proposals' });
  }
});

// ============================================
// GET /api/sla/dashboard - Dashboard SLA metrics
// ============================================
router.get('/dashboard', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // Get overall SLA metrics
    const { data: slaStats, error: statsError } = await supabaseAdmin.rpc(
      'get_sla_dashboard_stats'
    );

    if (statsError) {
      // Fallback query if RPC doesn't exist
      const { data: activeProposals, error } = await supabaseAdmin
        .from('proposal_sla_status')
        .select('sla_status');

      if (error) throw error;

      const metrics = {
        total_active: activeProposals?.length || 0,
        on_track: activeProposals?.filter(p => p.sla_status === 'on_track').length || 0,
        warning: activeProposals?.filter(p => p.sla_status === 'warning').length || 0,
        breached: activeProposals?.filter(p => p.sla_status === 'breached').length || 0,
        compliance_rate: 0,
      };

      metrics.compliance_rate = metrics.total_active > 0
        ? Math.round((metrics.on_track / metrics.total_active) * 100)
        : 100;

      res.json(metrics);
      return;
    }

    res.json(slaStats);
  } catch (error) {
    console.error('Error fetching SLA dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch SLA dashboard' });
  }
});

// ============================================
// GET /api/sla/performance/:userId - Get SLA performance for a user
// ============================================
router.get('/performance/:userId', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;

    // Get status durations where user was assigned
    const query = supabaseAdmin
      .from('proposal_status_durations')
      .select('status, duration_seconds, sla_target_hours, sla_met, entered_at')
      .eq('assigned_to', userId)
      .not('exited_at', 'is', null);

    if (from && typeof from === 'string') {
      query.gte('entered_at', from);
    }
    if (to && typeof to === 'string') {
      query.lte('entered_at', to);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate metrics
    const totalAssignments = data?.length || 0;
    const withSla = data?.filter(d => d.sla_target_hours !== null) || [];
    const slaMet = withSla.filter(d => d.sla_met === true).length;
    const slaCompliance = withSla.length > 0 
      ? Math.round((slaMet / withSla.length) * 100) 
      : 100;

    // Average time per status
    const avgTimeByStatus: Record<string, number> = {};
    const statusGroups = data?.reduce((acc, curr) => {
      if (!acc[curr.status]) acc[curr.status] = [];
      acc[curr.status].push(curr.duration_seconds || 0);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(statusGroups || {}).forEach(([status, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      avgTimeByStatus[status] = Math.round(avg / 3600 * 10) / 10; // Hours with 1 decimal
    });

    res.json({
      total_assignments: totalAssignments,
      sla_compliance_rate: slaCompliance,
      sla_met: slaMet,
      sla_total: withSla.length,
      average_time_by_status: avgTimeByStatus,
    });
  } catch (error) {
    console.error('Error fetching user performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

export default router;