import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin, requireAny } from '../middleware/roles.js';
import { notify } from '../services/notification.js';
const router = Router();
const PHASE_ORDER = [
    'requirements', 'design', 'development', 'testing',
    'review', 'revision', 'delivery', 'completed',
];
// GET /api/projects — list projects (admin: all, client: own, team: assigned)
router.get('/', requireAny, async (req, res) => {
    try {
        let query = supabaseAdmin
            .from('projects')
            .select('*, profiles!projects_client_id_fkey(full_name, email, avatar_url)')
            .order('updated_at', { ascending: false });
        if (req.userRole === 'client') {
            query = query.eq('client_id', req.userId);
        }
        else if (req.userRole === 'team_member') {
            const { data: teamProjects } = await supabaseAdmin
                .from('project_team_members')
                .select('project_id')
                .eq('user_id', req.userId);
            const ids = teamProjects?.map((t) => t.project_id) || [];
            if (ids.length === 0) {
                res.json([]);
                return;
            }
            query = query.in('id', ids);
        }
        const { status, phase } = req.query;
        if (status && typeof status === 'string')
            query = query.eq('status', status);
        if (phase && typeof phase === 'string')
            query = query.eq('current_phase', phase);
        const { data, error } = await query;
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('List projects error:', error);
        res.status(500).json({ error: 'Failed to list projects' });
    }
});
// GET /api/projects/:id — get project detail
router.get('/:id', requireAny, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select(`
        *,
        profiles!projects_client_id_fkey(full_name, email, phone, avatar_url),
        milestones(*),
        project_team_members(*, profiles!project_team_members_user_id_fkey(full_name, email, avatar_url, designation))
      `)
            .eq('id', req.params.id)
            .single();
        if (error)
            throw error;
        if (!data) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        if (req.userRole === 'client' && data.client_id !== req.userId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        res.json(data);
    }
    catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Failed to get project' });
    }
});
// PATCH /api/projects/:id — admin updates project
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .update({ ...req.body, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});
// PATCH /api/projects/:id/phase — admin advances project phase
router.patch('/:id/phase', requireAdmin, async (req, res) => {
    try {
        const { data: project } = await supabaseAdmin
            .from('projects')
            .select('*, profiles!projects_client_id_fkey(full_name)')
            .eq('id', req.params.id)
            .single();
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const currentIdx = PHASE_ORDER.indexOf(project.current_phase);
        const { phase } = req.body;
        let nextPhase;
        if (phase && PHASE_ORDER.includes(phase)) {
            nextPhase = phase;
        }
        else {
            if (currentIdx >= PHASE_ORDER.length - 1) {
                res.status(400).json({ error: 'Project is already in the final phase' });
                return;
            }
            nextPhase = PHASE_ORDER[currentIdx + 1];
        }
        const status = nextPhase === 'completed' ? 'completed' : nextPhase === 'review' ? 'review' : nextPhase === 'revision' ? 'revision' : 'in_progress';
        const progress = Math.round(((PHASE_ORDER.indexOf(nextPhase) + 1) / PHASE_ORDER.length) * 100);
        const { data, error } = await supabaseAdmin
            .from('projects')
            .update({ current_phase: nextPhase, status, progress, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        await supabaseAdmin.from('project_updates').insert({
            project_id: project.id,
            title: `Phase: ${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)}`,
            content: `Project has moved to the ${nextPhase} phase.`,
            created_by: req.userId,
        });
        await notify({
            userId: project.client_id,
            type: 'phase_advanced',
            title: 'Project Phase Update',
            message: `Your project "${project.name}" has moved to the ${nextPhase} phase.`,
            data: { project_id: project.id, url: `/client/projects/${project.id}` },
            channels: ['in_app', 'email'],
        });
        res.json(data);
    }
    catch (error) {
        console.error('Advance phase error:', error);
        res.status(500).json({ error: 'Failed to advance phase' });
    }
});
export default router;
//# sourceMappingURL=projects.js.map