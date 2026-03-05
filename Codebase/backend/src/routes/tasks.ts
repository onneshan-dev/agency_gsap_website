import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrTeam, requireAny } from '../middleware/roles.js';

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

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().optional(),
  milestone_id: z.string().uuid().optional(),
});

const getSupabase = (c: any) => createClient(
  c.env.SUPABASE_URL,
  c.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(authenticate);

// GET /api/projects/:projectId/tasks
app.get('/:projectId/tasks', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const projectId = c.req.param('projectId');

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*, profiles!tasks_assigned_to_fkey(full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List tasks error:', error);
    return c.json({ error: 'Failed to list tasks' }, 500);
  }
});

// POST /api/projects/:projectId/tasks
app.post('/:projectId/tasks', requireAdmin, zValidator('json', createTaskSchema), async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const projectId = c.req.param('projectId');
    const body = c.req.valid('json');

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({ ...body, project_id: projectId })
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    console.error('Create task error:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// PATCH /api/projects/:projectId/tasks/:taskId
app.patch('/:projectId/tasks/:taskId', requireAdminOrTeam, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const taskId = c.req.param('taskId');
    const body = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Update task error:', error);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

export default app;