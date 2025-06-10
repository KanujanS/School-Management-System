import Mark from '../models/Mark.js';

// @desc    Create a new mark
// @route   POST /api/marks
// @access  Private/Staff
export const createMark = async (req, res) => {
  try {
    // Validate required fields
    const { student, subject, score, totalMarks, examType } = req.body;
    
    if (!student || !subject || score === undefined || !examType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: student, subject, score, examType'
      });
    }

    // Create the mark
    const mark = await Mark.create({
      student,
      subject,
      score: Number(score),
      totalMarks: Number(totalMarks || 100),
      examType,
      createdBy: req.user._id
    });

    // Populate the response with student and creator details
    const populatedMark = await Mark.findById(mark._id)
      .populate('student', 'name admissionNumber class')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedMark
    });
  } catch (error) {
    console.error('Error creating mark:', error);
    
    // Handle duplicate entry error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A mark for this student, subject and term already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create mark',
      error: error.message
    });
  }
};

// @desc    Get all marks
// @route   GET /api/marks
// @access  Private
export const getMarks = async (req, res) => {
  try {
    const { limit = 10, staffId } = req.query;
    
    // Build query
    const query = {};
    
    // If staffId is provided, filter by creator
    if (staffId) {
      query.createdBy = staffId;
    }

    const marks = await Mark.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('createdBy', 'name')
      .populate('student', 'name');

    res.json({
      success: true,
      count: marks.length,
      marks
    });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marks',
      error: error.message
    });
  }
};

// @desc    Get single mark
// @route   GET /api/marks/:id
// @access  Private
export const getMarkById = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('student', 'name');

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark not found'
      });
    }

    res.json({
      success: true,
      data: mark
    });
  } catch (error) {
    console.error('Error fetching mark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mark',
      error: error.message
    });
  }
};

// @desc    Update mark
// @route   PUT /api/marks/:id
// @access  Private/Staff
export const updateMark = async (req, res) => {
  try {
    let mark = await Mark.findById(req.params.id);

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark not found'
      });
    }

    // Make sure user is mark creator
    if (mark.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this mark'
      });
    }

    mark = await Mark.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: mark
    });
  } catch (error) {
    console.error('Error updating mark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mark',
      error: error.message
    });
  }
};

// @desc    Delete mark
// @route   DELETE /api/marks/:id
// @access  Private/Staff
export const deleteMark = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark not found'
      });
    }

    // Make sure user is mark creator
    if (mark.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this mark'
      });
    }

    await mark.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting mark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete mark',
      error: error.message
    });
  }
}; 