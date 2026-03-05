import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
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

const createMilestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  phase: z.enum(['requirements', 'design', 'development', 'testing', 'review', 'revision', 'delivery']),
  sort_order: z.number().int().min(0),
  payment_amount: z.number().min(0).default(0),
  due_date: z.string().optional(),
});

const getSupabase = (c: any) => createClient(
  c.env.SUPABASE_URL,
  c.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(authenticate);

// GET /api/projects/:projectId/milestones
app.get('/:projectId/milestones', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const projectId = c.req.param('projectId');

    const { data, error } = await supabaseAdmin
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List milestones error:', error);
    return c.json({ error: 'Failed to list milestones' }, 500);
  }
});

// POST /api/projects/:projectId/milestones
app.post('/:projectId/milestones', requireAdmin, zValidator('json', createMilestoneSchema), async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const projectId = c.req.param('projectId');
    const body = c.req.valid('json');

    const { data, error } = await supabaseAdmin
      .from('milestones')
      .insert({
        ...body,
        project_id: projectId,
        payment_status: body.payment_amount > 0 ? 'pending' : 'not_applicable',
      })
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    console.error('Create milestone error:', error);
    return c.json({ error: 'Failed to create milestone' }, 500);
  }
});

// PATCH /api/projects/:projectId/milestones/:milestoneId
app.patch('/:projectId/milestones/:milestoneId', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const milestoneId = c.req.param('milestoneId');
    const body = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('milestones')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Update milestone error:', error);
    return c.json({ error: 'Failed to update milestone' }, 500);
  }
});

export default app;