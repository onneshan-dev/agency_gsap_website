import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAny, requireClient } from '../middleware/roles.js';

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

const createQuoteSchema = z.object({
  proposal_id: z.string().uuid(),
  scope_summary: z.string().min(10),
  line_items: z.array(z.object({
    description: z.string(),
    amount: z.number().min(0),
  })).min(1),
  total_amount: z.number().min(0),
  currency: z.string().default('BDT'),
  timeline_start: z.string().optional(),
  timeline_end: z.string().optional(),
  payment_schedule: z.array(z.object({
    milestone_title: z.string(),
    amount: z.number().min(0),
    due_condition: z.string(),
  })).optional(),
  valid_until: z.string().optional(),
});

const getSupabase = (c: any) => createClient(
  c.env.SUPABASE_URL,
  c.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(authenticate);

// POST /api/quotes — admin creates a quote
app.post('/', requireAdmin, zValidator('json', createQuoteSchema), async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { data, error } = await supabaseAdmin
      .from('quotes')
      .insert({ ...body, created_by: userId, status: 'draft' })
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    console.error('Create quote error:', error);
    return c.json({ error: 'Failed to create quote' }, 500);
  }
});

// GET /api/quotes/:id — view quote detail
app.get('/:id', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');
    const userRole = c.get('userRole');
    const userId = c.get('userId');

    const { data, error } = await supabaseAdmin
      .from('quotes')
      .select('*, proposals!quotes_proposal_id_fkey(title, client_id)')
      .eq('id', id)
      .single();

    if (error) return c.json({ error: 'Quote not found' }, 404);
    if (!data) return c.json({ error: 'Quote not found' }, 404);

    if (userRole === 'client' && data.proposals?.client_id !== userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json(data);
  } catch (error) {
    console.error('Get quote error:', error);
    return c.json({ error: 'Failed to get quote' }, 500);
  }
});

// PATCH /api/quotes/:id — admin updates draft quote
app.patch('/:id', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');
    const body = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('quotes')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Update quote error:', error);
    return c.json({ error: 'Failed to update quote' }, 500);
  }
});

// POST /api/quotes/:id/send — admin sends quote to client
app.post('/:id/send', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');

    const { data: quote, error } = await supabaseAdmin
      .from('quotes')
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, proposals!quotes_proposal_id_fkey(title, client_id)')
      .single();

    if (error) throw error;

    // Update proposal status to 'quoted'
    await supabaseAdmin
      .from('proposals')
      .update({ status: 'quoted', updated_at: new Date().toISOString() })
      .eq('id', quote.proposal_id);

    return c.json(quote);
  } catch (error) {
    console.error('Send quote error:', error);
    return c.json({ error: 'Failed to send quote' }, 500);
  }
});

// POST /api/quotes/:id/respond — client accepts/negotiates/rejects
app.post('/:id/respond', requireClient, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');
    const { action, client_notes } = await c.req.json();

    if (!['accepted', 'negotiating', 'rejected'].includes(action)) {
      return c.json({ error: 'Invalid action' }, 400);
    }

    const updateData: Record<string, unknown> = {
      status: action,
      updated_at: new Date().toISOString(),
    };
    if (client_notes) updateData.client_notes = client_notes;

    const { data: quote, error } = await supabaseAdmin
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .select('*, proposals!quotes_proposal_id_fkey(title, client_id)')
      .single();

    if (error) throw error;

    if (action === 'accepted') {
      await supabaseAdmin
        .from('proposals')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', quote.proposal_id);

      // Auto-create agreement
      const checklist = [
        { label: 'Project Scope', description: quote.scope_summary, confirmed: false, confirmed_at: null },
        { label: 'Timeline', description: `${quote.timeline_start || 'TBD'} to ${quote.timeline_end || 'TBD'}`, confirmed: false, confirmed_at: null },
        { label: 'Budget', description: `${quote.currency} ${quote.total_amount}`, confirmed: false, confirmed_at: null },
        { label: 'Payment Terms', description: JSON.stringify(quote.payment_schedule || []), confirmed: false, confirmed_at: null },
        { label: 'Revision Policy', description: 'As discussed and agreed upon', confirmed: false, confirmed_at: null },
      ];

      await supabaseAdmin
        .from('agreements')
        .insert({
          quote_id: quote.id,
          client_id: quote.proposals!.client_id,
          checklist_items: checklist,
          status: 'pending',
        });
    }

    if (action === 'negotiating') {
      await supabaseAdmin
        .from('proposals')
        .update({ status: 'in_discussion', updated_at: new Date().toISOString() })
        .eq('id', quote.proposal_id);
    }

    return c.json(quote);
  } catch (error) {
    console.error('Respond to quote error:', error);
    return c.json({ error: 'Failed to respond to quote' }, 500);
  }
});

export default app;