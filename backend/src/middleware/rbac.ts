import { Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { AppError } from '../utils/AppError';
import { AuthRequest } from './auth';

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }
    next();
  };
};
