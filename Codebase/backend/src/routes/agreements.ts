import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAny, requireClient } from '../middleware/roles.js';
import { notify, notifyAdmins } from '../services/notification.js';

const router = Router();

// GET /api/agreements/:id — view agreement
router.get('/:id', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('agreements')
      .select('*, quotes!agreements_quote_id_fkey(*, proposals!quotes_proposal_id_fkey(title, client_id))')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) { res.status(404).json({ error: 'Agreement not found' }); return; }

    if (req.userRole === 'client' && data.client_id !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Get agreement error:', error);
    res.status(500).json({ error: 'Failed to get agreement' });
  }
});

// POST /api/agreements/:id/confirm — client confirms all checklist items
router.post('/:id/confirm', requireClient, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: agreement, error: fetchError } = await supabaseAdmin
      .from('agreements')
      .select('*, quotes!agreements_quote_id_fkey(*, proposals!quotes_proposal_id_fkey(title, client_id, description, category))')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!agreement) { res.status(404).json({ error: 'Agreement not found' }); return; }
    if (agreement.client_id !== req.userId) { res.status(403).json({ error: 'Access denied' }); return; }

    const { confirmed_items } = req.body;
    const now = new Date().toISOString();

    // Update checklist items
    const updatedChecklist = (agreement.checklist_items as Array<Record<string, unknown>>).map(
      (item, idx) => ({
        ...item,
        confirmed: confirmed_items?.[idx]?.confirmed ?? item.confirmed,
        confirmed_at: confirmed_items?.[idx]?.confirmed ? now : item.confirmed_at,
      }),
    );

    const allConfirmed = updatedChecklist.every((item) => item.confirmed);

    if (!allConfirmed) {
      // Partial update — save progress
      await supabaseAdmin
        .from('agreements')
        .update({ checklist_items: updatedChecklist })
        .eq('id', req.params.id);

      res.json({ confirmed: false, checklist_items: updatedChecklist });
      return;
    }

    // All confirmed — finalize agreement, create project
    await supabaseAdmin
      .from('agreements')
      .update({ checklist_items: updatedChecklist, status: 'confirmed', confirmed_at: now })
      .eq('id', req.params.id);

    const quote = agreement.quotes;
    const proposal = quote?.proposals;

    // Create project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        name: proposal?.title || 'Untitled Project',
        description: proposal?.description || quote?.scope_summary || '',
        client_id: agreement.client_id,
        proposal_id: quote?.proposal_id,
        quote_id: quote?.id,
        agreement_id: agreement.id,
        status: 'planning',
        current_phase: 'requirements',
        budget: quote?.total_amount,
        start_date: quote?.timeline_start,
        end_date: quote?.timeline_end,
        revision_policy: { max_revisions_per_milestone: null, notes: '' },
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create milestones from payment schedule
    const schedule = (quote?.payment_schedule as Array<Record<string, unknown>>) || [];
    if (schedule.length > 0) {
      const milestones = schedule.map((item, idx) => ({
        project_id: project!.id,
        title: item.milestone_title as string,
        description: item.due_condition as string,
        phase: 'development' as const,
        sort_order: idx + 1,
        payment_amount: item.amount as number,
        payment_status: (item.amount as number) > 0 ? 'pending' as const : 'not_applicable' as const,
        status: 'pending' as const,
      }));

      await supabaseAdmin.from('milestones').insert(milestones);
    }

    // Link chat conversation to project
    await supabaseAdmin
      .from('chat_conversations')
      .update({ project_id: project!.id })
      .eq('proposal_id', quote?.proposal_id);

    // Update proposal to converted
    await supabaseAdmin
      .from('proposals')
      .update({ status: 'converted', updated_at: now })
      .eq('id', quote?.proposal_id);

    // Create project update notification
    await supabaseAdmin.from('project_updates').insert({
      project_id: project!.id,
      title: 'Project Created',
      content: `Project "${project!.name}" has been created and is now in the Requirements phase.`,
      created_by: req.userId!,
    });

    // Notify
    await notify({
      userId: agreement.client_id,
      type: 'project_update',
      title: 'Project Created!',
      message: `Your project "${project!.name}" has been created! Check your dashboard.`,
      data: { project_id: project!.id, url: `/client/projects/${project!.id}` },
      channels: ['in_app', 'email', 'whatsapp'],
    });

    await notifyAdmins(
      'agreement_confirmed',
      'Agreement Confirmed',
      `Client confirmed agreement for "${project!.name}". Project has been created.`,
      { project_id: project!.id, url: `/admin/projects/${project!.id}` },
      ['in_app', 'email'],
    );

    res.json({ confirmed: true, project });
  } catch (error) {
    console.error('Confirm agreement error:', error);
    res.status(500).json({ error: 'Failed to confirm agreement' });
  }
});

export default router;
