import { Router } from 'express';
import { logController } from '../controllers/log.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { markLogSchema } from '../validators/medication.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(markLogSchema), logController.markMedication.bind(logController));
router.get('/timeline', logController.getTimeline.bind(logController));
router.get('/medication/:id', logController.getMedicationLogs.bind(logController));

export default router;
