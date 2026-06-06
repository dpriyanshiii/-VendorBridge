import mongoose, { Document, Schema } from 'mongoose';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ApprovalLevelStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IApprovalLevel {
  level: number;
  approverId: mongoose.Types.ObjectId;
  status: ApprovalLevelStatus;
  actedAt?: Date;
  remarks?: string;
}

export interface IApproval extends Document {
  rfqId: mongoose.Types.ObjectId;
  quotationId: mongoose.Types.ObjectId;
  status: ApprovalStatus;
  currentLevel: number;
  levels: IApprovalLevel[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalLevelSchema = new Schema<IApprovalLevel>({
  level: { type: Number, required: true },
  approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  actedAt: { type: Date },
  remarks: { type: String },
});

const ApprovalSchema = new Schema<IApproval>(
  {
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ', required: true },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING' },
    currentLevel: { type: Number, default: 1 },
    levels: [ApprovalLevelSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ApprovalSchema.index({ rfqId: 1 });
ApprovalSchema.index({ quotationId: 1 });

export const Approval = mongoose.model<IApproval>('Approval', ApprovalSchema);
