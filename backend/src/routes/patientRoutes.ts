import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerPatient,
  checkInPatient,
  getPatient,
  getPatients,
  getPatientHistory,
  updatePatient,
} from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.RECEPTIONIST, UserRole.ADMIN),
  [
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('dateOfBirth').isISO8601(),
    body('gender').isIn(['male', 'female', 'other']),
    body('phone').notEmpty(),
    body('address').notEmpty(),
    body('emergencyContact').isObject(),
    validate,
  ],
  registerPatient
);

router.post(
  '/:patientId/check-in',
  authorize(UserRole.RECEPTIONIST, UserRole.NURSE, UserRole.ADMIN),
  [body('chiefComplaint').notEmpty(), validate],
  checkInPatient
);

router.get('/', authorize(UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN), getPatients);
router.get('/:id', getPatient);
router.get('/:id/history', getPatientHistory);
router.patch('/:id', authorize(UserRole.RECEPTIONIST, UserRole.ADMIN), updatePatient);

export default router;
