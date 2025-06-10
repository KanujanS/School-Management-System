import User from '../models/User.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
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