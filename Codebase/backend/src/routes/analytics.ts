import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = Router();

// ============================================
// GET /api/analytics/dashboard - Main dashboard KPIs
// ============================================
router.get('/dashboard', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposal_analytics_summary')
      .select('*')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// ============================================
// GET /api/analytics/funnel - Conversion funnel data
// ============================================
router.get('/funnel', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { from, to } = req.query;
    
    const fromDate = from && typeof from === 'string' 
      ? from 
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = to && typeof to === 'string' 
      ? to 
      : new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin.rpc('get_conversion_funnel', {
      p_from_date: fromDate,
      p_to_date: toDate,
    });

    if (error) {
      // Fallback query
      const { data: funnelData, error: funnelError } = await supabaseAdmin
        .from('proposal_funnel_by_month')
        .select('*')
        .order('month', { ascending: false })
        .limit(1)
        .single();

      if (funnelError) throw funnelError;
      
      const total = funnelData?.submitted || 1;
      res.json([
        { stage: 'Submitted', count: funnelData?.submitted || 0, percentage: 100 },
        { stage: 'Reviewed', count: funnelData?.reviewed || 0, percentage: ((funnelData?.reviewed || 0) / total) * 100 },
        { stage: 'Quoted', count: funnelData?.quoted || 0, percentage: ((funnelData?.quoted || 0) / total) * 100 },
        { stage: 'Accepted', count: funnelData?.accepted || 0, percentage: ((funnelData?.accepted || 0) / total) * 100 },
        { stage: 'Converted', count: funnelData?.converted || 0, percentage: ((funnelData?.converted || 0) / total) * 100 },
      ]);
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    res.status(500).json({ error: 'Failed to fetch funnel data' });
  }
});

// ============================================
// GET /api/analytics/trends - Monthly trends
// ============================================
router.get('/trends', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { months = '12' } = req.query;
    const monthsLimit = parseInt(months as string) || 12;

    const { data, error } = await supabaseAdmin
      .from('proposal_funnel_by_month')
      .select('*')
      .order('month', { ascending: true })
      .limit(monthsLimit);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// ============================================
// GET /api/analytics/categories - Category performance
// ============================================
router.get('/categories', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('category_performance')
      .select('*')
      .order('total_proposals', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching category performance:', error);
    res.status(500).json({ error: 'Failed to fetch category performance' });
  }
});

// ============================================
// GET /api/analytics/team - Team performance
// ============================================
router.get('/team', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_performance')
      .select('*')
      .order('sla_compliance_rate', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    res.status(500).json({ error: 'Failed to fetch team performance' });
  }
});

// ============================================
// GET /api/analytics/templates - Template usage
// ============================================
router.get('/templates', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('template_usage_analytics')
      .select('*')
      .order('usage_count', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching template analytics:', error);
    res.status(500).json({ error: 'Failed to fetch template analytics' });
  }
});

// ============================================
// GET /api/analytics/pipeline - Pipeline value
// ============================================
router.get('/pipeline', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('pipeline_value')
      .select('*')
      .order('total_estimated_value', { ascending: false });

    if (error) throw error;
    
    const total = data?.reduce((sum, item) => sum + (item.total_estimated_value || 0), 0) || 0;
    
    res.json({
      by_status: data || [],
      total_pipeline_value: total,
    });
  } catch (error) {
    console.error('Error fetching pipeline data:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline data' });
  }
});

// ============================================
// GET /api/analytics/aging - Aging report
// ============================================
router.get('/aging', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_aging_report');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching aging report:', error);
    res.status(500).json({ error: 'Failed to fetch aging report' });
  }
});

// ============================================
// GET /api/analytics/sla - SLA performance metrics
// ============================================
router.get('/sla', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: summary, error: summaryError } = await supabaseAdmin
      .from('proposal_analytics_summary')
      .select('on_track_count, warning_count, breached_count, sla_compliance_rate')
      .single();

    if (summaryError) throw summaryError;

    // Get SLA performance by status
    const { data: byStatus, error: statusError } = await supabaseAdmin
      .from('proposal_status_durations')
      .select('status, avg(duration_seconds)/3600 as avg_hours, avg(CASE WHEN sla_met THEN 1 ELSE 0 END)*100 as compliance_rate')
      .not('exited_at', 'is', null)
      .group('status');

    if (statusError) throw statusError;

    res.json({
      overview: summary,
      by_status: byStatus || [],
    });
  } catch (error) {
    console.error('Error fetching SLA analytics:', error);
    res.status(500).json({ error: 'Failed to fetch SLA analytics' });
  }
});

// ============================================
// POST /api/analytics/refresh - Refresh materialized views
// ============================================
router.post('/refresh', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    await supabaseAdmin.rpc('refresh_analytics_views');
    res.json({ success: true, message: 'Analytics views refreshed' });
  } catch (error) {
    console.error('Error refreshing analytics:', error);
    res.status(500).json({ error: 'Failed to refresh analytics' });
  }
});

// ============================================
// GET /api/analytics/export - Export analytics data
// ============================================
router.get('/export', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { type = 'all' } = req.query;
    
    let data: Record<string, any> = {};
    
    if (type === 'all' || type === 'summary') {
      const { data: summary } = await supabaseAdmin
        .from('proposal_analytics_summary')
        .select('*')
        .single();
      data.summary = summary;
    }
    
    if (type === 'all' || type === 'trends') {
      const { data: trends } = await supabaseAdmin
        .from('proposal_funnel_by_month')
        .select('*')
        .order('month', { ascending: false });
      data.trends = trends;
    }
    
    if (type === 'all' || type === 'categories') {
      const { data: categories } = await supabaseAdmin
        .from('category_performance')
        .select('*');
      data.categories = categories;
    }
    
    if (type === 'all' || type === 'team') {
      const { data: team } = await supabaseAdmin
        .from('team_performance')
        .select('*');
      data.team = team;
    }

    res.json(data);
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Failed to export analytics' });
  }
});

export default router;