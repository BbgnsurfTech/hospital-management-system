import { Router } from 'express';
import { body } from 'express-validator';
import {
  getMyPatients,
  startConsultation,
  updateConsultation,
  issuePrescription,
  orderLabTests,
  completeConsultation,
} from '../controllers/doctorController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.DOCTOR, UserRole.ADMIN));

router.get('/my-patients', getMyPatients);
router.post('/consultations/:visitId/start', startConsultation);
router.patch('/consultations/:visitId', updateConsultation);
router.post(
  '/consultations/:visitId/prescriptions',
  [body('medications').isArray(), validate],
  issuePrescription
);
router.post(
  '/consultations/:visitId/lab-tests',
  [body('tests').isArray(), validate],
  orderLabTests
);
router.post('/consultations/:visitId/complete', completeConsultation);

export default router;
