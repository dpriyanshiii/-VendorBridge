import mongoose, { Document, Schema } from 'mongoose';

export type QuotationStatus = 'DRAFT' | 'SUBMITTED' | 'WITHDRAWN';

export interface IQuotationItem {
  rfqItemId: mongoose.Types.ObjectId;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  deliveryDays: number;
}

export interface IQuotation extends Document {
  rfqId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  status: QuotationStatus;
  currency: string;
  items: IQuotationItem[];
  taxPercent: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  deliveryOverallDays: number;
  notes: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationItemSchema = new Schema<IQuotationItem>({
  rfqItemId: { type: Schema.Types.ObjectId, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true },
  deliveryDays: { type: Number, required: true, min: 0 },
});

const QuotationSchema = new Schema<IQuotation>(
  {
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'WITHDRAWN'], default: 'DRAFT' },
    currency: { type: String, default: 'INR' },
    items: [QuotationItemSchema],
    taxPercent: { type: Number, default: 18, min: 0, max: 28 },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    deliveryOverallDays: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

QuotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });
QuotationSchema.index({ status: 1 });

export const Quotation = mongoose.model<IQuotation>('Quotation', QuotationSchema);
