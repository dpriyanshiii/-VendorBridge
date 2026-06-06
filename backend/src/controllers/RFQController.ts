import { Request, Response, NextFunction } from 'express';
import { RFQService } from '../services/RFQService';

export class RFQController {
  static async create(req: any, res: Response, next: NextFunction) {
    try {
      const rfq = await RFQService.createRFQ(req.body, req.user._id);
      res.status(201).json({ success: true, data: rfq });
    } catch (error) {
      next(error);
    }
  }

  static async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const rfq = await RFQService.publishRFQ(req.params.id);
      res.json({ success: true, data: rfq });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: any, res: Response, next: NextFunction) {
    try {
      const data = await RFQService.getRFQs(req.query, req.user.role, req.user.vendorId?.toString());
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const rfq = await RFQService.getRFQById(req.params.id);
      res.json({ success: true, data: rfq });
    } catch (error) {
      next(error);
    }
  }
}
