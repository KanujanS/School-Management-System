import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'event', 'urgent'],
    default: 'general'
  },
  recipients: {
    type: String,
    enum: ['all', 'staff', 'students'],
    default: 'all'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Notification', notificationSchema); 