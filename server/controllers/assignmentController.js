import Assignment from '../models/Assignment.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'assignments');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a safe filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, uniqueSuffix + '-' + safeFileName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, XLS, and XLSX files are allowed.'));
    }
  }
}).array('attachments');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Staff
export const createAssignment = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      // Validate class name format
      const className = req.body.class.toLowerCase();
      const isValidClass = /^(grade-\d{1,2}-[a-f]|a\/l-[a-z-]+)$/.test(className);
      if (!isValidClass) {
        throw new Error('Invalid class name format. Use Grade-6-A or A/L-stream format');
      }

      // Process files
      const files = req.files || [];
      const attachments = files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/api/assignments/download/${file.filename}`,
        uploadedAt: new Date()
      }));

      console.log('Debug - Creating assignment:', {
        ...req.body,
        attachments: attachments.map(a => ({
          fileName: a.fileName,
          uploadedAt: a.uploadedAt
        }))
      });

      const assignmentData = {
        title: req.body.title,
        description: req.body.description,
        subject: req.body.subject,
        class: className,
        dueDate: new Date(req.body.dueDate),
        totalMarks: Number(req.body.totalMarks),
        attachments,
        createdBy: req.user._id
      };

      const assignment = await Assignment.create(assignmentData);
      await assignment.populate('createdBy', 'name');

      res.status(201).json({
        success: true,
        data: assignment
      });
    } catch (error) {
      // Delete uploaded files if assignment creation fails
      if (req.files) {
        req.files.forEach(file => {
          const filePath = path.join(__dirname, '..', 'uploads', 'assignments', file.filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }

      console.error('Error creating assignment:', {
        error: error.message,
        body: req.body,
        files: req.files?.map(f => f.originalname)
      });

      res.status(error.name === 'ValidationError' ? 400 : 500).json({
        success: false,
        message: error.message || 'Failed to create assignment'
      });
    }
  });
};

// @desc    Download assignment file
// @route   GET /api/assignments/download/:filename
// @access  Private
export const downloadAssignment = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'assignments', filename);

    console.log('Attempting to download file:', {
      filename,
      filePath,
      exists: fs.existsSync(filePath)
    });

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file stats and mime type
    const stats = fs.statSync(filePath);
    const fileName = filename.split('-').slice(2).join('-'); // Remove the unique prefix
    
    // Set headers for CORS and file download
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    
    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file',
          error: error.message
        });
      }
    });

    // Handle client disconnection
    req.on('close', () => {
      fileStream.destroy();
    });

    // Stream the file
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error in downloadAssignment:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message
      });
    }
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const { limit = 10, staffId, class: className } = req.query;
    
    // Build query
    const query = {};
    
    // If staffId is provided, filter by creator
    if (staffId) {
      query.createdBy = staffId;
    }

    // If class is provided, filter by class (case-insensitive)
    if (className) {
      query.class = className.toLowerCase();
    }

    console.log('Debug - Fetching assignments with query:', query);

    const assignments = await Assignment.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: assignments,
      message: `Successfully fetched ${assignments.length} assignments`
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment',
      error: error.message
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Staff
export const updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Allow admin to update any assignment, staff can only update their own
    const isAdmin = req.user.role === 'admin';
    const isCreator = assignment.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this assignment'
      });
    }

    // Convert dueDate string to Date object if it's being updated
    const updateData = {
      ...req.body,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : assignment.dueDate
    };

    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name');

    res.json({
      success: true,
      data: assignment,
      message: 'Assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating assignment:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      userRole: req.user?.role,
      assignmentId: req.params.id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Staff
export const deleteAssignment = async (req, res) => {
  try {
    console.log('Debug - Delete assignment request:', {
      assignmentId: req.params.id,
      userId: req.user._id,
      userRole: req.user.role
    });

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Allow admin to delete any assignment, staff can only delete their own
    const isAdmin = req.user.role === 'admin';
    const isStaff = req.user.role === 'staff';
    const isCreator = assignment.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isStaff && !isCreator) {
      console.log('Debug - Delete authorization failed:', {
        userRole: req.user.role,
        userId: req.user._id,
        creatorId: assignment.createdBy,
        isAdmin,
        isCreator
      });

      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this assignment'
      });
    }

    await assignment.deleteOne();

    console.log('Debug - Assignment deleted successfully:', {
      assignmentId: req.params.id,
      deletedBy: req.user._id,
      userRole: req.user.role
    });

    res.json({
      success: true,
      data: {},
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
      userRole: req.user?.role,
      assignmentId: req.params.id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
};
