import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth.js';

function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireClient = requireRole('client');
export const requireTeam = requireRole('team_member');
export const requireAdminOrTeam = requireRole('admin', 'team_member');
export const requireAny = requireRole('admin', 'client', 'team_member');
