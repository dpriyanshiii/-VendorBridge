import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId },
  timestamp: { type: Date, default: Date.now, immutable: true },
  metadata: { type: Schema.Types.Mixed, immutable: true },
});

AuditLogSchema.pre('save', function (next) {
  if (process.env.SKIP_IMMUTABILITY_PRE_HOOKS === 'true') return next();
  if (!this.isNew) {
    return next(new Error('Audit logs are immutable and cannot be updated.'));
  }
  next();
});

const preventUpdate = function (this: any, next: any) {
  if (process.env.SKIP_IMMUTABILITY_PRE_HOOKS === 'true') return next();
  next(new Error('Audit logs are immutable and cannot be updated.'));
};
AuditLogSchema.pre('findOneAndUpdate', preventUpdate);
AuditLogSchema.pre('updateOne', preventUpdate);
AuditLogSchema.pre('updateMany', preventUpdate);
AuditLogSchema.pre('replaceOne', preventUpdate);

const preventDelete = function (this: any, next: any) {
  if (process.env.SKIP_IMMUTABILITY_PRE_HOOKS === 'true') return next();
  next(new Error('Audit logs are immutable and cannot be deleted.'));
};
AuditLogSchema.pre('deleteOne', preventDelete);
AuditLogSchema.pre('deleteMany', preventDelete);
AuditLogSchema.pre('findOneAndDelete', preventDelete);

AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
