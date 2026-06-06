import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/AuditService';

export class AuditController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuditService.getLogs(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
