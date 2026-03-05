import type { MiddlewareHandler } from 'hono';
import { createClient } from '@supabase/supabase-js';

// Environment bindings type
type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

type Variables = {
  userId: string;
  userRole: string;
  userEmail: string;
};

export const authenticate: MiddlewareHandler<{ Bindings: Bindings; Variables: Variables }> = async (c, next) => {
  const header = c.req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401);
  }

  const token = header.slice(7);

  try {
    // Create Supabase client with environment variables
    const supabaseAdmin = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', data.user.id)
      .single();

    // Set context variables
    c.set('userId', data.user.id);
    c.set('userRole', profile?.role ?? 'client');
    c.set('userEmail', profile?.email ?? data.user.email ?? '');

    await next();
  } catch {
    return c.json({ error: 'Authentication failed' }, 401);
  }
};