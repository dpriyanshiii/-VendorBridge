import { Request, Response, NextFunction } from 'express';
import { VendorService } from '../services/VendorService';
import { Vendor } from '../models/Vendor';

export class VendorController {
  static async create(req: any, res: Response, next: NextFunction) {
    try {
      const vendor = await VendorService.createVendor(req.body, req.user._id);
      res.status(201).json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VendorService.getVendors(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) return res.status(404).json({ success: false, error: { message: 'Vendor not found' } });
      res.json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await VendorService.updateVendor(req.params.id, req.body);
      res.json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  }
}
