import { PurchaseOrder, IPurchaseOrder } from '../models/PurchaseOrder';
import { Quotation } from '../models/Quotation';
import { Approval } from '../models/Approval';
import { Vendor } from '../models/Vendor';
import { AppError } from '../utils/AppError';

export class POService {
  static async generatePO(data: any, createdBy: string): Promise<IPurchaseOrder> {
    const approval = await Approval.findById(data.approvalId);
    if (!approval || approval.status !== 'APPROVED') {
      throw new AppError('A fully approved workflow is required to generate a PO', 400, 'NOT_APPROVED');
    }

    const quotation = await Quotation.findById(approval.quotationId);
    if (!quotation) throw new AppError('Quotation not found', 404, 'NOT_FOUND');

    const vendor = await Vendor.findById(quotation.vendorId);
    if (!vendor) throw new AppError('Vendor not found', 404, 'NOT_FOUND');

    const poCount = await PurchaseOrder.countDocuments();
    const currentYear = new Date().getFullYear();
    const poNumber = `PO-${currentYear}-${(poCount + 1).toString().padStart(4, '0')}`;

    const po = new PurchaseOrder({
      poNumber,
      rfqId: quotation.rfqId,
      quotationId: quotation._id,
      approvalId: approval._id,
      vendorId: vendor._id,
      status: 'DRAFT',
      poDate: data.poDate || new Date(),
      organization: {
        name: 'Acme Corp',
        address: '123 Business Rd, Tech City',
        gstin: '27AAAAA0000A1Z5',
      },
      vendorSnapshot: {
        name: vendor.name,
        address: `${vendor.address.line1}, ${vendor.address.city}, ${vendor.address.state} - ${vendor.address.pin}`,
        gstin: vendor.gstNumber,
        contact: `${vendor.primaryContact.name} (${vendor.primaryContact.email})`,
      },
      items: quotation.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      subtotal: quotation.subtotal,
      taxBreakup: {
        cgstPercent: quotation.taxPercent / 2,
        cgstAmount: quotation.taxAmount / 2,
        sgstPercent: quotation.taxPercent / 2,
        sgstAmount: quotation.taxAmount / 2,
        igstPercent: 0,
        igstAmount: 0,
      },
      grandTotal: quotation.grandTotal,
      paymentTerms: data.paymentTerms || vendor.paymentTermsDefault || quotation.notes || '30 days net',
      createdBy,
    });

    await po.save();
    return po;
  }

  static async getPOs(query: any): Promise<{ items: IPurchaseOrder[]; total: number }> {
    const { status, vendorId, page = 1, limit = 10 } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (vendorId) filter.vendorId = vendorId;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      PurchaseOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      PurchaseOrder.countDocuments(filter),
    ]);

    return { items, total };
  }

  static async getPOById(id: string): Promise<IPurchaseOrder> {
    const po = await PurchaseOrder.findById(id);
    if (!po) throw new AppError('PO not found', 404, 'NOT_FOUND');
    return po;
  }

  static async updateStatus(id: string, status: string): Promise<IPurchaseOrder> {
    const po = await PurchaseOrder.findById(id);
    if (!po) throw new AppError('PO not found', 404, 'NOT_FOUND');
    po.status = status as any;
    await po.save();
    return po;
  }
}
