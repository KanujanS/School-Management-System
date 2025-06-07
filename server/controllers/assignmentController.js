import Assignment from '../models/assignment.js';

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private (Staff/Admin)
export const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, class: className, dueDate, totalMarks, attachments } = req.body;

    // Create assignment
    const assignment = await Assignment.create({
      title,
      description,
      subject,
      class: className,
      dueDate,
      totalMarks,
      attachments,
      createdBy: req.user._id
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      message: 'Error creating assignment',
      error: error.message
    });
  }
};

// @desc    Get all assignments (with filters)
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const { class: className, subject, fromDate, toDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (className) filter.class = className.toUpperCase();
    if (subject) filter.subject = subject.toUpperCase();
    if (fromDate || toDate) {
      filter.dueDate = {};
      if (fromDate) filter.dueDate.$gte = new Date(fromDate);
      if (toDate) filter.dueDate.$lte = new Date(toDate);
    }

    // If user is a student, only show assignments for their class
    if (req.user.role === 'student') {
      filter.class = req.user.class;
    }

    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // If user is a student, verify they can access this assignment
    if (req.user.role === 'student' && assignment.class !== req.user.class) {
      return res.status(403).json({ message: 'Not authorized to access this assignment' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      message: 'Error fetching assignment',
      error: error.message
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Staff/Admin)
export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify ownership or admin status
    if (assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      message: 'Error updating assignment',
      error: error.message
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Staff/Admin)
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify ownership or admin status
    if (assignment.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      message: 'Error deleting assignment',
      error: error.message
    });
  }
};
