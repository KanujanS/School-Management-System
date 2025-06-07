import mongoose from 'mongoose';

const markSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    uppercase: true
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true,
    uppercase: true
  },
  term: {
    type: String,
    required: [true, 'Term is required'],
    enum: {
      values: ['FIRST', 'SECOND', 'THIRD'],
      message: '{VALUE} is not a valid term'
    },
    uppercase: true
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  grade: {
    type: String,
    uppercase: true
  },
  remarks: {
    type: String,
    trim: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate marks entries
markSchema.index(
  { student: 1, subject: 1, term: 1 },
  { unique: true }
);

// Calculate grade before saving
markSchema.pre('save', function(next) {
  this.grade = calculateGrade(this.marks);
  next();
});

// Grade calculation function
function calculateGrade(marks) {
  if (marks >= 75) return 'A';
  if (marks >= 65) return 'B';
  if (marks >= 55) return 'C';
  if (marks >= 35) return 'S';
  return 'F';
}

const Mark = mongoose.model('Mark', markSchema);

export default Mark; 