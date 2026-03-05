import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAny } from '../middleware/roles.js';

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

const revertSchema = z.object({
  reason: z.string().min(1).max(500),
});

const getSupabase = (c: any) => createClient(
  c.env.SUPABASE_URL,
  c.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(authenticate);

// GET /api/proposals/:id/revisions
app.get('/:id/revisions', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const proposalId = c.req.param('id');
    const userRole = c.get('userRole');
    const userId = c.get('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    // Check access for clients
    if (userRole === 'client') {
      const { data: proposal } = await supabaseAdmin
        .from('proposals')
        .select('client_id')
        .eq('id', proposalId)
        .single();

      if (!proposal || proposal.client_id !== userId) {
        return c.json({ error: 'Access denied' }, 403);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('proposal_revisions')
      .select('*, profiles!proposal_revisions_created_by_fkey(full_name, avatar_url)')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return c.json({ error: 'Failed to fetch revisions' }, 500);
  }
});

export default app;