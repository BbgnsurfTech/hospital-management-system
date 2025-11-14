import { create } from 'zustand';
import { User } from '../types';
import api from '../config/api';
import { initializeSocket, disconnectSocket } from '../config/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token: accessToken, isAuthenticated: true });

      // Initialize socket connection
      initializeSocket(accessToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      set({ isLoading: false });
      return;
    }

    try {
      const user = JSON.parse(userStr);
      set({ user, token, isAuthenticated: true, isLoading: false });

      // Initialize socket with stored token
      initializeSocket(token);

      // Verify token is still valid
      await api.get('/auth/me');
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
