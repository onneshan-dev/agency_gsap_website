import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireClient } from '../middleware/roles.js';

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

// Apply auth middleware to all routes
app.use(authenticate);

const createProposalSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  category: z.enum(['web_app', 'mobile_app', 'ecommerce', 'saas', 'other']).optional(),
  budget_range: z.enum(['under_5k', '5k_15k', '15k_50k', '50k_plus', 'not_sure']).optional(),
  timeline_preference: z.enum(['1_month', '1_3_months', '3_6_months', '6_plus', 'flexible']).optional(),
  documents: z.array(z.object({
    name: z.string(),
    url: z.string(),
    key: z.string(),
  })).optional(),
});

// Helper to get Supabase client
const getSupabase = (c: any) => createClient(
  c.env.SUPABASE_URL,
  c.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/proposals — client submits a new proposal
app.post('/', requireClient, zValidator('json', createProposalSchema), async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { data, error } = await supabaseAdmin.from('proposals').insert({
      client_id: userId,
      ...body,
      status: 'submitted',
    }).select().single();

    if (error) throw error;

    return c.json(data, 201);
  } catch (error) {
    console.error('Create proposal error:', error);
    return c.json({ error: 'Failed to create proposal' }, 500);
  }
});

// GET /api/proposals — admin lists all proposals
app.get('/', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const { status, search } = c.req.query();

    let query = supabaseAdmin
      .from('proposals')
      .select('*, profiles!proposals_client_id_fkey(full_name, email, phone, avatar_url)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List proposals error:', error);
    return c.json({ error: 'Failed to list proposals' }, 500);
  }
});

// GET /api/proposals/mine — client lists own proposals
app.get('/mine', requireClient, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Get my proposals error:', error);
    return c.json({ error: 'Failed to get proposals' }, 500);
  }
});

// GET /api/proposals/:id — get single proposal
app.get('/:id', async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    let query = supabaseAdmin
      .from('proposals')
      .select('*, profiles!proposals_client_id_fkey(full_name, email, phone, avatar_url, company_name)');

    if (userRole === 'client') {
      query = query.eq('client_id', userId);
    }

    const { data, error } = await query.eq('id', id).single();

    if (error) return c.json({ error: 'Proposal not found' }, 404);
    return c.json(data);
  } catch (error) {
    console.error('Get proposal error:', error);
    return c.json({ error: 'Failed to get proposal' }, 500);
  }
});

// PATCH /api/proposals/:id/status — update proposal status
app.patch('/:id/status', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');
    const { status, notes } = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .update({ status, admin_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Update proposal status error:', error);
    return c.json({ error: 'Failed to update proposal' }, 500);
  }
});

export default app;