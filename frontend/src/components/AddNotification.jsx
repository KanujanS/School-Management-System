import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';

const AddNotification = ({ open, onClose, onAdd }) => {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    recipients: 'all'
  });

  // Notification types
  const notificationTypes = [
    { value: 'general', label: 'General' },
    { value: 'academic', label: 'Academic' },
    { value: 'event', label: 'Event' },
    { value: 'urgent', label: 'Urgent' }
  ];

  // Recipient groups
  const recipientGroups = [
    { value: 'all', label: 'All Users' },
    { value: 'staff', label: 'Staff Only' },
    { value: 'students', label: 'Students Only' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!notification.title || !notification.message) {
      return;
    }
    onAdd(notification);
    setNotification({
      title: '',
      message: '',
      type: 'general',
      recipients: 'all'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Notification</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Title"
          type="text"
          fullWidth
          value={notification.title}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="message"
          label="Message"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={notification.message}
          onChange={handleChange}
          required
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={notification.type}
            onChange={handleChange}
            label="Type"
          >
            {notificationTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Recipients</InputLabel>
          <Select
            name="recipients"
            value={notification.recipients}
            onChange={handleChange}
            label="Recipients"
          >
            {recipientGroups.map(group => (
              <MenuItem key={group.value} value={group.value}>
                {group.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          disabled={!notification.title || !notification.message}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNotification; 