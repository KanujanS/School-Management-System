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
    },
    validate: {
      validator: function(v) {
        if (!v) return false;
        v = v.trim();
        // Legacy support:
        // - O/L: 4 digits (e.g., 6001)
        // - A/L: subject code + 3 digits (e.g., PS001)
        // New support:
        // - O/L: YYGCLXX (e.g., 2408A12)
        // - A/L: YYALSTREAMXX (e.g., 23ALSCI05)
        return (
          /^\d{4}$/.test(v) ||
          /^(PS|BS|AR|CM|CO|ET|BT|SCI)\d{3}$/.test(v) ||
          /^\d{4}[A-Z]\d{2}$/.test(v) ||
          /^\d{2}AL(PS|BS|CO|AR|BT|ET|SCI)\d{2}$/.test(v)
        );
      },
      message: props => `${props.value} is not a valid student ID format! Use YYGCLXX for O/L or YYALSTREAMXX for A/L`
    }
  },
  admissionNumber: {
    type: String,
    unique: true,
    sparse: true,
    required: function() {
      return this.role === 'student';
    },
    validate: {
      validator: function(v) {
        if (!v) return false;
        v = v.trim();
        // Legacy support:
        // - O/L: 4 digits (e.g., 6001)
        // - A/L: subject code + 3 digits (e.g., PS001)
        // New support:
        // - O/L: YYGCLXX (e.g., 2408A12)
        // - A/L: YYALSTREAMXX (e.g., 23ALSCI05)
        return (
          /^\d{4}$/.test(v) ||
          /^(PS|BS|AR|CM|CO|ET|BT|SCI)\d{3}$/.test(v) ||
          /^\d{4}[A-Z]\d{2}$/.test(v) ||
          /^\d{2}AL(PS|BS|CO|AR|BT|ET|SCI)\d{2}$/.test(v)
        );
      },
      message: props => `${props.value} is not a valid admission number format! Use YYGCLXX for O/L or YYALSTREAMXX for A/L`
    }
  },
  class: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    validate: {
      validator: function(v) {
        // Allow both formats: "Grade-6-A" and "A/L-physical-science"
        return /^(Grade-\d{1,2}-[A-F]|A\/L-[a-z-]+)$/.test(v);
      },
      message: props => `${props.value} is not a valid class format! Use Grade-6-A or A/L-stream format`
    }
  },
  grade: {
    type: mongoose.Schema.Types.Mixed,  // Allow both Number and String for A/L
    required: function() {
      return this.role === 'student';
    },
    validate: {
      validator: function(value) {
        return value === 'A/L' || (typeof value === 'number' && value >= 1 && value <= 11);
      },
      message: 'Grade must be either "A/L" or a number between 1 and 11'
    }
  },
  isAdvancedLevel: {
    type: Boolean,
    default: false
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
    if (!this.originalPassword) {
      this.originalPassword = this.password;
    }
    
    // Only hash if the password isn't already hashed (60 characters is the length of a bcrypt hash)
    if (this.password.length !== 60) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Normalize class name before saving
userSchema.pre('save', function(next) {
  if (this.role === 'student') {
    // Replace multiple spaces with a single hyphen and ensure proper format
    if (this.class) {
      this.class = this.class
        .replace(/\s+/g, '-')
        .toLowerCase()  // Convert to lowercase
        .replace(/^grade\s*(\d{1,2})\s*-?\s*([a-f])$/i, 'Grade-$1-$2')
        .replace(/^a\s*\/?\s*l\s*-?\s*(.+)$/i, 'A/L-$1');
    }

    // Synchronize studentId and admissionNumber
    if (this.studentId && !this.admissionNumber) {
      this.admissionNumber = this.studentId;
    } else if (this.admissionNumber && !this.studentId) {
      this.studentId = this.admissionNumber;
    }
  }
  next();
});

// Add validation for Advanced Level students
userSchema.pre('validate', function(next) {
  if (this.role === 'student') {
    if (this.isAdvancedLevel) {
      // For A/L students
      if (this.grade === 'A/L' && this.class.startsWith('A/L-')) {
        next();
      } else {
        next(new Error('Advanced Level students must have grade="A/L" and class starting with "A/L-"'));
      }
    } else {
      // For O/L students
      if (typeof this.grade === 'number' && this.class.startsWith('Grade-')) {
        next();
      } else {
        next(new Error('O/L students must have a numeric grade and class starting with "Grade-"'));
      }
    }
  } else {
    next();
  }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 