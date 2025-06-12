import Student from '../models/Student.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

// @desc    Get all students by grade and division
// @route   GET /api/students/class/:grade/:division
// @access  Private
export const getStudentsByClass = asyncHandler(async (req, res) => {
  try {
    const { grade, division } = req.params;

    if (!grade || !division) {
      return res.status(400).json({
        success: false,
        message: 'Grade and division are required'
      });
    }

    console.log('Debug - Fetching students:', { grade, division });
    
    const students = await Student.find({ 
      grade: Number(grade), 
      division: division.toUpperCase() 
    })
    .sort({ admissionNumber: 1 })
    .select('name admissionNumber gender dateOfBirth address parentName contactNumber email originalPassword'); // Include originalPassword
    
    console.log('Debug - Found students:', students.length);

    // Transform the response to include password field
    const transformedStudents = students.map(student => {
      const studentObj = student.toObject();
      studentObj.password = studentObj.originalPassword || 'Not available';
      delete studentObj.originalPassword;
      return studentObj;
    });

    res.json({
      success: true,
      data: transformedStudents,
      message: `Successfully fetched ${students.length} students`
    });
  } catch (error) {
    console.error('Error in getStudentsByClass:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

// @desc    Get all students by stream
// @route   GET /api/students/stream/:stream
// @access  Private
export const getStudentsByStream = asyncHandler(async (req, res) => {
  try {
    const { stream } = req.params;

    if (!stream) {
      return res.status(400).json({
        success: false,
        message: 'Stream is required'
      });
    }

    console.log('Debug - Fetching students for stream:', stream);
    
    const students = await Student.find({ stream: stream.toLowerCase() })
      .sort({ admissionNumber: 1 })
      .select('name admissionNumber gender dateOfBirth address parentName contactNumber email originalPassword'); // Include originalPassword
    
    console.log('Debug - Found students:', students.length);

    // Transform the response to include password field
    const transformedStudents = students.map(student => {
      const studentObj = student.toObject();
      studentObj.password = studentObj.originalPassword || 'Not available';
      delete studentObj.originalPassword;
      return studentObj;
    });

    res.json({
      success: true,
      data: transformedStudents,
      message: `Successfully fetched ${students.length} students from ${stream} stream`
    });
  } catch (error) {
    console.error('Error in getStudentsByStream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

// @desc    Add new student
// @route   POST /api/students
// @access  Private
export const addStudent = asyncHandler(async (req, res) => {
  try {
    console.log('Debug - Received student data:', {
      ...req.body,
      password: '[REDACTED]'
    });

    const {
      name,
      admissionNumber,
      gender,
      dateOfBirth,
      address,
      parentName,
      contactNumber,
      email,
      password,
      stream,
      grade,
      division
    } = req.body;

    // Validate required fields
    const requiredFields = {
      name,
      admissionNumber,
      gender,
      dateOfBirth,
      address,
      parentName,
      contactNumber,
      email,
      password
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log('Debug - Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Debug - Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate contact number (10 digits)
    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(contactNumber)) {
      console.log('Debug - Invalid contact number format:', contactNumber);
      return res.status(400).json({
        success: false,
        message: 'Contact number must be exactly 10 digits'
      });
    }

    // Check if student with same admission number exists
    const existingStudent = await Student.findOne({ admissionNumber });
    if (existingStudent) {
      console.log('Debug - Duplicate admission number:', admissionNumber);
      return res.status(400).json({
        success: false,
        message: 'Student with this admission number already exists'
      });
    }

    // Check if student with same email exists in either Student or User collection
    const existingEmail = await Promise.all([
      Student.findOne({ email }),
      User.findOne({ email })
    ]);

    if (existingEmail[0] || existingEmail[1]) {
      console.log('Debug - Duplicate email:', email);
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Validate that either stream or (grade and division) is provided
    if (!stream && (!grade || !division)) {
      console.log('Debug - Missing stream or grade/division:', { stream, grade, division });
      return res.status(400).json({
        success: false,
        message: 'Please provide either stream or both grade and division'
      });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create student data object
      const studentData = {
        name: name.trim(),
        admissionNumber: admissionNumber.trim(),
        gender,
        dateOfBirth,
        address: address.trim(),
        parentName: parentName.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim().toLowerCase(),
        password
      };

      // Add either stream or grade/division
      if (stream) {
        studentData.stream = stream.toLowerCase();
        studentData.grade = 'A/L';  // Set grade to A/L for Advanced Level students
        studentData.isAdvancedLevel = true;
      } else {
        studentData.grade = Number(grade);
        studentData.division = division.toUpperCase();
        studentData.isAdvancedLevel = false;
      }

      // Hash the password once
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the student with hashed password
      studentData.password = hashedPassword;
      studentData.originalPassword = password;
      const student = await Student.create([studentData], { session });

      // Create corresponding user account with the same hashed password
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        originalPassword: password,
        role: 'student',
        studentId: admissionNumber.trim(),
        admissionNumber: admissionNumber.trim(),
        class: stream ? `A/L-${stream.toLowerCase()}` : `Grade-${grade}-${division.toUpperCase()}`,
        grade: stream ? 'A/L' : Number(grade),  // Handle A/L grade properly
        isAdvancedLevel: !!stream,  // Add isAdvancedLevel flag
        isActive: true  // Ensure the user is active by default
      };

      const user = await User.create([userData], { session });

      await session.commitTransaction();

      console.log('Debug - Student and user account created successfully:', {
        studentId: student[0]._id,
        userId: user[0]._id,
        name: student[0].name,
        admissionNumber: student[0].admissionNumber
      });

      // Return success response without password
      const studentResponse = student[0].toObject();
      delete studentResponse.password;

      res.status(201).json({
        success: true,
        data: studentResponse,
        message: 'Student created successfully'
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Error creating student:', {
      error: error,
      message: error.message,
      stack: error.stack,
      body: {
        ...req.body,
        password: '[REDACTED]'
      }
    });
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.log('Debug - Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Invalid student data',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      console.log('Debug - Duplicate key error:', error.keyPattern);
      return res.status(400).json({
        success: false,
        message: 'A student with this admission number or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    });
  }
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

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the student first
    const student = await Student.findById(id).session(session);
    if (!student) {
      await session.abortTransaction();
      res.status(404);
      throw new Error('Student not found');
    }

    // Delete from Student collection
    await student.deleteOne({ session });

    // Delete from User collection using student's email
    await User.deleteOne({ email: student.email }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      data: {},
      message: 'Student deleted successfully'
    });
  } catch (error) {
    // If anything fails, abort the transaction
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
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