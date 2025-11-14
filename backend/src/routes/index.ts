import { Router } from 'express';
import authRoutes from './authRoutes';
import patientRoutes from './patientRoutes';
import doctorRoutes from './doctorRoutes';
import labRoutes from './labRoutes';
import pharmacyRoutes from './pharmacyRoutes';
import billingRoutes from './billingRoutes';
import notificationRoutes from './notificationRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/lab', labRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/billing', billingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
