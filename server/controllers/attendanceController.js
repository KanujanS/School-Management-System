import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Get students by class
// @route   GET /api/users/students
// @access  Private/Staff
export const getStudentsByClass = async (req, res) => {
  try {
    const { class: className } = req.query;
    
    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a class'
      });
    }

    console.log('Fetching students for class:', className); // Debug log

    // Find all students in the class
    const students = await User.find({
      role: 'student',
      class: className
    }).select('_id name studentId class');

    console.log('Found students:', students); // Debug log

    if (!students || students.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No students found in this class'
      });
    }

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

// @desc    Create a new attendance record
// @route   POST /api/attendance
// @access  Private/Staff
export const createAttendance = async (req, res) => {
  try {
    const { class: className, date, students } = req.body;

    // Validate required fields
    if (!className || !date || !students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide class, date, and students array'
      });
    }

    // Validate student entries
    for (const student of students) {
      if (!student.student || !student.status || !['present', 'absent'].includes(student.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student data. Each student must have an ID and status (present/absent)'
        });
      }
    }

    // Check if attendance for this class and date already exists
    const existingAttendance = await Attendance.findOne({
      class: className,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance for this class and date already exists'
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      class: className,
      date: new Date(date),
      students: students.map(s => ({
        student: s.student,
        status: s.status
      })),
      createdBy: req.user._id
    });

    // Populate references
    await attendance.populate([
      {
        path: 'students.student',
        select: 'name admissionNumber'
      },
      {
        path: 'createdBy',
        select: 'name'
      }
    ]);

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create attendance record',
      error: error.message
    });
  }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
export const getAttendance = async (req, res) => {
  try {
    const { class: className, date, staffId, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    // If class is provided, filter by class
    if (className) {
      query.class = className;
    }

    // If date is provided, filter by date
    if (date) {
      query.date = new Date(date);
    }

    // If staffId is provided, filter by creator
    if (staffId) {
      query.createdBy = staffId;
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit))
      .populate([
        {
          path: 'students.student',
          select: 'name admissionNumber'
        },
        {
          path: 'createdBy',
          select: 'name'
        }
      ]);

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate([
        {
          path: 'students.student',
          select: 'name admissionNumber'
        },
        {
          path: 'createdBy',
          select: 'name'
        }
      ]);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance record',
      error: error.message
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Staff
export const updateAttendance = async (req, res) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Make sure user is attendance creator
    if (attendance.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this attendance record'
      });
    }

    // If date or class is being updated, check for duplicates
    if (req.body.date || req.body.class) {
      const existingAttendance = await Attendance.findOne({
        _id: { $ne: req.params.id },
        class: req.body.class || attendance.class,
        date: req.body.date ? new Date(req.body.date) : attendance.date
      });

      if (existingAttendance) {
        return res.status(400).json({
          success: false,
          message: 'Attendance for this class and date already exists'
        });
      }
    }

    attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : attendance.date
      },
      {
        new: true,
        runValidators: true
      }
    ).populate([
      {
        path: 'students.student',
        select: 'name admissionNumber'
      },
      {
        path: 'createdBy',
        select: 'name'
      }
    ]);

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record',
      error: error.message
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Staff
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Make sure user is attendance creator
    if (attendance.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this attendance record'
      });
    }

    await attendance.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record',
      error: error.message
    });
  }
};
