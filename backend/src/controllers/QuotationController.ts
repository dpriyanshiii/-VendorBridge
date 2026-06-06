import { Request, Response, NextFunction } from 'express';
import { QuotationService } from '../services/QuotationService';

export class QuotationController {
  static async submit(req: any, res: Response, next: NextFunction) {
    try {
      if (req.user.role !== 'VENDOR' || !req.user.vendorId) {
        return res.status(403).json({ success: false, error: { message: 'Only vendors can submit quotations' } });
      }
      const quotation = await QuotationService.submitQuotation(req.body, req.user.vendorId.toString());
      res.status(201).json({ success: true, data: quotation });
    } catch (error) {
      next(error);
    }
  }

  static async getByRFQ(req: Request, res: Response, next: NextFunction) {
    try {
      const quotations = await QuotationService.getQuotationsByRFQ(req.params.rfqId);
      res.json({ success: true, data: quotations });
    } catch (error) {
      next(error);
    }
  }
}
