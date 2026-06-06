import { Request, Response, NextFunction } from 'express';
import { ReportsService } from '../services/ReportsService';

export class ReportsController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query;
      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;
      
      const data = await ReportsService.getOverviewMetrics(fromDate, toDate);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
