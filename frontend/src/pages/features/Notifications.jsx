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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    recipients: 'all'
  });

  // Sample notification types
  const notificationTypes = [
    { value: 'general', label: 'General' },
    { value: 'academic', label: 'Academic' },
    { value: 'event', label: 'Event' },
    { value: 'urgent', label: 'Urgent' }
  ];

  // Sample recipient groups
  const recipientGroups = [
    { value: 'all', label: 'All Users' },
    { value: 'staff', label: 'Staff Only' },
    { value: 'students', label: 'Students Only' },
    { value: 'parents', label: 'Parents Only' }
  ];

  // Sample notifications data
  const sampleNotifications = [
    {
      _id: '1',
      title: 'School Closure Notice',
      message: 'School will be closed tomorrow due to inclement weather.',
      type: 'urgent',
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      createdBy: 'Admin'
    },
    {
      _id: '2',
      title: 'Parent-Teacher Meeting',
      message: 'Parent-teacher meetings are scheduled for next week.',
      type: 'general',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      createdBy: 'Admin'
    },
    {
      _id: '3',
      title: 'Exam Schedule Released',
      message: 'The final exam schedule has been published.',
      type: 'academic',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      createdBy: 'Admin'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotifications(sampleNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleAddNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Simulate API call
      const notification = {
        _id: Date.now().toString(),
        ...newNotification,
        createdAt: new Date(),
        createdBy: user.name
      };

      setNotifications(prev => [notification, ...prev]);
      setOpenAddDialog(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'general',
        recipients: 'all'
      });
      toast.success('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
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
        {user?.role === 'admin' && (
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
                  <Avatar sx={{ bgcolor: getNotificationColor(notification.type) }}>
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
                        {new Date(notification.createdAt).toLocaleString()} - {notification.createdBy}
                      </Typography>
                    </React.Fragment>
                  }
                />
                {user?.role === 'admin' && (
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

      {/* Add Notification Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send New Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newNotification.title}
              onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Message"
              value={newNotification.message}
              onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={newNotification.type}
                onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                label="Type"
              >
                {notificationTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Recipients</InputLabel>
              <Select
                value={newNotification.recipients}
                onChange={(e) => setNewNotification(prev => ({ ...prev, recipients: e.target.value }))}
                label="Recipients"
              >
                {recipientGroups.map(group => (
                  <MenuItem key={group.value} value={group.value}>
                    {group.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNotification} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications; 