import mongoose, { Document, Schema } from 'mongoose';
import { ITaxBreakup } from './PurchaseOrder';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  poId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  status: InvoiceStatus;
  invoiceDate: Date;
  dueDate: Date;
  items: IInvoiceItem[];
  subtotal: number;
  taxBreakup: ITaxBreakup;
  grandTotal: number;
  currency: string;
  pdfUrl?: string;
  emailedAt?: Date;
  paidAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    status: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE'], default: 'DRAFT' },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    taxBreakup: {
      cgstPercent: { type: Number, default: 9 },
      cgstAmount: { type: Number, default: 0 },
      sgstPercent: { type: Number, default: 9 },
      sgstAmount: { type: Number, default: 0 },
      igstPercent: { type: Number, default: 0 },
      igstAmount: { type: Number, default: 0 },
    },
    grandTotal: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    pdfUrl: { type: String },
    emailedAt: { type: Date },
    paidAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

InvoiceSchema.index({ poId: 1 });
InvoiceSchema.index({ status: 1, dueDate: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
