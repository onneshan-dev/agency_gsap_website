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

// GET /api/templates
app.get('/', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const category = c.req.query('category');

    let query = supabaseAdmin
      .from('proposal_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List templates error:', error);
    return c.json({ error: 'Failed to list templates' }, 500);
  }
});

// GET /api/templates/:id
app.get('/:id', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');

    const { data, error } = await supabaseAdmin
      .from('proposal_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return c.json({ error: 'Template not found' }, 404);
    return c.json(data);
  } catch (error) {
    console.error('Get template error:', error);
    return c.json({ error: 'Failed to get template' }, 500);
  }
});

// POST /api/templates (admin only)
app.post('/', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const body = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('proposal_templates')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    console.error('Create template error:', error);
    return c.json({ error: 'Failed to create template' }, 500);
  }
});

export default app;