import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Please add a class'],
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please add total marks']
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index to optimize queries
assignmentSchema.index({ class: 1, subject: 1, dueDate: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
