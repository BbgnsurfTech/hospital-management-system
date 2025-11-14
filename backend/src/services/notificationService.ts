import pool from '../config/database';
import { NotificationType, UserRole } from '../types';
import { getIO } from './socketService';

interface NotifyStaffParams {
  type: string;
  title: string;
  message: string;
  roles: UserRole[];
  data?: any;
  specificUserId?: string;
}

export const notifyStaff = async (params: NotifyStaffParams) => {
  const { type, title, message, roles, data, specificUserId } = params;

  try {
    let recipients;

    if (specificUserId) {
      // Notify specific user
      recipients = await pool.query(
        'SELECT id, role FROM users WHERE id = $1 AND is_active = true',
        [specificUserId]
      );
    } else {
      // Notify all users with specified roles
      recipients = await pool.query(
        'SELECT id, role FROM users WHERE role = ANY($1) AND is_active = true',
        [roles]
      );
    }

    const io = getIO();

    // Create notifications for each recipient
    for (const recipient of recipients.rows) {
      const notificationResult = await pool.query(
        `INSERT INTO notifications (type, recipient_id, recipient_role, title, message, data)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [type, recipient.id, recipient.role, title, message, data ? JSON.stringify(data) : null]
      );

      const notification = notificationResult.rows[0];

      // Emit real-time notification via WebSocket
      io.to(`user-${recipient.id}`).emit('notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.created_at,
      });
    }

    return { success: true, count: recipients.rows.length };
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
};

export const getNotifications = async (userId: string, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE recipient_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1',
    [userId]
  );

  return {
    notifications: result.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  const result = await pool.query(
    'UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_id = $2 RETURNING *',
    [notificationId, userId]
  );

  return result.rows[0];
};

export const markAllNotificationsAsRead = async (userId: string) => {
  await pool.query(
    'UPDATE notifications SET is_read = true WHERE recipient_id = $1 AND is_read = false',
    [userId]
  );
};

export const getUnreadCount = async (userId: string) => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND is_read = false',
    [userId]
  );

  return parseInt(result.rows[0].count);
};
