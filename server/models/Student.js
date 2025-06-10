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
  // For O/L students
  grade: {
    type: Number,
    min: 1,
    max: 11
  },
  division: {
    type: String
  },
  // For A/L students
  stream: {
    type: String,
    enum: ['physical-science', 'biological-science', 'commerce', 'arts', 'bio-technology', 'engineering-technology']
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
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
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

// Ensure either (grade and division) or stream is provided
studentSchema.pre('validate', function(next) {
  if ((this.grade && this.division && !this.stream) || (!this.grade && !this.division && this.stream)) {
    next();
  } else {
    next(new Error('Either (grade and division) or stream must be provided'));
  }
});

// Method to check password
studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

export default Student; 