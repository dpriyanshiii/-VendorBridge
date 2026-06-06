import { Quotation, IQuotation } from '../models/Quotation';
import { RFQ } from '../models/RFQ';
import { AppError } from '../utils/AppError';

export class QuotationService {
  static async submitQuotation(data: any, vendorId: string): Promise<IQuotation> {
    const rfq = await RFQ.findById(data.rfqId);
    if (!rfq) throw new AppError('RFQ not found', 404, 'NOT_FOUND');
    if (rfq.status !== 'PUBLISHED') throw new AppError('RFQ is not open for quotations', 400, 'INVALID_STATE');
    if (new Date(rfq.deadline) < new Date()) throw new AppError('RFQ deadline has passed', 400, 'DEADLINE_PASSED');

    const existing = await Quotation.findOne({ rfqId: rfq._id, vendorId });
    if (existing && existing.status === 'SUBMITTED') {
      throw new AppError('Quotation already submitted', 400, 'ALREADY_SUBMITTED');
    }

    // Auto-calculate totals
    let subtotal = 0;
    const items = data.items.map((item: any) => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return { ...item, total };
    });

    const taxPercent = data.taxPercent || 18;
    const taxAmount = (subtotal * taxPercent) / 100;
    const grandTotal = subtotal + taxAmount;
    
    // Calculate overall delivery days (max of all items)
    const deliveryOverallDays = Math.max(...items.map((i: any) => i.deliveryDays));

    const quotationData = {
      ...data,
      vendorId,
      items,
      subtotal,
      taxPercent,
      taxAmount,
      grandTotal,
      deliveryOverallDays,
      status: data.status || 'SUBMITTED',
      submittedAt: data.status === 'SUBMITTED' ? new Date() : undefined,
    };

    if (existing) {
      Object.assign(existing, quotationData);
      await existing.save();
      return existing;
    }

    const quotation = new Quotation(quotationData);
    await quotation.save();
    return quotation;
  }

  static async getQuotationsByRFQ(rfqId: string): Promise<IQuotation[]> {
    return Quotation.find({ rfqId }).populate('vendorId', 'name rating');
  }
}
