import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async trackEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_type, event_data } = req.body;
      const deviceInfo = req.headers['user-agent'];

      const event = await analyticsService.trackEvent(
        event_type,
        event_data,
        { userAgent: deviceInfo }
      );

      res.status(201).json({ success: true, data: { event } });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getStats();
      res.json({ success: true, data: { stats } });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
