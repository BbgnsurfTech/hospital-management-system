import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { NotificationPanel } from './NotificationPanel';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Hospital Management System
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">
            {user?.firstName} {user?.lastName}
          </Typography>

          <IconButton color="inherit" onClick={handleNotificationOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            edge="end"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
        >
          <MenuItem disabled>
            <Box>
              <Typography variant="body2">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>

        <NotificationPanel
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
        />
      </Toolbar>
    </AppBar>
  );
};
