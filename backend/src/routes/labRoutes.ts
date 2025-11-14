import { Router } from 'express';
import {
  getPendingTests,
  updateTestStatus,
  getTestDetails,
  getPatientTests,
} from '../controllers/labController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get(
  '/pending',
  authorize(UserRole.LAB_TECHNICIAN, UserRole.ADMIN),
  getPendingTests
);

router.patch(
  '/:testId',
  authorize(UserRole.LAB_TECHNICIAN, UserRole.ADMIN),
  updateTestStatus
);

router.get('/:testId', getTestDetails);
router.get('/patient/:patientId', getPatientTests);

export default router;
