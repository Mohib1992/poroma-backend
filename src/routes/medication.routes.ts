import { Router } from 'express';
import { medicationController } from '../controllers/medication.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addMedicationSchema, updateMedicationSchema } from '../validators/medication.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(addMedicationSchema), medicationController.addMedication.bind(medicationController));
router.get('/', medicationController.getMedications.bind(medicationController));
router.get('/refill-pending', medicationController.getRefillPending.bind(medicationController));
router.get('/:id', medicationController.getMedication.bind(medicationController));
router.put('/:id', validate(updateMedicationSchema), medicationController.updateMedication.bind(medicationController));
router.delete('/:id', medicationController.deleteMedication.bind(medicationController));
router.put('/:id/stock', medicationController.updateStock.bind(medicationController));

export default router;
