import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

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

const createTeamMemberSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
  designation: z.string().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
});

const getSupabase = (c: any) => createClient(
  c.env.SUPABASE_URL,
  c.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(authenticate);

// GET /api/team/members
app.get('/members', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'team_member')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List team members error:', error);
    return c.json({ error: 'Failed to list team members' }, 500);
  }
});

// POST /api/team/members
app.post('/members', requireAdmin, zValidator('json', createTeamMemberSchema), async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const body = c.req.valid('json');

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: body.full_name, role: 'team_member' },
    });

    if (authError) throw authError;

    await supabaseAdmin
      .from('profiles')
      .update({
        designation: body.designation || null,
        skills: body.skills || [],
        bio: body.bio || null,
        phone: body.phone || null,
      })
      .eq('id', authData.user.id);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return c.json(profile, 201);
  } catch (error) {
    console.error('Create team member error:', error);
    return c.json({ error: 'Failed to create team member' }, 500);
  }
});

// GET /api/projects/:projectId/team
app.get('/:projectId/team', requireAdmin, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const projectId = c.req.param('projectId');

    const { data, error } = await supabaseAdmin
      .from('project_team_members')
      .select('*, profiles!project_team_members_user_id_fkey(*)')
      .eq('project_id', projectId);

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List project team error:', error);
    return c.json({ error: 'Failed to list project team' }, 500);
  }
});

export default app;