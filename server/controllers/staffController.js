import User from '../models/User.js';

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private/Admin
export const getAllStaff = async (req, res) => {
  try {
    console.log('Fetching all staff members');
    const staff = await User.find({ role: 'staff' })
      .select('-password') // Don't include password in response
      .lean(); // Convert to plain JavaScript object for better performance

    console.log('Found staff members:', staff.length);
    
    if (staff.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No staff members found',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff members retrieved successfully',
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff:', {
      error,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      message: 'Error fetching staff',
      error: error.message 
    });
  }
};

// @desc    Get staff by ID
// @route   GET /api/staff/:id
// @access  Private/Admin
export const getStaffById = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Error fetching staff' });
  }
};

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private/Admin
export const createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Creating new staff member:', {
      name,
      email,
      passwordLength: password ? password.length : 0
    });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['name', 'email', 'password']
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new staff member
    const staff = await User.create({
      name,
      email,
      password,
      role: 'staff'
    });

    console.log('Staff member created:', {
      _id: staff._id,
      name: staff.name,
      email: staff.email
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ message: 'Error creating staff' });
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
export const updateStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const updatedStaff = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Error updating staff' });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private/Admin
export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (staff.role !== 'staff') {
      return res.status(400).json({ message: 'User is not a staff member' });
    }

    // Instead of deleting, set isActive to false
    staff.isActive = false;
    await staff.save();

    res.json({ message: 'Staff member deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating staff:', error);
    res.status(500).json({ message: 'Error deactivating staff' });
  }
};
