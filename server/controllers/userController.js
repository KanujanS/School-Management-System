import User from '../models/User.js';

// @desc    Delete user (student)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find and delete the user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure we only allow deletion of students
    if (user.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete student accounts'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get students by class
// @route   GET /api/users/students
// @access  Private/Staff
export const getStudentsByClass = async (req, res) => {
  try {
    // Get class from either query params or URL params
    const className = req.query.class || req.params.className;
    
    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a class'
      });
    }

    console.log('Debug - Fetching students for class:', {
      requestedClass: className,
      normalizedClass: decodeURIComponent(className)
    });

    // Find all students in the class
    const students = await User.find({
      role: 'student',
      class: decodeURIComponent(className) // Class names are already hyphenated in the database
    }).select('_id name admissionNumber class');

    console.log('Debug - Query results:', {
      totalFound: students.length,
      sample: students[0] ? {
        id: students[0]._id,
        name: students[0].name,
        class: students[0].class
      } : null,
      query: {
        role: 'student',
        class: decodeURIComponent(className)
      }
    });

    // Return empty array if no students found
    if (!students || students.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: `No students found in class: ${decodeURIComponent(className).replace(/-/g, ' ')}`
      });
    }

    // Return the students with normalized data
    const normalizedStudents = students.map(student => ({
      _id: student._id,
      name: student.name,
      admissionNumber: student.admissionNumber || student.studentId || 'N/A',
      class: student.class
    }));

    res.json({
      success: true,
      data: normalizedStudents,
      message: `Found ${normalizedStudents.length} students in class: ${decodeURIComponent(className).replace(/-/g, ' ')}`
    });
  } catch (error) {
    console.error('Error in getStudentsByClass:', {
      error: error.message,
      stack: error.stack,
      query: req.query,
      params: req.params
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

// @desc    Add test students for a class
// @route   POST /api/users/students/test/:className
// @access  Private/Admin
export const addTestStudents = async (req, res) => {
  try {
    const { className } = req.params;
    
    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a class name'
      });
    }

    // Create test students data
    const testStudents = [
      {
        name: "John Smith",
        email: "john.smith@example.com",
        password: "password123",
        role: "student",
        class: className,
        studentId: "G6A001"
      },
      {
        name: "Emma Wilson",
        email: "emma.wilson@example.com",
        password: "password123",
        role: "student",
        class: className,
        studentId: "G6A002"
      },
      {
        name: "Michael Brown",
        email: "michael.brown@example.com",
        password: "password123",
        role: "student",
        class: className,
        studentId: "G6A003"
      },
      {
        name: "Sarah Davis",
        email: "sarah.davis@example.com",
        password: "password123",
        role: "student",
        class: className,
        studentId: "G6A004"
      },
      {
        name: "James Johnson",
        email: "james.johnson@example.com",
        password: "password123",
        role: "student",
        class: className,
        studentId: "G6A005"
      }
    ];

    console.log('Debug - Adding test students for class:', className);

    // Create all students
    const createdStudents = await User.create(testStudents);

    console.log('Debug - Created students:', createdStudents.length);

    // Return success response
    res.status(201).json({
      success: true,
      message: `Successfully added ${createdStudents.length} test students to ${className}`,
      data: createdStudents.map(student => ({
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        class: student.class
      }))
    });
  } catch (error) {
    console.error('Error adding test students:', {
      error: error.message,
      stack: error.stack,
      className: req.params.className
    });
    res.status(500).json({
      success: false,
      message: 'Failed to add test students',
      error: error.message
    });
  }
}; 