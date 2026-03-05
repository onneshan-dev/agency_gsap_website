import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin, requireAdminOrTeam, requireAny } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { notify } from '../services/notification.js';
const router = Router();
const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    assigned_to: z.string().uuid().optional(),
    due_date: z.string().optional(),
    milestone_id: z.string().uuid().optional(),
});
// GET /api/projects/:projectId/tasks
router.get('/:projectId/tasks', requireAny, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .select('*, profiles!tasks_assigned_to_fkey(full_name, avatar_url)')
            .eq('project_id', req.params.projectId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('List tasks error:', error);
        res.status(500).json({ error: 'Failed to list tasks' });
    }
});
// POST /api/projects/:projectId/tasks
router.post('/:projectId/tasks', requireAdmin, validate(createTaskSchema), async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .insert({ ...req.body, project_id: req.params.projectId })
            .select()
            .single();
        if (error)
            throw error;
        if (req.body.assigned_to) {
            await notify({
                userId: req.body.assigned_to,
                type: 'task_assigned',
                title: 'New Task Assigned',
                message: `You have been assigned a new task: "${req.body.title}".`,
                data: { project_id: req.params.projectId, task_id: data.id },
                channels: ['in_app'],
            });
        }
        res.status(201).json(data);
    }
    catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});
// PATCH /api/tasks/:id — admin or team member updates task
router.patch('/:id', requireAdminOrTeam, async (req, res) => {
    try {
        if (req.userRole === 'team_member') {
            const { data: task } = await supabaseAdmin
                .from('tasks')
                .select('assigned_to')
                .eq('id', req.params.id)
                .single();
            if (task?.assigned_to !== req.userId) {
                res.status(403).json({ error: 'Can only update tasks assigned to you' });
                return;
            }
            // Team members can only update status
            const { status } = req.body;
            if (!status) {
                res.status(400).json({ error: 'Only status updates allowed' });
                return;
            }
            const { data, error } = await supabaseAdmin
                .from('tasks')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', req.params.id)
                .select()
                .single();
            if (error)
                throw error;
            res.json(data);
            return;
        }
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .update({ ...req.body, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});
// DELETE /api/tasks/:id
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabaseAdmin.from('tasks').delete().eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});
export default router;
//# sourceMappingURL=tasks.js.map