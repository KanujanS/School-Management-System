import User from '../models/User.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const createOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const hashOTP = (otp) =>
  crypto.createHash('sha256').update(String(otp)).digest('hex');

const getMailerTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server/.env');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const sendPasswordResetOTPEmail = async (toEmail, otp, name) => {
  const transporter = getMailerTransport();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject: 'Mahiyangana National School - Password Reset OTP',
    text: `Hello ${name || 'User'},\n\nYour password reset OTP is: ${otp}\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">Password Reset Request</h2>
        <p>Hello ${name || 'User'},</p>
        <p>Your password reset OTP is:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #7f1d1d;">${otp}</p>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, class: className, studentId } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        required: ['name', 'email', 'password']
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [
        { email },
        ...(studentId ? [{ studentId }] : [])
      ]
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email 
          ? 'Email already registered' 
          : 'Student ID already registered'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: ['staff', 'admin'].includes(role) ? role : 'student', // Allow both staff and admin roles
      ...(className && { class: className }),
      ...(studentId && { studentId })
    });

    // Log user creation result (without sensitive data)
    console.log('User created:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      studentId: user.studentId
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      studentId: user.studentId,
      token: generateToken(user._id)
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: {
        ...userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Request OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'This email is not registered.'
      });
    }

    const otp = createOTP();
    user.passwordResetOTPHash = hashOTP(otp);
    user.passwordResetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetOTPEmail(user.email, otp, user.name);

    return res.json({
      success: true,
      message: 'OTP has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message
    });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const otp = String(req.body?.otp || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({ email }).select('+passwordResetOTPHash +passwordResetOTPExpires');

    if (!user || !user.passwordResetOTPHash || !user.passwordResetOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    if (user.passwordResetOTPExpires.getTime() < Date.now()) {
      user.passwordResetOTPHash = undefined;
      user.passwordResetOTPExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    if (hashOTP(otp) !== user.passwordResetOTPHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.password = newPassword;
    user.passwordResetOTPHash = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user data',
      error: error.message
    });
  }
};

// @desc    Get all staff members
// @route   GET /auth/staff
// @access  Private/Admin
export const getAllStaff = async (req, res) => {
  try {
    // Include original password in the response
    const staff = await User.find({ role: 'staff' }).select('+originalPassword');
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get all staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting staff members',
      error: error.message
    });
  }
};

// @desc    Update staff member
// @route   PUT /auth/staff/:id
// @access  Private/Admin
export const updateStaff = async (req, res) => {
  try {
    const { name, email, staffType, department, isActive } = req.body;
    const staffId = req.params.id;

    // Find staff member
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Update fields
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (staffType) staff.staffType = staffType;
    if (department) staff.department = department;
    if (typeof isActive === 'boolean') staff.isActive = isActive;

    // Save changes
    await staff.save();

    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.json({
      success: true,
      data: staffResponse
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating staff member',
      error: error.message
    });
  }
};

// @desc    Remove staff member
// @route   DELETE /auth/staff/:id
// @access  Private/Admin
export const removeStaff = async (req, res) => {
  try {
    const staffId = req.params.id;

    // Find and remove staff member
    const staff = await User.findByIdAndDelete(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member removed successfully'
    });
  } catch (error) {
    console.error('Remove staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing staff member',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /auth/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get total students from Student model
    const totalStudents = await Student.countDocuments();

    // Get staff statistics
    const staffStats = await User.aggregate([
      { $match: { role: 'staff' } },
      {
        $group: {
          _id: null,
          totalStaff: { $sum: 1 },
          teachingStaff: {
            $sum: { $cond: [{ $eq: ['$staffType', 'teaching'] }, 1, 0] }
          },
          supportStaff: {
            $sum: { $cond: [{ $eq: ['$staffType', 'support'] }, 1, 0] }
          },
          activeStaff: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveStaff: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          }
        }
      }
    ]);

    // Get total admins
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get recent staff members
    const recentStaff = await User.find({ role: 'staff' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Prepare the response
    const stats = {
      totalStudents,
      totalStaff: staffStats[0]?.totalStaff || 0,
      teachingStaff: staffStats[0]?.teachingStaff || 0,
      supportStaff: staffStats[0]?.supportStaff || 0,
      activeStaff: staffStats[0]?.activeStaff || 0,
      inactiveStaff: staffStats[0]?.inactiveStaff || 0,
      totalAdmins,
      recentStaff
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Create new staff member
// @route   POST /auth/staff
// @access  Private/Admin
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, staffType, department } = req.body;

    // Validate required fields
    if (!name || !email || !password || !staffType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if staff already exists
    const existingStaff = await User.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Staff member already exists'
      });
    }

    // Create staff member
    const staff = await User.create({
      name,
      email,
      password,
      role: 'staff',
      staffType,
      department: department || staffType // Use staffType as department if not provided
    });

    // Get the staff member with original password
    const staffWithPassword = await User.findById(staff._id).select('+originalPassword');

    // Remove password from response but keep originalPassword
    const staffResponse = staffWithPassword.toObject();
    delete staffResponse.password;

    res.status(201).json({
      success: true,
      data: staffResponse
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating staff member',
      error: error.message
    });
  }
}; 