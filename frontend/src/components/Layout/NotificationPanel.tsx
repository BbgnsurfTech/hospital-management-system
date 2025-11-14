import React, { useEffect } from 'react';
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { width: 400, maxHeight: 500 },
      }}
    >
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.some((n) => !n.isRead) && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
      </Box>

      <Divider />

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress size={24} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box p={3} textAlign="center">
          <Typography color="text.secondary">No notifications</Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              button
              onClick={() => handleNotificationClick(notification.id)}
              sx={{
                bgcolor: notification.isRead ? 'transparent' : 'action.hover',
              }}
            >
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {notification.message}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Popover>
  );
};
