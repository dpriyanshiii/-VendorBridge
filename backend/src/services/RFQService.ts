import { RFQ, IRFQ } from '../models/RFQ';
import { AppError } from '../utils/AppError';

export class RFQService {
  static async createRFQ(data: any, createdBy: string): Promise<IRFQ> {
    if (new Date(data.deadline) <= new Date()) {
      throw new AppError('Deadline must be in the future', 400, 'INVALID_DEADLINE');
    }

    const rfq = new RFQ({
      ...data,
      createdBy,
    });

    await rfq.save();
    return rfq;
  }

  static async publishRFQ(id: string): Promise<IRFQ> {
    const rfq = await RFQ.findById(id);
    if (!rfq) throw new AppError('RFQ not found', 404, 'NOT_FOUND');
    if (rfq.status !== 'DRAFT') throw new AppError('Only DRAFT RFQs can be published', 400, 'INVALID_STATE');

    rfq.status = 'PUBLISHED';
    await rfq.save();
    // In a real app, we'd trigger NotificationService here
    return rfq;
  }

  static async getRFQs(query: any, userRole: string, vendorId?: string): Promise<{ items: IRFQ[]; total: number }> {
    const filter: any = {};
    if (query.status) filter.status = query.status;

    if (userRole === 'VENDOR' && vendorId) {
      filter.assignedVendors = vendorId;
      filter.status = { $ne: 'DRAFT' }; // Vendors can't see drafts
    }

    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      RFQ.find(filter).populate('assignedVendors', 'name status').sort({ createdAt: -1 }).skip(skip).limit(limit),
      RFQ.countDocuments(filter),
    ]);

    return { items, total };
  }

  static async getRFQById(id: string): Promise<IRFQ> {
    const rfq = await RFQ.findById(id).populate('assignedVendors', 'name email status');
    if (!rfq) throw new AppError('RFQ not found', 404, 'NOT_FOUND');
    return rfq;
  }
}
