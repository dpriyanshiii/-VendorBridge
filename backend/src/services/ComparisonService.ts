import { QuotationComparison, IQuotationComparison } from '../models/QuotationComparison';
import { Quotation } from '../models/Quotation';
import { RFQ } from '../models/RFQ';
import { Approval } from '../models/Approval';
import { AppError } from '../utils/AppError';

export class ComparisonService {
  static async createComparison(
    rfqId: string,
    selectedQuotationId: string,
    criteria: string[],
    createdBy: string
  ): Promise<IQuotationComparison> {
    const rfq = await RFQ.findById(rfqId);
    if (!rfq) throw new AppError('RFQ not found', 404, 'NOT_FOUND');

    // Check if active approval exists
    const activeApproval = await Approval.findOne({ rfqId, status: { $in: ['PENDING', 'APPROVED'] } });
    if (activeApproval) {
      throw new AppError('An active approval already exists for this RFQ', 400, 'APPROVAL_EXISTS');
    }

    const quotations = await Quotation.find({ rfqId, status: 'SUBMITTED' }).populate('vendorId', 'name rating');
    if (quotations.length === 0) {
      throw new AppError('No submitted quotations found for this RFQ', 400, 'NO_QUOTATIONS');
    }

    // Find lowest price
    let lowestPrice = Infinity;
    quotations.forEach(q => {
      if (q.grandTotal < lowestPrice) lowestPrice = q.grandTotal;
    });

    const vendors = quotations.map(q => {
      const vendor: any = q.vendorId;
      return {
        vendorId: vendor._id,
        quotationId: q._id,
        vendorName: vendor.name,
        values: {
          grandTotal: q.grandTotal,
          gstPercent: q.taxPercent,
          deliveryDays: q.deliveryOverallDays,
          vendorRating: vendor.rating || 0,
          paymentTerms: q.notes,
        },
        isLowestPrice: q.grandTotal === lowestPrice,
      };
    });

    const selectedQuotation = quotations.find(q => q._id.toString() === selectedQuotationId);
    if (!selectedQuotation) throw new AppError('Selected quotation not found', 404, 'NOT_FOUND');

    const comparison = new QuotationComparison({
      rfqId,
      createdBy,
      criteria,
      vendors,
      selectedVendorId: selectedQuotation.vendorId,
      selectedQuotationId,
    });

    await comparison.save();
    return comparison;
  }

  static async getLatestComparison(rfqId: string): Promise<IQuotationComparison | null> {
    return QuotationComparison.findOne({ rfqId }).sort({ createdAt: -1 });
  }
}
