import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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
      email,
      password,
      role,
      ...(className && { class: className }),
      ...(studentId && { studentId })
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
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password',
        required: ['email', 'password']
      });
    }

    // Check for user email and include password field
    const user = await User.findOne({ email }).select('+password');
    
    // If no user found with this email
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    // If password doesn't match
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If everything is valid, send the response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      studentId: user.studentId,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      error: error.message 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      studentId: user.studentId
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile',
      error: error.message 
    });
  }
};

// @desc    Get all staff members
// @route   GET /api/auth/staff
// @access  Admin
export const getAllStaff = async (req, res) => {
  try {
    const staffMembers = await User.find({ role: 'staff' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(staffMembers);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ 
      message: 'Error fetching staff members',
      error: error.message 
    });
  }
};

// @desc    Remove a staff member
// @route   DELETE /api/auth/staff/:id
// @access  Admin
export const removeStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    if (staff.role !== 'staff') {
      return res.status(400).json({ message: 'User is not a staff member' });
    }

    // Instead of deleting, set isActive to false
    staff.isActive = false;
    await staff.save();

    res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error('Remove staff error:', error);
    res.status(500).json({ 
      message: 'Error removing staff member',
      error: error.message 
    });
  }
};

// @desc    Update staff status (active/inactive)
// @route   PATCH /api/auth/staff/:id/status
// @access  Admin
export const updateStaffStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const staff = await User.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    if (staff.role !== 'staff') {
      return res.status(400).json({ message: 'User is not a staff member' });
    }

    staff.isActive = isActive;
    await staff.save();

    res.json({ message: 'Staff status updated successfully', isActive });
  } catch (error) {
    console.error('Update staff status error:', error);
    res.status(500).json({ 
      message: 'Error updating staff status',
      error: error.message 
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/auth/dashboard-stats
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalStaff] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'staff' })
    ]);

    const [teachingStaff, supportStaff] = await Promise.all([
      User.countDocuments({ role: 'staff', staffType: 'teaching' }),
      User.countDocuments({ role: 'staff', staffType: 'support' })
    ]);

    res.json({
      totalStudents,
      totalStaff,
      teachingStaff,
      supportStaff
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
}; 