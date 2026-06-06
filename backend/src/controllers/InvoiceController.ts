import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/InvoiceService';

export class InvoiceController {
  static async create(req: any, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.generateInvoice(req.body, req.user._id);
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.updateStatus(req.params.id, req.body.status);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await InvoiceService.getInvoices(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }
}
