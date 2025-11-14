import { Router } from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadNotificationCount,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadNotificationCount);
router.patch('/:notificationId/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
