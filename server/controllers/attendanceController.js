import Attendance from '../models/attendance.js';
import User from '../models/User.js';

// @desc    Add attendance records
// @route   POST /api/attendance
// @access  Private (Staff/Admin)
export const addAttendance = async (req, res) => {
  try {
    const { students, class: className, date } = req.body;

    // Validate input
    if (!students || !className || !date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create attendance records for each student
    const attendanceRecords = await Promise.all(
      students.map(async (student) => {
        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          studentId: student.id,
          date: new Date(date)
        });

        if (existingAttendance) {
          // Update existing attendance
          existingAttendance.status = student.status;
          return await existingAttendance.save();
        }

        // Create new attendance record
        return await Attendance.create({
          studentId: student.id,
          status: student.status,
          class: className,
          date: new Date(date),
          markedBy: req.user._id
        });
      })
    );

    res.status(201).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
export const getAttendance = async (req, res) => {
  try {
    const { date, class: className } = req.query;
    let query = {};

    // Add date filter if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Add class filter if provided
    if (className && className !== 'all') {
      query.class = className;
    }

    // For students, only show their own attendance
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name studentId class')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance summary
// @route   GET /api/attendance/summary
// @access  Private
export const getAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = studentId ? { studentId } : {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    const totalDays = await Attendance.countDocuments(query);
    const presentDays = await Attendance.countDocuments({
      ...query,
      status: 'present'
    });

    const summary = {
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      attendanceRate: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
