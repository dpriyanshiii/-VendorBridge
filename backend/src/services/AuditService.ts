import { AuditLog } from '../models/AuditLog';

export class AuditService {
  static async log(
    action: string,
    entityType: string,
    entityId?: string,
    actorId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await AuditLog.create({
        action,
        entityType,
        entityId,
        actorId,
        metadata,
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // We don't throw here to avoid failing the main business transaction just because logging failed,
      // though in a strict system we might want to fail the transaction.
    }
  }

  static async getLogs(query: any): Promise<{ items: any[]; total: number }> {
    const { entityType, entityId, action, page = 1, limit = 50 } = query;
    const filter: any = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;
    if (action) filter.action = action;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('actorId', 'firstName lastName role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    return { items, total };
  }
}
