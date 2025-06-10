import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  originalPassword: {
    type: String,
    select: false // Don't include in normal queries
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'student'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Staff specific fields
  staffType: {
    type: String,
    enum: ['teaching', 'support'],
    required: function() {
      return this.role === 'staff';
    }
  },
  department: {
    type: String,
    default: function() {
      return this.staffType; // Default to staffType if not provided
    }
  },
  // Student specific fields
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    required: function() {
      return this.role === 'student';
    }
  },
  class: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  grade: {
    type: Number,
    required: function() {
      return this.role === 'student';
    },
    min: [1, 'Grade must be at least 1'],
    max: [13, 'Grade cannot exceed 13']
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Store the original password before hashing
    this.originalPassword = this.password;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Normalize class name before saving
userSchema.pre('save', function(next) {
  if (this.role === 'student' && this.class) {
    // Replace multiple spaces with a single hyphen
    this.class = this.class.replace(/\s+/g, '-');
  }
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 