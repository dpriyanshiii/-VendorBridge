import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  static async getAll(req: any, res: Response, next: NextFunction) {
    try {
      const data = await NotificationService.getNotifications(req.user._id, req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: any, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user._id);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: any, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user._id);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}
