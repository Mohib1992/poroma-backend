import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { analyticsService } from '../services/analytics.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      
      await analyticsService.trackEvent(result.user.id, 'user_registered', {
        phone: result.user.phone,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      await analyticsService.trackEvent(result.user.id, 'user_logged_in', {
        phone: result.user.phone,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
