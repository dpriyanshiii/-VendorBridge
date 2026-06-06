import { PurchaseOrder } from '../models/PurchaseOrder';
import { Vendor } from '../models/Vendor';
import { Invoice } from '../models/Invoice';

export class ReportsService {
  static async getOverviewMetrics(from?: Date, to?: Date) {
    const dateFilter: any = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = from;
      if (to) dateFilter.createdAt.$lte = to;
    }

    const [totalSpendObj, activeVendors, totalPOs, overdueInvoicesCount] = await Promise.all([
      PurchaseOrder.aggregate([
        { $match: { ...dateFilter, status: { $in: ['SENT', 'CLOSED'] } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Vendor.countDocuments({ status: 'ACTIVE' }),
      PurchaseOrder.countDocuments({ ...dateFilter }),
      Invoice.countDocuments({ ...dateFilter, status: 'OVERDUE' })
    ]);

    const totalSpend = totalSpendObj[0]?.total || 0;
    
    // Spend by category
    const spendByCategory = await PurchaseOrder.aggregate([
      { $match: { ...dateFilter, status: { $in: ['SENT', 'CLOSED'] } } },
      {
        $lookup: {
          from: 'rfqs',
          localField: 'rfqId',
          foreignField: '_id',
          as: 'rfq'
        }
      },
      { $unwind: '$rfq' },
      { $group: { _id: '$rfq.category', amount: { $sum: '$grandTotal' } } },
      { $project: { category: '$_id', amount: 1, _id: 0 } },
      { $sort: { amount: -1 } }
    ]);

    // Top vendors
    const topVendorsBySpend = await PurchaseOrder.aggregate([
      { $match: { ...dateFilter, status: { $in: ['SENT', 'CLOSED'] } } },
      { $group: { _id: '$vendorId', amount: { $sum: '$grandTotal' }, poCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: '$vendor' },
      { $project: { vendorId: '$_id', vendorName: '$vendor.name', amount: 1, poCount: 1, _id: 0 } },
      { $sort: { amount: -1 } },
      { $limit: 5 }
    ]);

    return {
      totalSpend,
      activeVendors,
      poCount: totalPOs,
      overdueInvoicesCount,
      spendByCategory,
      topVendorsBySpend
    };
  }
}
