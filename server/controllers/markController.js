import Mark from '../models/Mark.js';
import User from '../models/User.js';

// @desc    Add or update marks
// @route   POST /api/marks
// @access  Private (Staff/Admin)
export const addMarks = async (req, res) => {
  try {
    const { student, subject, class: className, term, marks, remarks } = req.body;

    // Validate student exists and belongs to the specified class
    const studentUser = await User.findOne({ _id: student, role: 'student', class: className });
    if (!studentUser) {
      return res.status(400).json({ message: 'Invalid student or class' });
    }

    // Create or update marks
    const mark = await Mark.findOneAndUpdate(
      { student, subject, term },
      {
        student,
        subject,
        class: className,
        term,
        marks,
        remarks,
        markedBy: req.user._id
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('student', 'name email class')
      .populate('markedBy', 'name email');

    res.status(201).json(mark);
  } catch (error) {
    console.error('Add marks error:', error);
    res.status(500).json({
      message: 'Error adding marks',
      error: error.message
    });
  }
};

// @desc    Get marks (with filters)
// @route   GET /api/marks
// @access  Private
export const getMarks = async (req, res) => {
  try {
    const { student, subject, term, class: className } = req.query;
    
    // Build filter object
    const filter = {};
    if (student) filter.student = student;
    if (subject) filter.subject = subject.toUpperCase();
    if (term) filter.term = term.toUpperCase();
    if (className) filter.class = className.toUpperCase();

    // If user is a student, only show their marks
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    }

    const marks = await Mark.find(filter)
      .populate('student', 'name email class')
      .populate('markedBy', 'name email')
      .sort({ subject: 1, term: 1 });

    res.json(marks);
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({
      message: 'Error fetching marks',
      error: error.message
    });
  }
};

// @desc    Get student report card
// @route   GET /api/marks/report/:studentId
// @access  Private
export const getReportCard = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // If user is a student, they can only view their own report
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized to view this report card' });
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const marks = await Mark.find({ student: studentId })
      .populate('student', 'name email class')
      .populate('markedBy', 'name email')
      .sort({ subject: 1, term: 1 });

    // Calculate statistics
    const reportCard = {
      student: {
        name: student.name,
        email: student.email,
        class: student.class
      },
      terms: {},
      overall: {
        totalMarks: 0,
        averageMarks: 0,
        subjects: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, S: 0, F: 0 }
      }
    };

    marks.forEach(mark => {
      // Initialize term if not exists
      if (!reportCard.terms[mark.term]) {
        reportCard.terms[mark.term] = {
          totalMarks: 0,
          averageMarks: 0,
          subjects: 0,
          gradeDistribution: { A: 0, B: 0, C: 0, S: 0, F: 0 }
        };
      }

      // Update term statistics
      reportCard.terms[mark.term].totalMarks += mark.marks;
      reportCard.terms[mark.term].subjects += 1;
      reportCard.terms[mark.term].gradeDistribution[mark.grade] += 1;

      // Update overall statistics
      reportCard.overall.totalMarks += mark.marks;
      reportCard.overall.subjects += 1;
      reportCard.overall.gradeDistribution[mark.grade] += 1;
    });

    // Calculate averages
    Object.keys(reportCard.terms).forEach(term => {
      reportCard.terms[term].averageMarks = 
        reportCard.terms[term].totalMarks / reportCard.terms[term].subjects;
    });

    reportCard.overall.averageMarks = 
      reportCard.overall.totalMarks / reportCard.overall.subjects;

    // Add marks details
    reportCard.marks = marks;

    res.json(reportCard);
  } catch (error) {
    console.error('Get report card error:', error);
    res.status(500).json({
      message: 'Error generating report card',
      error: error.message
    });
  }
};

// @desc    Delete marks
// @route   DELETE /api/marks/:id
// @access  Private (Staff/Admin)
export const deleteMarks = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);

    if (!mark) {
      return res.status(404).json({ message: 'Marks not found' });
    }

    // Verify marker or admin status
    if (mark.markedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete these marks' });
    }

    await mark.deleteOne();
    res.json({ message: 'Marks deleted successfully' });
  } catch (error) {
    console.error('Delete marks error:', error);
    res.status(500).json({
      message: 'Error deleting marks',
      error: error.message
    });
  }
}; 