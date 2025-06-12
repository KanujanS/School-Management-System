import Mark from '../models/Mark.js';
import User from '../models/User.js';

// @desc    Add or update marks
// @route   POST /api/marks
// @access  Private (Staff/Admin)
export const addMarks = async (req, res, next) => {
  try {
    const { student, subject, class: className, examType, score, totalMarks, grade, remarks } = req.body;

    // Validate student exists and belongs to the specified class
    const studentUser = await User.findOne({ _id: student, role: 'student' });
    if (!studentUser) {
      const error = new Error('Invalid student');
      error.status = 400;
      throw error;
    }

    // Create or update marks
    const mark = await Mark.findOneAndUpdate(
      { student, subject, examType },
      {
        student,
        subject,
        class: className,
        examType,
        score,
        totalMarks,
        grade,
        remarks,
        markedBy: req.user._id
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('student', 'name admissionNumber class')
      .populate('markedBy', 'name');

    res.status(201).json(mark);
  } catch (error) {
    next(error);
  }
};

// @desc    Add multiple marks in bulk
// @route   POST /api/marks/bulk
// @access  Private (Staff/Admin)
export const addBulkMarks = async (req, res, next) => {
  try {
    const { marks } = req.body;

    if (!Array.isArray(marks) || marks.length === 0) {
      const error = new Error('Please provide an array of marks');
      error.status = 400;
      throw error;
    }

    const createdMarks = [];
    const errors = [];

    // Process each mark entry
    for (const markData of marks) {
      try {
        // Validate required fields
        const { studentName, admissionNumber, subject, class: className, examType, score, totalMarks } = markData;

        if (!studentName || !admissionNumber || !subject || !className || !examType || score === undefined) {
          errors.push({ subject, error: 'Missing required fields' });
          continue;
        }

        // Find student by admission number or studentId
        const studentUser = await User.findOne({ 
          $or: [
            { admissionNumber },
            { studentId: admissionNumber }
          ],
          role: 'student',
          status: { $ne: 'inactive' }
        }).select('name admissionNumber studentId class');

        if (!studentUser) {
          console.error('Student validation failed:', {
            admissionNumber,
            subject,
            className
          });
          errors.push({ 
            subject, 
            error: `Student not found with admission number: ${admissionNumber}`
          });
          continue;
        }

        // Validate student belongs to the specified class
        if (studentUser.class !== className) {
          console.error('Class mismatch:', {
            admissionNumber,
            studentClass: studentUser.class,
            providedClass: className
          });
          errors.push({ 
            subject, 
            error: `Student does not belong to class ${className}`
          });
          continue;
        }

        // Validate score is a number and within range
        const numericScore = Number(score);
        if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
          errors.push({ subject, error: 'Invalid score (must be between 0 and 100)' });
          continue;
        }

        // Calculate grade based on score
        let grade = 'F';
        if (numericScore >= 75) grade = 'A';
        else if (numericScore >= 65) grade = 'B';
        else if (numericScore >= 55) grade = 'C';
        else if (numericScore >= 35) grade = 'S';

        // Create or update mark
        const mark = await Mark.findOneAndUpdate(
          { student: studentUser._id, subject, examType },
          {
            student: studentUser._id,
            subject,
            class: className,
            examType,
            score: numericScore,
            totalMarks: Number(totalMarks || 100),
            grade,
            remarks: markData.remarks || `${grade} grade in ${subject}`,
            markedBy: req.user._id
          },
          { 
            new: true, 
            upsert: true, 
            runValidators: true,
            setDefaultsOnInsert: true
          }
        ).populate('student', 'name admissionNumber class')
          .populate('markedBy', 'name');

        createdMarks.push(mark);
      } catch (error) {
        console.error('Error creating mark:', {
          error,
          markData,
          stack: error.stack
        });
        errors.push({ 
          subject: markData.subject, 
          error: error.message || 'Failed to save mark'
        });
      }
    }

    // Log the results
    console.log('Bulk marks creation results:', {
      totalMarks: marks.length,
      createdMarks: createdMarks.length,
      errors: errors.length,
      errorDetails: errors
    });

    if (errors.length > 0) {
      const errorMessage = errors.map(err => `${err.subject}: ${err.error}`).join(', ');
      const error = new Error(`Some marks failed to save: ${errorMessage}`);
      error.status = 400;
      error.errors = errors;
      throw error;
    }

    res.status(201).json({
      success: true,
      data: createdMarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get marks (with filters)
// @route   GET /api/marks
// @access  Private
export const getMarks = async (req, res, next) => {
  try {
    console.log('Debug - Request received:', {
      query: req.query,
      user: {
        id: req.user?._id,
        role: req.user?.role
      },
      headers: req.headers
    });

    const { student, subject, examType, class: className } = req.query;
    
    // Build filter object
    const filter = {};
    if (student) filter.student = student;
    if (subject) filter.subject = subject;
    if (examType) filter.examType = examType;
    if (className) filter.class = className;

    // If user is a student, only show their marks
    if (req.user?.role === 'student') {
      filter.student = req.user._id;
    }

    console.log('Debug - Applied filters:', filter);

    // Get total count of marks for debugging
    const totalMarks = await Mark.countDocuments({});
    console.log('Debug - Total marks in database:', totalMarks);

    // Get filtered marks
    const marks = await Mark.find(filter)
      .populate({
        path: 'student',
        select: 'name admissionNumber class role',
        match: { role: 'student' }
      })
      .populate('markedBy', 'name')
      .sort({ createdAt: -1 });

    console.log('Debug - Query results:', {
      totalFound: marks.length,
      hasResults: marks.length > 0,
      sampleMark: marks[0] ? {
        id: marks[0]._id,
        student: marks[0].student?._id,
        subject: marks[0].subject,
        class: marks[0].class
      } : null
    });

    // Filter out marks with invalid student references
    const validMarks = marks.filter(mark => mark.student);

    console.log('Debug - Valid marks:', {
      total: validMarks.length,
      sample: validMarks[0] ? {
        id: validMarks[0]._id,
        student: validMarks[0].student?._id,
        subject: validMarks[0].subject,
        class: validMarks[0].class
      } : null
    });

    res.json(validMarks);
  } catch (error) {
    console.error('Error in getMarks:', {
      error: error.message,
      stack: error.stack,
      query: req.query,
      user: req.user?._id
    });
    next(error);
  }
};

// @desc    Get student report card
// @route   GET /api/marks/report/:studentId
// @access  Private
export const getReportCard = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // If user is a student, they can only view their own report
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      const error = new Error('Not authorized to view this report card');
      error.status = 403;
      throw error;
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      const error = new Error('Student not found');
      error.status = 404;
      throw error;
    }

    const marks = await Mark.find({ student: studentId })
      .populate('student', 'name admissionNumber class')
      .populate('markedBy', 'name')
      .sort({ subject: 1, examType: 1 });

    // Calculate statistics
    const reportCard = {
      student: {
        name: student.name,
        admissionNumber: student.admissionNumber,
        class: student.class
      },
      terms: {},
      overall: {
        totalScore: 0,
        averageScore: 0,
        subjects: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, S: 0, F: 0 }
      }
    };

    marks.forEach(mark => {
      // Initialize term if not exists
      if (!reportCard.terms[mark.examType]) {
        reportCard.terms[mark.examType] = {
          totalScore: 0,
          averageScore: 0,
          subjects: 0,
          gradeDistribution: { A: 0, B: 0, C: 0, S: 0, F: 0 }
        };
      }

      // Update term statistics
      reportCard.terms[mark.examType].totalScore += mark.score;
      reportCard.terms[mark.examType].subjects += 1;
      reportCard.terms[mark.examType].gradeDistribution[mark.grade] += 1;

      // Update overall statistics
      reportCard.overall.totalScore += mark.score;
      reportCard.overall.subjects += 1;
      reportCard.overall.gradeDistribution[mark.grade] += 1;
    });

    // Calculate averages
    Object.keys(reportCard.terms).forEach(term => {
      reportCard.terms[term].averageScore = 
        reportCard.terms[term].totalScore / reportCard.terms[term].subjects;
    });

    reportCard.overall.averageScore = 
      reportCard.overall.totalScore / reportCard.overall.subjects;

    // Add marks details
    reportCard.marks = marks;

    res.json(reportCard);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete marks
// @route   DELETE /api/marks/:id
// @access  Private (Staff/Admin)
export const deleteMarks = async (req, res, next) => {
  try {
    const mark = await Mark.findById(req.params.id);

    if (!mark) {
      const error = new Error('Marks not found');
      error.status = 404;
      throw error;
    }

    // Verify marker or admin status
    if (mark.markedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      const error = new Error('Not authorized to delete these marks');
      error.status = 403;
      throw error;
    }

    await mark.deleteOne();
    res.json({ message: 'Marks deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 