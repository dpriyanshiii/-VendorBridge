import mongoose from 'mongoose';
import { Approval, IApproval } from '../models/Approval';
import { RFQ } from '../models/RFQ';
import { AppError } from '../utils/AppError';

export class ApprovalService {
  static async createApproval(data: any, createdBy: string): Promise<IApproval> {
    const existing = await Approval.findOne({ rfqId: data.rfqId, status: { $in: ['PENDING', 'APPROVED'] } });
    if (existing) throw new AppError('Active approval already exists', 400, 'APPROVAL_EXISTS');

    if (data.levels && Array.isArray(data.levels)) {
      for (const level of data.levels) {
        if (level.approverId === 'auto-select' || !mongoose.Types.ObjectId.isValid(level.approverId)) {
          const User = mongoose.model('User');
          const manager = await User.findOne({ role: 'MANAGER' });
          if (manager) {
            level.approverId = manager._id;
          } else {
            const admin = await User.findOne({ role: 'ADMIN' });
            if (admin) {
              level.approverId = admin._id;
            } else {
              throw new AppError('No eligible approver found in system', 400, 'NO_APPROVER');
            }
          }
        }
      }
    }

    const approval = new Approval({
      ...data,
      createdBy,
      status: 'PENDING',
      currentLevel: 1,
    });

    await approval.save();

    await RFQ.findByIdAndUpdate(data.rfqId, {
      selectedQuotationId: data.quotationId,
      approvalId: approval._id,
    });

    return approval;
  }

  static async actOnApproval(approvalId: string, userId: string, action: 'APPROVE' | 'REJECT', remarks?: string): Promise<IApproval> {
    const approval = await Approval.findById(approvalId);
    if (!approval) throw new AppError('Approval not found', 404, 'NOT_FOUND');
    if (approval.status !== 'PENDING') throw new AppError('Approval is not pending', 400, 'INVALID_STATE');

    const currentLevel = approval.levels.find(l => l.level === approval.currentLevel);
    if (!currentLevel) throw new AppError('Level configuration error', 500, 'INTERNAL_ERROR');

    if (currentLevel.approverId.toString() !== userId) {
      throw new AppError('You are not the approver for the current level', 403, 'FORBIDDEN');
    }

    currentLevel.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    currentLevel.actedAt = new Date();
    currentLevel.remarks = remarks;

    if (action === 'REJECT') {
      approval.status = 'REJECTED';
    } else {
      const isLastLevel = approval.currentLevel === approval.levels.length;
      if (isLastLevel) {
        approval.status = 'APPROVED';
      } else {
        approval.currentLevel += 1;
      }
    }

    await approval.save();
    return approval;
  }

  static async getApprovals(query: any): Promise<{ items: IApproval[]; total: number }> {
    const { status, page = 1, limit = 10 } = query;
    const filter: any = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Approval.find(filter)
        .populate('rfqId', 'title')
        .populate('levels.approverId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Approval.countDocuments(filter),
    ]);

    return { items, total };
  }

  static async getApprovalById(id: string): Promise<IApproval> {
    const approval = await Approval.findById(id)
      .populate('rfqId')
      .populate('quotationId')
      .populate('levels.approverId', 'firstName lastName role');
    if (!approval) throw new AppError('Approval not found', 404, 'NOT_FOUND');
    return approval;
  }
}
