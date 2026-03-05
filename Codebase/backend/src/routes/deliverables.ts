import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdminOrTeam, requireAny } from '../middleware/roles.js';
import { notify } from '../services/notification.js';

const router = Router();

// GET /api/projects/:projectId/deliverables
router.get('/:projectId/deliverables', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .select('*, profiles!deliverables_uploaded_by_fkey(full_name, avatar_url)')
      .eq('project_id', req.params.projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('List deliverables error:', error);
    res.status(500).json({ error: 'Failed to list deliverables' });
  }
});

// POST /api/projects/:projectId/deliverables — admin/team uploads
router.post('/:projectId/deliverables', requireAdminOrTeam, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, type, file_url, file_key, file_name, external_url, milestone_id } = req.body;

    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .insert({
        project_id: req.params.projectId,
        milestone_id: milestone_id || null,
        title,
        description: description || null,
        type,
        file_url: type === 'file' ? file_url : null,
        file_key: type === 'file' ? file_key : null,
        file_name: type === 'file' ? file_name : null,
        external_url: type === 'link' ? external_url : null,
        uploaded_by: req.userId!,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify client
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('client_id, name')
      .eq('id', req.params.projectId)
      .single();

    if (project) {
      await notify({
        userId: project.client_id,
        type: 'deliverable_ready',
        title: 'New Deliverable Available',
        message: `A new deliverable "${title}" has been added to "${project.name}".`,
        data: { project_id: req.params.projectId, deliverable_id: data.id, url: `/client/projects/${req.params.projectId}` },
        channels: ['in_app', 'email'],
      });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create deliverable error:', error);
    res.status(500).json({ error: 'Failed to create deliverable' });
  }
});

// PATCH /api/deliverables/:id/status — approve or request revision
router.patch('/:id/status', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'revision_requested'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('deliverables')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update deliverable status error:', error);
    res.status(500).json({ error: 'Failed to update deliverable status' });
  }
});

export default router;
