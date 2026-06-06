import mongoose, { Document, Schema } from 'mongoose';

export type POStatus = 'DRAFT' | 'SENT' | 'CANCELLED' | 'CLOSED' | 'ACCEPTED' | 'REJECTED';

export interface IPOItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface ITaxBreakup {
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  igstPercent: number;
  igstAmount: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  rfqId: mongoose.Types.ObjectId;
  quotationId: mongoose.Types.ObjectId;
  approvalId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  status: POStatus;
  poDate: Date;
  organization: { name: string; address: string; gstin: string };
  vendorSnapshot: { name: string; address: string; gstin: string; contact: string };
  items: IPOItem[];
  subtotal: number;
  taxBreakup: ITaxBreakup;
  grandTotal: number;
  paymentTerms: string;
  invoiceId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const POItemSchema = new Schema<IPOItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const TaxBreakupSchema = new Schema<ITaxBreakup>({
  cgstPercent: { type: Number, default: 9 },
  cgstAmount: { type: Number, default: 0 },
  sgstPercent: { type: Number, default: 9 },
  sgstAmount: { type: Number, default: 0 },
  igstPercent: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
});

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, unique: true },
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ', required: true },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
    approvalId: { type: Schema.Types.ObjectId, ref: 'Approval', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    status: { type: String, enum: ['DRAFT', 'SENT', 'CANCELLED', 'CLOSED', 'ACCEPTED', 'REJECTED'], default: 'DRAFT' },
    poDate: { type: Date, default: Date.now },
    organization: {
      name: { type: String, default: 'Acme Corp' },
      address: { type: String, default: '' },
      gstin: { type: String, default: '' },
    },
    vendorSnapshot: {
      name: { type: String, default: '' },
      address: { type: String, default: '' },
      gstin: { type: String, default: '' },
      contact: { type: String, default: '' },
    },
    items: [POItemSchema],
    subtotal: { type: Number, default: 0 },
    taxBreakup: { type: TaxBreakupSchema, default: () => ({}) },
    grandTotal: { type: Number, default: 0 },
    paymentTerms: { type: String, default: '30 days net' },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

PurchaseOrderSchema.index({ poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ vendorId: 1, status: 1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
