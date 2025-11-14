import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBill,
  processPayment,
  getBill,
  getVisitBill,
  getPendingBills,
} from '../controllers/billingController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.BILLING, UserRole.ADMIN),
  [
    body('visitId').notEmpty(),
    body('items').isArray(),
    validate,
  ],
  createBill
);

router.post(
  '/:billId/payment',
  authorize(UserRole.BILLING, UserRole.ADMIN),
  [
    body('paidAmount').isNumeric(),
    body('paymentMethod').notEmpty(),
    validate,
  ],
  processPayment
);

router.get('/pending', authorize(UserRole.BILLING, UserRole.ADMIN), getPendingBills);
router.get('/:billId', getBill);
router.get('/visit/:visitId', getVisitBill);

export default router;
