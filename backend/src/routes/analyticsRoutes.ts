import { Router } from 'express';
import {
  getDashboardStats,
  getPatientFlowAnalytics,
  getDepartmentStats,
  getRevenueAnalytics,
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.DOCTOR));

router.get('/dashboard', getDashboardStats);
router.get('/patient-flow', getPatientFlowAnalytics);
router.get('/departments', getDepartmentStats);
router.get('/revenue', authorize(UserRole.ADMIN), getRevenueAnalytics);

export default router;
