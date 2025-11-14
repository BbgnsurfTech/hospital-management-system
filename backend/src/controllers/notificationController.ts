import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from '../services/notificationService';

export const getUserNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const { page = 1, limit = 20 } = req.query;

    const result = await getNotifications(
      userId,
      Number(page),
      Number(limit)
    );

    res.json({
      status: 'success',
      data: result,
    });
  }
);

export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { notificationId } = req.params;
    const userId = req.user?.id as string;

    const notification = await markNotificationAsRead(notificationId, userId);

    res.json({
      status: 'success',
      data: { notification },
    });
  }
);

export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;

    await markAllNotificationsAsRead(userId);

    res.json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  }
);

export const getUnreadNotificationCount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;

    const count = await getUnreadCount(userId);

    res.json({
      status: 'success',
      data: { count },
    });
  }
);
