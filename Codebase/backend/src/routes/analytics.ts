import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const app = new Hono<{ 
  Bindings: { 
    SUPABASE_URL: string; 
    SUPABASE_SERVICE_ROLE_KEY: string;
  };
  Variables: {
    userId: string;
    userRole: string;
    userEmail: string;
  };
}>();

const getSupabase = (c: any) => createClient(
  c.env.SUPABASE_URL,
  c.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(authenticate);

// GET /api/analytics/dashboard
app.get('/dashboard', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const { data, error } = await supabaseAdmin
      .from('proposal_analytics_summary')
      .select('*')
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return c.json({ error: 'Failed to fetch dashboard analytics' }, 500);
  }
});

// GET /api/analytics/funnel
app.get('/funnel', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const from = c.req.query('from');
    const to = c.req.query('to');

    const { data, error } = await supabaseAdmin.rpc('get_conversion_funnel', {
      p_from_date: from || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      p_to_date: to || new Date().toISOString().split('T')[0],
    });

    if (error) {
      // Fallback query
      const { data: funnelData, error: funnelError } = await supabaseAdmin
        .from('proposal_funnel_by_month')
        .select('*')
        .order('month', { ascending: false });

      if (funnelError) throw funnelError;
      return c.json(funnelData);
    }

    return c.json(data);
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    return c.json({ error: 'Failed to fetch funnel data' }, 500);
  }
});

// GET /api/analytics/pipeline
app.get('/pipeline', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const { data, error } = await supabaseAdmin
      .from('proposals_by_status')
      .select('*');

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return c.json({ error: 'Failed to fetch pipeline data' }, 500);
  }
});

// GET /api/analytics/team-performance
app.get('/team-performance', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const { data, error } = await supabaseAdmin
      .from('team_performance_metrics')
      .select('*');

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    return c.json({ error: 'Failed to fetch team performance' }, 500);
  }
});

export default app;