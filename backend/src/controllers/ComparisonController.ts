import { Request, Response, NextFunction } from 'express';
import { ComparisonService } from '../services/ComparisonService';

export class ComparisonController {
  static async create(req: any, res: Response, next: NextFunction) {
    try {
      const { rfqId } = req.params;
      const { selectedQuotationId, criteria } = req.body;
      const comparison = await ComparisonService.createComparison(
        rfqId,
        selectedQuotationId,
        criteria,
        req.user._id
      );
      res.status(201).json({ success: true, data: comparison });
    } catch (error) {
      next(error);
    }
  }

  static async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const comparison = await ComparisonService.getLatestComparison(req.params.rfqId);
      if (!comparison) return res.status(404).json({ success: false, error: { message: 'Comparison not found' } });
      res.json({ success: true, data: comparison });
    } catch (error) {
      next(error);
    }
  }
}
