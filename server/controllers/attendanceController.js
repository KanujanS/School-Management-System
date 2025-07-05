import Attendance from "../models/attendance.js";
import User from "../models/User.js";

// @desc    Get students by class
// @route   GET /api/users/students
// @access  Private/Staff
export const getStudentsByClass = async (req, res) => {
  try {
    const { class: className } = req.query;

    if (!className) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a class" });
    }

    const students = await User.find({
      role: "student",
      class: decodeURIComponent(className),
    }).select("_id name admissionNumber class");

    const normalizedStudents = students.map((student) => ({
      _id: student._id,
      name: student.name,
      admissionNumber: student.admissionNumber || student.studentId || "N/A",
      class: student.class,
    }));

    res.json({
      success: true,
      data: normalizedStudents,
      message: normalizedStudents.length
        ? `Found ${
            normalizedStudents.length
          } students in class: ${decodeURIComponent(className).replace(
            /-/g,
            " "
          )}`
        : `No students found in class: ${decodeURIComponent(className).replace(
            /-/g,
            " "
          )}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch students",
        error: error.message,
      });
  }
};

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private/Staff
export const createAttendance = async (req, res) => {
  try {
    const { class: className, date, students } = req.body;

    if (!className || !date || !students?.length) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Provide class, date, and students array",
        });
    }

    const invalid = students.some(
      (s) => !s.student || !["present", "absent"].includes(s.status)
    );
    if (invalid) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Each student needs ID and valid status",
        });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const attendance = await Attendance.create({
      class: className,
      date: startOfDay,
      students,
      createdBy: req.user._id,
    });

    await attendance.populate([
      { path: "students.student", select: "name admissionNumber" },
      { path: "createdBy", select: "name" },
    ]);

    res
      .status(201)
      .json({ success: true, data: attendance, message: "Attendance created" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create attendance",
        error: error.message,
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
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }
    if (staffId) query.createdBy = staffId;

    const attendance = await Attendance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit))
      .populate([
        { path: "students.student", select: "name admissionNumber class" },
        { path: "createdBy", select: "name" },
      ]);

    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch attendance",
        error: error.message,
      });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate([
      { path: "students.student", select: "name admissionNumber" },
      { path: "createdBy", select: "name" },
    ]);

    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found" });
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch attendance",
        error: error.message,
      });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private/Staff
export const updateAttendance = async (req, res) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance)
      return res.status(404).json({ success: false, message: "Not found" });
    if (attendance.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (req.body.date || req.body.class) {
      const exists = await Attendance.findOne({
        _id: { $ne: req.params.id },
        class: req.body.class || attendance.class,
        date: req.body.date ? new Date(req.body.date) : attendance.date,
      });
      if (exists)
        return res
          .status(400)
          .json({ success: false, message: "Duplicate attendance" });
    }

    attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : attendance.date,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "students.student", select: "name admissionNumber" },
      { path: "createdBy", select: "name" },
    ]);

    res.json({ success: true, data: attendance });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update attendance",
        error: error.message,
      });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private/Staff
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance)
      return res.status(404).json({ success: false, message: "Not found" });

    if (
      attendance.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await attendance.deleteOne();
    res.json({ success: true, message: "Attendance deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete attendance",
        error: error.message,
      });
  }
};

// @desc    Get individual student attendance history with student details
// @route   GET /api/attendance/student
// @access  Private/Student
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await User.findById(studentId).select(
      "name admissionNumber"
    );
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const records = await Attendance.find(
      { "students.student": studentId },
      { class: 1, date: 1, students: { $elemMatch: { student: studentId } } }
    )
      .populate("students.student", "name admissionNumber")
      .sort({ date: -1 });

    const result = records.map((record) => ({
      date: record.date,
      class: record.class,
      status: record.students[0].status,
      name: student.name,
      admissionNumber: student.admissionNumber,
    }));

    res.json({
      success: true,
      data: result,
      message: `Found ${result.length} attendance records for ${student.name}`,
    });
  } catch (error) {
    console.error("Error in getStudentAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
      error: error.message,
    });
  }
};
