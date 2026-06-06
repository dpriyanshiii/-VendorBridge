import { Notification, NotificationType } from '../models/Notification';

export class NotificationService {
  static async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    entityRef?: { type: string; id: string }
  ) {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      entityRef,
    });
    await notification.save();
    return notification;
  }

  static async getNotifications(userId: string, query: any) {
    const { isRead, page = 1, limit = 20 } = query;
    const filter: any = { userId };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments(filter),
    ]);

    return { items, total };
  }

  static async markAsRead(id: string, userId: string) {
    return Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true });
  }

  static async markAllAsRead(userId: string) {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true });
  }
}
