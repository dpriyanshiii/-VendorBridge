import { Request, Response, NextFunction } from 'express';
import { ApprovalService } from '../services/ApprovalService';

export class ApprovalController {
  static async create(req: any, res: Response, next: NextFunction) {
    try {
      const approval = await ApprovalService.createApproval(req.body, req.user._id);
      res.status(201).json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  }

  static async act(req: any, res: Response, next: NextFunction) {
    try {
      const { action, remarks } = req.body;
      const approval = await ApprovalService.actOnApproval(req.params.id, req.user._id, action, remarks);
      res.json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ApprovalService.getApprovals(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const approval = await ApprovalService.getApprovalById(req.params.id);
      res.json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  }
}
