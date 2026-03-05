import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAny } from '../middleware/roles.js';

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

// GET /api/sla/config
app.get('/config', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const { data, error } = await supabaseAdmin
      .from('sla_config')
      .select('*')
      .order('status');

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Error fetching SLA config:', error);
    return c.json({ error: 'Failed to fetch SLA configuration' }, 500);
  }
});

// GET /api/sla/proposals-at-risk
app.get('/proposals-at-risk', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const { data, error } = await supabaseAdmin
      .from('proposal_sla_status')
      .select('*, proposals!proposal_sla_status_proposal_id_fkey(*)')
      .in('status', ['at_risk', 'breached'])
      .order('hours_in_status', { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Error fetching proposals at risk:', error);
    return c.json({ error: 'Failed to fetch proposals at risk' }, 500);
  }
});

// GET /api/sla/proposals/:id/timeline
app.get('/proposals/:id/timeline', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');

    const { data, error } = await supabaseAdmin
      .from('proposal_status_timeline')
      .select('*')
      .eq('proposal_id', id)
      .order('entered_at', { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return c.json({ error: 'Failed to fetch timeline' }, 500);
  }
});

export default app;