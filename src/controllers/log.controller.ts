import { Response, NextFunction } from 'express';
import { logService } from '../services/log.service';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types';

export class LogController {
  async markMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const log = await logService.markMedication(req.user!.userId, req.body);

      await analyticsService.trackEvent(req.user!.userId, `medication_${req.body.status}`, {
        medication_id: req.body.medication_id,
        scheduled_time: req.body.scheduled_time,
        status: req.body.status,
      });

      res.status(201).json({ success: true, data: { log } });
    } catch (error) {
      next(error);
    }
  }

  async getTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      const timeline = await logService.getTimeline(req.user!.userId, date as string);
      res.json({ success: true, data: timeline });
    } catch (error) {
      next(error);
    }
  }

  async getMedicationLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { days } = req.query;
      const logs = await logService.getMedicationLogs(
        req.user!.userId,
        req.params.id,
        days ? parseInt(days as string) : 7
      );
      res.json({ success: true, data: { logs } });
    } catch (error) {
      next(error);
    }
  }
}

export const logController = new LogController();
