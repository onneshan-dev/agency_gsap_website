import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin, requireAny, requireClient } from '../middleware/roles.js';
import { notifyAdmins } from '../services/notification.js';
const router = Router();
// GET /api/projects/:projectId/revisions
router.get('/:projectId/revisions', requireAny, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('revisions')
            .select('*, profiles!revisions_requested_by_fkey(full_name, avatar_url)')
            .eq('project_id', req.params.projectId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('List revisions error:', error);
        res.status(500).json({ error: 'Failed to list revisions' });
    }
});
// POST /api/projects/:projectId/revisions — client requests a revision
router.post('/:projectId/revisions', requireClient, async (req, res) => {
    try {
        const { description, milestone_id, deliverable_id, attachments } = req.body;
        // Check revision policy
        const { data: project } = await supabaseAdmin
            .from('projects')
            .select('revision_policy, name')
            .eq('id', req.params.projectId)
            .single();
        if (milestone_id && project?.revision_policy) {
            const policy = project.revision_policy;
            if (policy.max_revisions_per_milestone !== null) {
                const { count } = await supabaseAdmin
                    .from('revisions')
                    .select('id', { count: 'exact', head: true })
                    .eq('project_id', req.params.projectId)
                    .eq('milestone_id', milestone_id);
                if ((count || 0) >= policy.max_revisions_per_milestone) {
                    res.status(400).json({
                        error: `Maximum revisions (${policy.max_revisions_per_milestone}) reached for this milestone`,
                    });
                    return;
                }
            }
        }
        // Count existing revisions for numbering
        const { count: existingCount } = await supabaseAdmin
            .from('revisions')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', req.params.projectId)
            .eq('milestone_id', milestone_id || '');
        const { data, error } = await supabaseAdmin
            .from('revisions')
            .insert({
            project_id: req.params.projectId,
            milestone_id: milestone_id || null,
            deliverable_id: deliverable_id || null,
            requested_by: req.userId,
            description,
            attachments: attachments || [],
            revision_number: (existingCount || 0) + 1,
        })
            .select()
            .single();
        if (error)
            throw error;
        await notifyAdmins('revision_update', 'Revision Requested', `Client has requested a revision on "${project?.name || 'a project'}".`, { project_id: req.params.projectId, revision_id: data.id, url: `/admin/projects/${req.params.projectId}` }, ['in_app', 'email']);
        res.status(201).json(data);
    }
    catch (error) {
        console.error('Create revision error:', error);
        res.status(500).json({ error: 'Failed to create revision' });
    }
});
// PATCH /api/revisions/:id — admin updates revision
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const updateData = {};
        if (status)
            updateData.status = status;
        if (admin_notes !== undefined)
            updateData.admin_notes = admin_notes;
        if (status === 'completed')
            updateData.resolved_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin
            .from('revisions')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('Update revision error:', error);
        res.status(500).json({ error: 'Failed to update revision' });
    }
});
export default router;
//# sourceMappingURL=revisions.js.map