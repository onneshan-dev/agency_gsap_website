import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAny } from '../middleware/roles.js';

const router = Router();

// POST /api/chat/conversations — create a conversation for a proposal or project
router.post('/conversations', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { proposal_id, project_id } = req.body;
    if (!proposal_id && !project_id) {
      res.status(400).json({ error: 'proposal_id or project_id is required' });
      return;
    }

    // Check if conversation already exists
    let query = supabaseAdmin.from('chat_conversations').select('*');
    if (proposal_id) query = query.eq('proposal_id', proposal_id);
    if (project_id) query = query.eq('project_id', project_id);

    const { data: existing } = await query.maybeSingle();
    if (existing) {
      res.json(existing);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('chat_conversations')
      .insert({ proposal_id: proposal_id || null, project_id: project_id || null })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /api/chat/conversations/:id/messages — paginated message history
router.get('/conversations/:id/messages', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*, profiles!chat_messages_sender_id_fkey(full_name, avatar_url, role)')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST /api/chat/conversations/:id/messages — fallback REST message send
router.post('/conversations/:id/messages', requireAny, async (req: AuthenticatedRequest, res) => {
  try {
    const { content, attachments } = req.body;
    if (!content && (!attachments || attachments.length === 0)) {
      res.status(400).json({ error: 'Content or attachments required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        conversation_id: req.params.id,
        sender_id: req.userId!,
        content: content || null,
        attachments: attachments || [],
      })
      .select('*, profiles!chat_messages_sender_id_fkey(full_name, avatar_url, role)')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
