import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'ADMIN' | 'PROCUREMENT_OFFICER' | 'MANAGER' | 'VENDOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  vendorId?: mongoose.Types.ObjectId;
  phone?: string;
  status: UserStatus;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER', 'VENDOR'], required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', default: null },
    phone: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'INVITED'], default: 'ACTIVE' },
    lastLoginAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
