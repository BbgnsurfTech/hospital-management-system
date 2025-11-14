import React, { useEffect } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useNotificationStore } from '../../store/notificationStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { initializeNotifications } = useNotificationStore();

  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: (theme) => theme.palette.grey[100],
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
