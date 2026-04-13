import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.post('/track', analyticsController.trackEvent.bind(analyticsController));
router.get('/stats', analyticsController.getStats.bind(analyticsController));

export default router;
