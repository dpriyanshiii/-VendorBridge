import { Request, Response, NextFunction } from 'express';
import { POService } from '../services/POService';

export class POController {
  static async create(req: any, res: Response, next: NextFunction) {
    try {
      const po = await POService.generatePO(req.body, req.user._id);
      res.status(201).json({ success: true, data: po });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const po = await POService.updateStatus(req.params.id, status);
      res.json({ success: true, data: po });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await POService.getPOs(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await POService.getPOById(req.params.id);
      res.json({ success: true, data: po });
    } catch (error) {
      next(error);
    }
  }
}
