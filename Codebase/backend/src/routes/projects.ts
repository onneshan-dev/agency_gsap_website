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

const PHASE_ORDER = [
  'requirements', 'design', 'development', 'testing',
  'review', 'revision', 'delivery', 'completed',
] as const;

// Helper to get Supabase client
const getSupabase = (c: any) => createClient(
  c.env.SUPABASE_URL,
  c.env.SUPABASE_SERVICE_ROLE_KEY
);

// Apply auth middleware
app.use(authenticate);

// GET /api/projects — list projects (admin: all, client: own, team: assigned)
app.get('/', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    let query = supabaseAdmin
      .from('projects')
      .select('*, profiles!projects_client_id_fkey(full_name, email, avatar_url)')
      .order('updated_at', { ascending: false });

    if (userRole === 'client') {
      query = query.eq('client_id', userId);
    } else if (userRole === 'team_member') {
      const { data: teamProjects } = await supabaseAdmin
        .from('project_team_members')
        .select('project_id')
        .eq('user_id', userId);
      const ids = teamProjects?.map((t) => t.project_id) || [];
      if (ids.length === 0) return c.json([]);
      query = query.in('id', ids);
    }

    const { status, phase } = c.req.query();
    if (status) query = query.eq('status', status);
    if (phase) query = query.eq('current_phase', phase);

    const { data, error } = await query;
    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List projects error:', error);
    return c.json({ error: 'Failed to list projects' }, 500);
  }
});

// GET /api/projects/:id — get project detail
app.get('/:id', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        profiles!projects_client_id_fkey(full_name, email, phone, avatar_url),
        milestones(*),
        project_team_members(*, profiles!project_team_members_user_id_fkey(full_name, email, avatar_url, designation))
      `)
      .eq('id', id)
      .single();

    if (error) return c.json({ error: 'Project not found' }, 404);
    if (!data) return c.json({ error: 'Project not found' }, 404);

    if (userRole === 'client' && data.client_id !== userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json(data);
  } catch (error) {
    console.error('Get project error:', error);
    return c.json({ error: 'Failed to get project' }, 500);
  }
});

// PATCH /api/projects/:id — admin updates project
app.patch('/:id', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');
    const body = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Update project error:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

// PATCH /api/projects/:id/phase — admin advances project phase
app.patch('/:id/phase', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');
    const id = c.req.param('id');
    const { phase } = await c.req.json();

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('*, profiles!projects_client_id_fkey(full_name)')
      .eq('id', id)
      .single();

    if (!project) return c.json({ error: 'Project not found' }, 404);

    const currentIdx = PHASE_ORDER.indexOf(project.current_phase as typeof PHASE_ORDER[number]);

    let nextPhase: string;
    if (phase && PHASE_ORDER.includes(phase as any)) {
      nextPhase = phase;
    } else {
      if (currentIdx >= PHASE_ORDER.length - 1) {
        return c.json({ error: 'Project is already in the final phase' }, 400);
      }
      nextPhase = PHASE_ORDER[currentIdx + 1];
    }

    const status = nextPhase === 'completed' ? 'completed' : nextPhase === 'review' ? 'review' : nextPhase === 'revision' ? 'revision' : 'in_progress';
    const progress = Math.round(((PHASE_ORDER.indexOf(nextPhase as typeof PHASE_ORDER[number]) + 1) / PHASE_ORDER.length) * 100);

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ current_phase: nextPhase, status, progress, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from('project_updates').insert({
      project_id: project.id,
      title: `Phase: ${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)}`,
      content: `Project has moved to the ${nextPhase} phase.`,
      created_by: userId,
    });

    // Note: notify service needs to be updated for Hono/Workers
    // await notify({...});

    return c.json(data);
  } catch (error) {
    console.error('Advance phase error:', error);
    return c.json({ error: 'Failed to advance phase' }, 500);
  }
});

export default app;