import mongoose, { Document, Schema } from 'mongoose';

export interface IQuotationComparison extends Document {
  rfqId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  criteria: string[];
  vendors: Array<{
    vendorId: mongoose.Types.ObjectId;
    quotationId: mongoose.Types.ObjectId;
    vendorName: string;
    values: {
      grandTotal: number;
      gstPercent: number;
      deliveryDays: number;
      vendorRating: number;
      paymentTerms: string;
    };
    isLowestPrice: boolean;
  }>;
  selectedVendorId: mongoose.Types.ObjectId;
  selectedQuotationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ComparisonSchema = new Schema<IQuotationComparison>(
  {
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    criteria: [{ type: String }],
    vendors: [
      {
        vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
        quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
        vendorName: { type: String },
        values: {
          grandTotal: { type: Number },
          gstPercent: { type: Number },
          deliveryDays: { type: Number },
          vendorRating: { type: Number },
          paymentTerms: { type: String },
        },
        isLowestPrice: { type: Boolean, default: false },
      },
    ],
    selectedVendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    selectedQuotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
  },
  { timestamps: true }
);

ComparisonSchema.index({ rfqId: 1 });

export const QuotationComparison = mongoose.model<IQuotationComparison>(
  'QuotationComparison',
  ComparisonSchema
);
