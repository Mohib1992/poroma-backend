import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types';

export class AnalyticsController {
  async trackEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { event_type, event_data } = req.body;
      const deviceInfo = req.headers['user-agent'];

      const event = await analyticsService.trackEvent(
        req.user?.userId || null,
        event_type,
        event_data,
        { userAgent: deviceInfo }
      );

      res.status(201).json({ success: true, data: { event } });
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getUserStats(req.user!.userId);
      res.json({ success: true, data: { stats } });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
