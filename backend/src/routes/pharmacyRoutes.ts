import { Router } from 'express';
import {
  getPendingPrescriptions,
  dispenseMedication,
  getPrescriptionDetails,
  getInventory,
  updateInventory,
} from '../controllers/pharmacyController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get(
  '/prescriptions/pending',
  authorize(UserRole.PHARMACIST, UserRole.ADMIN),
  getPendingPrescriptions
);

router.post(
  '/prescriptions/:prescriptionId/dispense',
  authorize(UserRole.PHARMACIST, UserRole.ADMIN),
  dispenseMedication
);

router.get('/prescriptions/:prescriptionId', getPrescriptionDetails);

router.get(
  '/inventory',
  authorize(UserRole.PHARMACIST, UserRole.ADMIN),
  getInventory
);

router.patch(
  '/inventory/:itemId',
  authorize(UserRole.PHARMACIST, UserRole.ADMIN),
  updateInventory
);

export default router;
