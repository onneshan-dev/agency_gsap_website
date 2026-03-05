import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
export declare function validate(schema: ZodType): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map