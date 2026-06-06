import { Vendor, IVendor } from '../models/Vendor';
import { AppError } from '../utils/AppError';

export class VendorService {
  static async createVendor(data: any, createdBy: string): Promise<IVendor> {
    const existing = await Vendor.findOne({ gstNumber: data.gstNumber });
    if (existing) {
      throw new AppError('Vendor with this GST number already exists', 409, 'GST_EXISTS');
    }

    const vendor = new Vendor({
      ...data,
      createdBy,
    });

    await vendor.save();
    return vendor;
  }

  static async getVendors(query: any): Promise<{ items: IVendor[]; total: number }> {
    const { q, status, category, page = 1, limit = 10 } = query;
    const filter: any = {};

    if (q) {
      filter.$text = { $search: q };
    }
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [items, total] = await Promise.all([
      Vendor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Vendor.countDocuments(filter),
    ]);

    return { items, total };
  }

  static async updateVendor(id: string, data: any): Promise<IVendor> {
    const vendor = await Vendor.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!vendor) throw new AppError('Vendor not found', 404, 'NOT_FOUND');
    return vendor;
  }
}
