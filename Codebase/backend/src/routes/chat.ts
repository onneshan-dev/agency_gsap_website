import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth.js';
import { requireAny } from '../middleware/roles.js';

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

const getSupabase = (c: any) => createClient(
  c.env.SUPABASE_URL,
  c.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(authenticate);

// POST /api/chat/conversations — create a conversation
app.post('/conversations', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const { proposal_id, project_id } = await c.req.json();
    
    if (!proposal_id && !project_id) {
      return c.json({ error: 'proposal_id or project_id is required' }, 400);
    }

    let query = supabaseAdmin.from('chat_conversations').select('*');
    if (proposal_id) query = query.eq('proposal_id', proposal_id);
    if (project_id) query = query.eq('project_id', project_id);

    const { data: existing } = await query.maybeSingle();
    if (existing) return c.json(existing);

    const { data, error } = await supabaseAdmin
      .from('chat_conversations')
      .insert({ proposal_id: proposal_id || null, project_id: project_id || null })
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    console.error('Create conversation error:', error);
    return c.json({ error: 'Failed to create conversation' }, 500);
  }
});

// GET /api/chat/conversations/:id/messages — paginated message history
app.get('/conversations/:id/messages', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const id = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*, profiles!chat_messages_sender_id_fkey(full_name, avatar_url, role)')
      .eq('conversation_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Get messages error:', error);
    return c.json({ error: 'Failed to get messages' }, 500);
  }
});

// POST /api/chat/conversations/:id/messages — send a message
app.post('/conversations/:id/messages', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');
    const id = c.req.param('id');
    const { content } = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({ conversation_id: id, sender_id: userId, content })
      .select('*, profiles!chat_messages_sender_id_fkey(full_name, avatar_url, role)')
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (error) {
    console.error('Send message error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

export default app;