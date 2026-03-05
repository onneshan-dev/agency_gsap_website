import type { MiddlewareHandler } from 'hono';

type Variables = {
  userRole: string;
};

function requireRole(...roles: string[]): MiddlewareHandler<{ Variables: Variables }> {
  return async (c, next) => {
    const userRole = c.get('userRole');
    if (!userRole || !roles.includes(userRole)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    await next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireClient = requireRole('client');
export const requireTeam = requireRole('team_member');
export const requireAdminOrTeam = requireRole('admin', 'team_member');
export const requireAny = requireRole('admin', 'client', 'team_member');