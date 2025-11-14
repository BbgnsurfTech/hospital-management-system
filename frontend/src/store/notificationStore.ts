import { create } from 'zustand';
import { Notification } from '../types';
import api from '../config/api';
import { getSocket } from '../config/socket';
import toast from 'react-hot-toast';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  initializeNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const [notificationsRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);

      set({
        notifications: notificationsRes.data.data.notifications,
        unreadCount: countRes.data.data.count,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post('/notifications/mark-all-read');

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  initializeNotifications: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('notification', (notification: Notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));

      // Show toast notification
      toast.success(notification.title, {
        duration: 5000,
      });
    });
  },
}));
