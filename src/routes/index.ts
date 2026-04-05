import { Router } from 'express';
import authRoutes from './auth.routes';
import medicationRoutes from './medication.routes';
import logRoutes from './log.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/medications', medicationRoutes);
router.use('/logs', logRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
