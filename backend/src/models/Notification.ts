import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'RFQ_PUBLISHED'
  | 'RFQ_ASSIGNED'
  | 'QUOTATION_SUBMITTED'
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_DECISION'
  | 'PO_CREATED'
  | 'INVOICE_SENT'
  | 'INVOICE_OVERDUE';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  entityRef?: { type: string; id: mongoose.Types.ObjectId };
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'RFQ_PUBLISHED', 'RFQ_ASSIGNED', 'QUOTATION_SUBMITTED',
        'APPROVAL_REQUIRED', 'APPROVAL_DECISION', 'PO_CREATED',
        'INVOICE_SENT', 'INVOICE_OVERDUE',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityRef: {
      type: { type: String },
      id: { type: Schema.Types.ObjectId },
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
