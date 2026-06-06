import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: any, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: req.user });
    } catch (error) {
      next(error);
    }
  }
}
