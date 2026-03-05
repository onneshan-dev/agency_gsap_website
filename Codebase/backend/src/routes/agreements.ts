import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAny, requireClient } from '../middleware/roles.js';

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

// GET /api/agreements/:id — view agreement
app.get('/:id', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');
    const userRole = c.get('userRole');
    const userId = c.get('userId');

    const { data, error } = await supabaseAdmin
      .from('agreements')
      .select('*, quotes!agreements_quote_id_fkey(*, proposals!quotes_proposal_id_fkey(title, client_id))')
      .eq('id', id)
      .single();

    if (error) return c.json({ error: 'Agreement not found' }, 404);
    if (!data) return c.json({ error: 'Agreement not found' }, 404);

    if (userRole === 'client' && data.client_id !== userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json(data);
  } catch (error) {
    console.error('Get agreement error:', error);
    return c.json({ error: 'Failed to get agreement' }, 500);
  }
});

// POST /api/agreements/:id/confirm — client confirms all checklist items
app.post('/:id/confirm', requireClient, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');
    const id = c.req.param('id');
    const { confirmed_items } = await c.req.json();

    const { data: agreement, error: fetchError } = await supabaseAdmin
      .from('agreements')
      .select('*, quotes!agreements_quote_id_fkey(*, proposals!quotes_proposal_id_fkey(title, client_id))')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!agreement) return c.json({ error: 'Agreement not found' }, 404);
    if (agreement.client_id !== userId) return c.json({ error: 'Access denied' }, 403);

    const now = new Date().toISOString();

    // Update checklist items
    const updatedChecklist = (agreement.checklist_items as Array<Record<string, unknown>>).map(
      (item, index) => ({
        ...item,
        confirmed: confirmed_items?.includes(index) ?? true,
        confirmed_at: confirmed_items?.includes(index) ?? true ? now : null,
      })
    );

    const { data, error } = await supabaseAdmin
      .from('agreements')
      .update({
        checklist_items: updatedChecklist,
        status: 'confirmed',
        confirmed_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update proposal status to 'agreement_confirmed'
    await supabaseAdmin
      .from('proposals')
      .update({ status: 'agreement_confirmed', updated_at: now })
      .eq('id', agreement.quotes.proposals.id);

    return c.json(data);
  } catch (error) {
    console.error('Confirm agreement error:', error);
    return c.json({ error: 'Failed to confirm agreement' }, 500);
  }
});

export default app;