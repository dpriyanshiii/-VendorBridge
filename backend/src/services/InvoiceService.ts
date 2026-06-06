import { Invoice, IInvoice } from '../models/Invoice';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { AppError } from '../utils/AppError';

export class InvoiceService {
  static async generateInvoice(data: any, createdBy: string): Promise<IInvoice> {
    const po = await PurchaseOrder.findById(data.poId);
    if (!po) throw new AppError('PO not found', 404, 'NOT_FOUND');
    if (po.status === 'CANCELLED') throw new AppError('Cannot invoice a cancelled PO', 400, 'INVALID_STATE');

    const invoiceCount = await Invoice.countDocuments();
    const currentYear = new Date().getFullYear();
    const invoiceNumber = `INV-${currentYear}-${(invoiceCount + 1).toString().padStart(4, '0')}`;

    const invoice = new Invoice({
      invoiceNumber,
      poId: po._id,
      vendorId: po.vendorId,
      status: 'DRAFT',
      invoiceDate: data.invoiceDate || new Date(),
      dueDate: data.dueDate,
      items: po.items,
      subtotal: po.subtotal,
      taxBreakup: po.taxBreakup,
      grandTotal: po.grandTotal,
      createdBy,
    });

    await invoice.save();

    // Link invoice to PO
    po.invoiceId = invoice._id as any;
    await po.save();

    return invoice;
  }

  static async updateStatus(id: string, status: 'SENT' | 'PAID' | 'OVERDUE'): Promise<IInvoice> {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw new AppError('Invoice not found', 404, 'NOT_FOUND');

    invoice.status = status;
    if (status === 'SENT') invoice.emailedAt = new Date();
    if (status === 'PAID') invoice.paidAt = new Date();

    await invoice.save();
    return invoice;
  }

  static async getInvoices(query: any): Promise<{ items: IInvoice[]; total: number }> {
    const { status, vendorId, page = 1, limit = 10 } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (vendorId) filter.vendorId = vendorId;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Invoice.countDocuments(filter),
    ]);

    return { items, total };
  }

  static async getInvoiceById(id: string): Promise<IInvoice> {
    const invoice = await Invoice.findById(id).populate('poId');
    if (!invoice) throw new AppError('Invoice not found', 404, 'NOT_FOUND');
    return invoice;
  }
}
