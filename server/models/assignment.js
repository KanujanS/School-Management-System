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
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^(grade-\d{1,2}-[a-f]|a\/l-[a-z-]+)$/.test(v);
      },
      message: props => `${props.value} is not a valid class format! Use Grade-6-A or A/L-stream format`
    }
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please add total marks'],
    min: [0, 'Total marks cannot be negative'],
    max: [100, 'Total marks cannot exceed 100']
  },
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
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

// Pre-save hook to ensure class name is lowercase
assignmentSchema.pre('save', function(next) {
  if (this.isModified('class')) {
    this.class = this.class.toLowerCase();
  }
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
