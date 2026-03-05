import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAdminOrTeam, requireAny } from '../middleware/roles.js';

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

// GET /api/projects/:projectId/deliverables
app.get('/:projectId/deliverables', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const projectId = c.req.param('projectId');

    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .select('*, profiles!deliverables_uploaded_by_fkey(full_name, avatar_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List deliverables error:', error);
    return c.json({ error: 'Failed to list deliverables' }, 500);
  }
});

// POST /api/projects/:projectId/deliverables
app.post('/:projectId/deliverables', requireAdminOrTeam, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');
    const projectId = c.req.param('projectId');
    const { title, description, type, file_url, file_key, file_name, external_url, milestone_id } = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .insert({
        project_id: projectId,
        milestone_id: milestone_id || null,
        title,
        description: description || null,
        type,
        file_url: type === 'file' ? file_url : null,
        file_key: type === 'file' ? file_key : null,
        file_name: type === 'file' ? file_name : null,
        external_url: type === 'link' ? external_url : null,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    console.error('Create deliverable error:', error);
    return c.json({ error: 'Failed to create deliverable' }, 500);
  }
});

export default app;