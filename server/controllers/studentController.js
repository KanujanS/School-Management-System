import Student from '../models/Student.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all students by grade and division
// @route   GET /api/students/class/:grade/:division
// @access  Private
export const getStudentsByClass = asyncHandler(async (req, res) => {
  const { grade, division } = req.params;
  
  const students = await Student.find({ grade: Number(grade), division })
    .sort({ admissionNumber: 1 })
    .select('-password'); // Exclude password from response
  
  res.json({
    success: true,
    data: students
  });
});

// @desc    Get all students by stream
// @route   GET /api/students/stream/:stream
// @access  Private
export const getStudentsByStream = asyncHandler(async (req, res) => {
  const { stream } = req.params;
  
  const students = await Student.find({ stream })
    .sort({ admissionNumber: 1 })
    .select('-password'); // Exclude password from response
  
  res.json({
    success: true,
    data: students
  });
});

// @desc    Add new student
// @route   POST /api/students
// @access  Private
export const addStudent = asyncHandler(async (req, res) => {
  const studentData = req.body;

  // Check if student with same admission number exists
  const existingStudent = await Student.findOne({ admissionNumber: studentData.admissionNumber });
  if (existingStudent) {
    res.status(400);
    throw new Error('Student with this admission number already exists');
  }

  // Check if student with same email exists
  const existingEmail = await Student.findOne({ email: studentData.email });
  if (existingEmail) {
    res.status(400);
    throw new Error('Student with this email already exists');
  }

  const student = await Student.create(studentData);

  // Return student data without password
  const studentResponse = student.toObject();
  delete studentResponse.password;

  res.status(201).json({
    success: true,
    data: {
      ...studentResponse,
      password: studentData.password // Send back the original unhashed password
    }
  });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if student exists
  const student = await Student.findById(id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // If updating admission number, check if it's unique
  if (updateData.admissionNumber && updateData.admissionNumber !== student.admissionNumber) {
    const existingStudent = await Student.findOne({ admissionNumber: updateData.admissionNumber });
    if (existingStudent) {
      res.status(400);
      throw new Error('Student with this admission number already exists');
    }
  }

  // If updating email, check if it's unique
  if (updateData.email && updateData.email !== student.email) {
    const existingEmail = await Student.findOne({ email: updateData.email });
    if (existingEmail) {
      res.status(400);
      throw new Error('Student with this email already exists');
    }
  }

  // If password is not being updated, remove it from updateData
  if (!updateData.password) {
    delete updateData.password;
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    data: {
      ...updatedStudent.toObject(),
      password: updateData.password || undefined // Send back the new unhashed password if it was updated
    }
  });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await student.deleteOne();

  res.json({
    success: true,
    data: {}
  });
});

// @desc    Change student password
// @route   PUT /api/students/:id/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  const student = await Student.findById(id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Check if current password matches
  const isMatch = await student.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  student.password = newPassword;
  await student.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
}); 