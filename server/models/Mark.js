import mongoose from 'mongoose';

const markSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a student']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  score: {
    type: Number,
    required: [true, 'Please add a score'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please add total marks'],
    min: [0, 'Total marks cannot be negative'],
    default: 100
  },
  examType: {
    type: String,
    required: [true, 'Please add exam type'],
    enum: ['Term 1', 'Term 2', 'Term 3'],
    trim: true
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'S', 'F', ''],
    default: ''
  },
  class: {
    type: String,
    required: [true, 'Please add class'],
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate marks entries
markSchema.index(
  { student: 1, subject: 1, examType: 1 },
  { unique: true }
);

// Calculate grade before saving
markSchema.pre('save', function(next) {
  const score = this.score;
  if (score >= 75) this.grade = 'A';
  else if (score >= 65) this.grade = 'B';
  else if (score >= 55) this.grade = 'C';
  else if (score >= 35) this.grade = 'S';
  else this.grade = 'F';
  next();
});

// Normalize class name before saving
markSchema.pre('save', function(next) {
  if (this.class) {
    // Replace multiple spaces with a single hyphen
    this.class = this.class.replace(/\s+/g, '-');
  }
  next();
});

const Mark = mongoose.model('Mark', markSchema);

export default Mark; 