import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { notify } from '../services/notification.js';

const router = Router();

const createTeamMemberSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
  designation: z.string().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
});

// POST /api/team/members — admin creates a team member account
router.post('/members', requireAdmin, validate(createTeamMemberSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { email, password, full_name, designation, skills, bio, phone } = req.body;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'team_member' },
    });

    if (authError) throw authError;

    // Update profile with additional fields
    await supabaseAdmin
      .from('profiles')
      .update({
        designation: designation || null,
        skills: skills || [],
        bio: bio || null,
        phone: phone || null,
      })
      .eq('id', authData.user.id);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    res.status(201).json(profile);
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// GET /api/team/members — admin lists all team members
router.get('/members', requireAdmin, async (_req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'team_member')
      .order('full_name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('List team members error:', error);
    res.status(500).json({ error: 'Failed to list team members' });
  }
});

// POST /api/projects/:projectId/team — assign team member to project
router.post('/projects/:projectId/team', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { user_id, role_in_project } = req.body;

    const { data, error } = await supabaseAdmin
      .from('project_team_members')
      .insert({
        project_id: req.params.projectId,
        user_id,
        role_in_project: role_in_project || 'developer',
      })
      .select('*, profiles!project_team_members_user_id_fkey(full_name, email, avatar_url)')
      .single();

    if (error) throw error;

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('name')
      .eq('id', req.params.projectId)
      .single();

    await notify({
      userId: user_id,
      type: 'team_assigned',
      title: 'Assigned to Project',
      message: `You have been assigned to "${project?.name || 'a project'}" as ${role_in_project || 'developer'}.`,
      data: { project_id: req.params.projectId, url: `/team/projects/${req.params.projectId}` },
      channels: ['in_app', 'email'],
    });

    res.status(201).json(data);
  } catch (error) {
    console.error('Assign team member error:', error);
    res.status(500).json({ error: 'Failed to assign team member' });
  }
});

// DELETE /api/projects/:projectId/team/:userId
router.delete('/projects/:projectId/team/:userId', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('project_team_members')
      .delete()
      .eq('project_id', req.params.projectId)
      .eq('user_id', req.params.userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

export default router;
