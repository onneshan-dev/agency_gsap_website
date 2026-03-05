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

// POST /api/invoices
app.post('/', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const { project_id, milestone_id, client_id, amount, currency, description, line_items, due_date } = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert({
        project_id,
        milestone_id: milestone_id || null,
        client_id,
        amount,
        currency: currency || 'BDT',
        description: description || null,
        line_items: line_items || null,
        due_date: due_date || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    console.error('Create invoice error:', error);
    return c.json({ error: 'Failed to create invoice' }, 500);
  }
});

// GET /api/invoices
app.get('/', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userRole = c.get('userRole');
    const userId = c.get('userId');

    let query = supabaseAdmin
      .from('invoices')
      .select('*, projects!invoices_project_id_fkey(name), profiles!invoices_client_id_fkey(full_name, email)')
      .order('created_at', { ascending: false });

    if (userRole === 'client') {
      query = query.eq('client_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List invoices error:', error);
    return c.json({ error: 'Failed to list invoices' }, 500);
  }
});

// GET /api/invoices/:id
app.get('/:id', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*, projects!invoices_project_id_fkey(*), profiles!invoices_client_id_fkey(*)')
      .eq('id', id)
      .single();

    if (error) return c.json({ error: 'Invoice not found' }, 404);
    return c.json(data);
  } catch (error) {
    console.error('Get invoice error:', error);
    return c.json({ error: 'Failed to get invoice' }, 500);
  }
});

export default app;