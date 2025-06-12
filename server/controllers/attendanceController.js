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
      query: req.query
    });
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

    if (!className || !date || !students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide class, date, and a non-empty students array'
      });
    }

    const invalidStudents = students.filter(
      s => !s.student || !s.status || !['present', 'absent'].includes(s.status)
    );

    if (invalidStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Each student must have an ID and a status (present/absent)'
      });
    }

    // Normalize the date to get full day range
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);


    const attendance = await Attendance.create({
      class: className,
      date: startOfDay, // store normalized date
      students: students.map(s => ({
        student: s.student,
        status: s.status
      })),
      createdBy: req.user._id
    });

    await attendance.populate([
      { path: 'students.student', select: 'name admissionNumber' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      data: attendance,
      message: 'Attendance record created successfully'
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
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

    const query = {};

    if (className) query.class = className;

    if (date) {
      const parsedDate = new Date(date);
      const nextDate = new Date(parsedDate);
      nextDate.setDate(parsedDate.getDate() + 1);
      query.date = { $gte: parsedDate, $lt: nextDate };
    }

    if (staffId) query.createdBy = staffId;

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
