import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin, requireAny } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createMilestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  phase: z.enum(['requirements', 'design', 'development', 'testing', 'review', 'revision', 'delivery']),
  sort_order: z.number().int().min(0),
  payment_amount: z.number().min(0).default(0),
  due_date: z.string().optional(),
});

// GET /api/projects/:projectId/milestones
router.get('/:projectId/milestones', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('milestones')
      .select('*')
      .eq('project_id', req.params.projectId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('List milestones error:', error);
    res.status(500).json({ error: 'Failed to list milestones' });
  }
});

// POST /api/projects/:projectId/milestones
router.post('/:projectId/milestones', requireAdmin, validate(createMilestoneSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('milestones')
      .insert({
        ...req.body,
        project_id: req.params.projectId,
        payment_status: req.body.payment_amount > 0 ? 'pending' : 'not_applicable',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create milestone error:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

// PATCH /api/milestones/:id
router.patch('/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('milestones')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// DELETE /api/milestones/:id
router.delete('/:id', requireAdmin, async (_req: AuthenticatedRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('milestones')
      .delete()
      .eq('id', _req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

export default router;
