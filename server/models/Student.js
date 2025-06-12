import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  admissionNumber: {
    type: String,
    required: [true, 'Admission number is required'],
    unique: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: [true, 'Gender is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  parentName: {
    type: String,
    required: [true, "Parent's name is required"]
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  originalPassword: {
    type: String,
    select: false // Don't include in normal queries
  },
  // For O/L students
  grade: {
    type: mongoose.Schema.Types.Mixed,  // Allow both Number and String for A/L
    validate: {
      validator: function(value) {
        return value === 'A/L' || (typeof value === 'number' && value >= 1 && value <= 11);
      },
      message: 'Grade must be either "A/L" or a number between 1 and 11'
    }
  },
  division: {
    type: String
  },
  // For A/L students
  stream: {
    type: String,
    enum: ['physical-science', 'biological-science', 'commerce', 'arts', 'bio-technology', 'engineering-technology']
  },
  isAdvancedLevel: {
    type: Boolean,
    default: false
  },
  attendance: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
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

// Update the updatedAt timestamp before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the validation pre-hook
studentSchema.pre('validate', function(next) {
  if (this.isAdvancedLevel) {
    // For A/L students, require stream and grade='A/L'
    if (this.stream && this.grade === 'A/L' && !this.division) {
      next();
    } else {
      next(new Error('Advanced Level students must have a stream and grade="A/L"'));
    }
  } else {
    // For O/L students, require grade (number) and division
    if (typeof this.grade === 'number' && this.division && !this.stream) {
      next();
    } else {
      next(new Error('O/L students must have a numeric grade and division'));
    }
  }
});

// Method to check password
studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

export default Student; 