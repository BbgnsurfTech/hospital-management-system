import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate,
  ],
  login
);

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('role').isIn(['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'radiologist', 'billing']),
    body('phone').notEmpty(),
    validate,
  ],
  register
);

router.get('/me', authenticate, getCurrentUser);

export default router;
