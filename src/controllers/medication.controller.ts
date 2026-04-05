import { Response, NextFunction } from 'express';
import { medicationService } from '../services/medication.service';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types';

export class MedicationController {
  async addMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medication = await medicationService.addMedication(req.user!.userId, req.body);

      await analyticsService.trackEvent(req.user!.userId, 'medication_added', {
        medication_id: medication.id,
        medication_name: medication.name,
        frequency: medication.frequency,
      });

      res.status(201).json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }

  async getMedications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const medications = await medicationService.getMedications(req.user!.userId, includeInactive);
      res.json({ success: true, data: { medications } });
    } catch (error) {
      next(error);
    }
  }

  async getMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medication = await medicationService.getMedication(req.user!.userId, req.params.id);
      res.json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }

  async updateMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medication = await medicationService.updateMedication(req.user!.userId, req.params.id, req.body);
      res.json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }

  async deleteMedication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medication = await medicationService.deleteMedication(req.user!.userId, req.params.id);
      res.json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }

  async getRefillPending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medications = await medicationService.getMedicationsNeedingRefill(req.user!.userId);
      res.json({ success: true, data: { medications } });
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { stockCount } = req.body;
      const medication = await medicationService.updateStock(req.user!.userId, req.params.id, stockCount);
      res.json({ success: true, data: { medication } });
    } catch (error) {
      next(error);
    }
  }
}

export const medicationController = new MedicationController();
