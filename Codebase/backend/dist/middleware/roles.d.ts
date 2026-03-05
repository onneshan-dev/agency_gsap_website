import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth.js';
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireTeam: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdminOrTeam: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAny: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=roles.d.ts.map