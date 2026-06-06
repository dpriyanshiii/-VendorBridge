import mongoose, { Document, Schema } from 'mongoose';

export type RFQStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';

export interface IRFQLineItem {
  _id?: mongoose.Types.ObjectId;
  description: string;
  quantity: number;
  unit: string;
  specification?: string;
}

export interface IRFQ extends Document {
  title: string;
  category: string;
  description: string;
  status: RFQStatus;
  deadline: Date;
  createdBy: mongoose.Types.ObjectId;
  assignedVendors: mongoose.Types.ObjectId[];
  lineItems: IRFQLineItem[];
  attachments: string[];
  selectedQuotationId?: mongoose.Types.ObjectId;
  approvalId?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema<IRFQLineItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  specification: { type: String },
});

const RFQSchema = new Schema<IRFQ>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED'],
      default: 'DRAFT',
    },
    deadline: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedVendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
    lineItems: [LineItemSchema],
    attachments: [{ type: String }],
    selectedQuotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    approvalId: { type: Schema.Types.ObjectId, ref: 'Approval' },
    organizationId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

RFQSchema.index({ status: 1, deadline: 1 });
RFQSchema.index({ assignedVendors: 1 });
RFQSchema.index({ title: 'text', description: 'text' });
RFQSchema.index({ createdBy: 1 });

export const RFQ = mongoose.model<IRFQ>('RFQ', RFQSchema);
