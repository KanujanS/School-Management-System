import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  class: {
    type: String,
    required: [true, 'Please specify the class']
  },
  date: {
    type: Date,
    required: [true, 'Please specify the date']
  },
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: [true, 'Status is required']
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records for the same class and date
attendanceSchema.index({ class: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
