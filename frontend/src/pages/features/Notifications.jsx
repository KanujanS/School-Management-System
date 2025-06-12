import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AddNotification from '../../components/AddNotification';

const Notifications = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      if (Array.isArray(response)) {
        setNotifications(response);
      } else {
        console.error('Invalid notifications response:', response);
        toast.error('Failed to load notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        logout();
        navigate('/login');
        return;
      }
      
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleAddNotification = async (notificationData) => {
    try {
      const response = await notificationAPI.create({
        ...notificationData,
        userId: user._id,
        category: notificationData.type
      });
      
      if (response) {
        setNotifications(prev => [response, ...prev]);
        setOpenAddDialog(false);
        toast.success('Notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        logout();
        navigate('/login');
        return;
      }
      
      toast.error(error.message || 'Failed to send notification');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        logout();
        navigate('/login');
        return;
      }
      
      toast.error(error.message || 'Failed to delete notification');
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'urgent':
        return '#f44336';
      case 'academic':
        return '#2196f3';
      case 'event':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Notifications</Typography>
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            Send Notification
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No notifications found</Typography>
        </Paper>
      ) : (
        <List>
          {notifications.map((notification) => (
            <Paper key={notification._id} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getNotificationColor(notification.category || 'general') }}>
                    <NotificationsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="textSecondary">
                        {new Date(notification.date).toLocaleString()}
                      </Typography>
                    </React.Fragment>
                  }
                />
                {(user?.role === 'admin' || user?._id === notification.userId) && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDeleteNotification(notification._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      <AddNotification
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddNotification}
      />
    </Box>
  );
};

export default Notifications; 