import mongoose, { Document, Schema } from 'mongoose';

export type VendorStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'BLOCKED';

export interface IVendorAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  pin: string;
}

export interface IVendorContact {
  name: string;
  email: string;
  phone: string;
}

export interface IVendor extends Document {
  name: string;
  category: string;
  gstNumber: string;
  panNumber?: string;
  address: IVendorAddress;
  primaryContact: IVendorContact;
  status: VendorStatus;
  rating: number;
  tags: string[];
  onboardingDate: Date;
  paymentTermsDefault?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    gstNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    panNumber: { type: String, trim: true },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      pin: { type: String, default: '' },
    },
    primaryContact: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_VERIFICATION', 'BLOCKED'],
      default: 'PENDING_VERIFICATION',
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    tags: [{ type: String }],
    onboardingDate: { type: Date, default: Date.now },
    paymentTermsDefault: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

VendorSchema.index({ gstNumber: 1 }, { unique: true });
VendorSchema.index({ status: 1, category: 1 });
VendorSchema.index({ name: 'text' });

export const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);
