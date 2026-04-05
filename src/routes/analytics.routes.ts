import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/event', authMiddleware, analyticsController.trackEvent.bind(analyticsController));
router.get('/stats', authMiddleware, analyticsController.getUserStats.bind(analyticsController));

export default router;
