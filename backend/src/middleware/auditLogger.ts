import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/AuditService';
import { AuthRequest } from './auth';

export const auditLogger = (entityType: string, actionDesc: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Intercept res.json to log after successful request
    const originalJson = res.json;
    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Find entityId from params or body response
        let entityId = req.params.id || body?.data?._id || body?.data?.id;
        
        // Log asynchronously
        AuditService.log(
          actionDesc,
          entityType,
          entityId,
          req.user?._id?.toString() || '',
          { method: req.method, path: req.originalUrl }
        );
      }
      return originalJson.call(this, body);
    };
    next();
  };
};
