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

// GET /api/notifications
app.get('/', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');
    const limit = parseInt(c.req.query('limit') || '20');
    const unreadOnly = c.req.query('unread') === 'true';

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('List notifications error:', error);
    return c.json({ error: 'Failed to list notifications' }, 500);
  }
});

// GET /api/notifications/unread-count
app.get('/unread-count', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');

    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) throw error;
    return c.json({ count: count || 0 });
  } catch (error) {
    console.error('Unread count error:', error);
    return c.json({ error: 'Failed to get unread count' }, 500);
  }
});

// PATCH /api/notifications/:id/read
app.patch('/:id/read', requireAny, async (c) => {
  try {
    const supabaseAdmin = getSupabase(c);
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error('Mark read error:', error);
    return c.json({ error: 'Failed to mark as read' }, 500);
  }
});

export default app;