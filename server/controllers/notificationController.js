import Notification from '../models/Notification.js';

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const { role } = req.user;
    let query = {};

    // If not admin, only show relevant notifications
    if (role !== 'admin') {
      query = {
        $or: [
          { recipients: 'all' },
          { recipients: role === 'staff' ? 'staff' : 'students' }
        ]
      };
    }

    const notifications = await Notification.find(query)
      .sort({ date: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ message: 'Error fetching notification' });
  }
};

// @desc    Create new notification
// @route   POST /api/notifications
// @access  Private (Admin and Staff)
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, recipients } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Only admins and staff can create notifications
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to create notifications' });
    }

    // Staff can only send notifications to students
    if (req.user.role === 'staff' && recipients === 'staff') {
      return res.status(403).json({ message: 'Staff cannot send notifications to other staff members' });
    }

    const notification = await Notification.create({
      title,
      message,
      category: type || 'general',
      recipients: recipients || 'all',
      createdBy: req.user._id
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
};

// @desc    Update notification
// @route   PUT /api/notifications/:id
// @access  Private (Admin only)
export const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only admins can update notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update notifications' });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin and Staff)
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Allow users to delete their own notifications or admins to delete any notification
    if (req.user.role !== 'admin' && notification.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification removed' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/mark-read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
}; 