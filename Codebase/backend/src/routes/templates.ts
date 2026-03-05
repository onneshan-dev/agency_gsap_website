import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin, requireAny, requireClient } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Schema for creating/updating templates
const templateSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  category: z.enum(['web_app', 'mobile_app', 'ecommerce', 'saas', 'other']).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  default_title: z.string().optional(),
  default_description: z.string().optional(),
  suggested_timeline: z.enum(['1_month', '1_3_months', '3_6_months', '6_plus', 'flexible']).optional(),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    type: z.enum(['text', 'textarea', 'number', 'boolean', 'select', 'checkbox', 'date', 'file']),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
    placeholder: z.string().optional(),
  })).optional(),
  document_checklist: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

// ============================================
// GET /api/templates - List all active templates
// ============================================
router.get('/', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { category } = req.query;
    
    let query = supabaseAdmin
      .from('proposal_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// ============================================
// GET /api/templates/all - List all templates (admin)
// ============================================
router.get('/all', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposal_templates')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching all templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// ============================================
// GET /api/templates/:id - Get template details
// ============================================
router.get('/:id', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('proposal_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Only return active templates to non-admins
    if (!data.is_active && req.userRole !== 'admin') {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// ============================================
// POST /api/templates - Create new template (admin)
// ============================================
router.post('/', requireAdmin, validate(templateSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('proposal_templates')
      .insert({
        ...req.body,
        created_by: req.userId,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// ============================================
// PATCH /api/templates/:id - Update template (admin)
// ============================================
router.patch('/:id', requireAdmin, validate(templateSchema.partial()), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('proposal_templates')
      .update({
        ...req.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// ============================================
// DELETE /api/templates/:id - Delete template (admin)
// ============================================
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('proposal_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// ============================================
// POST /api/templates/:id/use - Track template usage
// ============================================
router.post('/:id/use', requireClient, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Increment usage count
    await supabaseAdmin.rpc('increment_template_usage', { template_id: id });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking template usage:', error);
    // Don't fail the request, just log
    res.json({ success: true });
  }
});

// ============================================
// GET /api/templates/:id/stats - Get template statistics (admin)
// ============================================
router.get('/:id/stats', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data: template, error } = await supabaseAdmin
      .from('proposal_templates')
      .select('usage_count, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Get proposals created from this template (if we add template_id to proposals)
    // For now, just return usage count
    res.json({
      usage_count: template.usage_count,
      created_at: template.created_at,
      updated_at: template.updated_at,
    });
  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({ error: 'Failed to fetch template statistics' });
  }
});

export default router;