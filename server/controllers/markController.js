import Mark from '../models/Mark.js';
import Student from '../models/Student.js';

// Get all marks for staff and admin users
export const getAllMarks = async (req, res, next) => {
    try {
        const marks = await Mark.find().populate('addedBy', 'name');
        
        res.status(200).json({
            success: true,
            data: marks
        });
    } catch (error) {
        next(error);
    }
};

// Get all classes for mark entry
export const getClasses = async (req, res, next) => {
    try {
        const classes = await Student.distinct('class');
        
        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error) {
        next(error);
    }
};

// Get students by class
export const getStudentsByClass = async (req, res, next) => {
    try {
        const { classId } = req.params;
        
        let query = {};
        if (classId !== 'all') {
            query = { class: classId };
        }
        
        const students = await Student.find(query)
            .select('name admissionNumber')
            .sort('admissionNumber');
        
        if (!students || students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No students found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        next(error);
    }
};

// Add marks for a student
export const addMarks = async (req, res) => {
    try {
        const { studentName, indexNumber, class: className, term, subjects, academicYear } = req.body;

        // Validate required fields
        if (!studentName || !indexNumber || !className || !term || !subjects) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['studentName', 'indexNumber', 'class', 'term', 'subjects']
            });
        }

        // Validate term
        if (!['Term 1', 'Term 2', 'Term 3'].includes(term)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid term. Must be one of: Term 1, Term 2, Term 3'
            });
        }

        // Validate class format
        const classRegex = /^(Grade-\d{1,2}-[A-F]|A\/L-[a-z-]+)$/i;
        if (!classRegex.test(className)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid class format. Use Grade-6-A or A/L-stream format'
            });
        }

        // Validate subjects array
        if (!Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Subjects must be a non-empty array'
            });
        }

        // Validate each subject entry
        for (const subject of subjects) {
            if (!subject.subject || typeof subject.marks !== 'number' || subject.marks < 0 || subject.marks > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Each subject must have a name and marks between 0 and 100'
                });
            }
        }

        // Check if marks already exist for this student and term
        const existingMarks = await Mark.findOne({
            'student.name': studentName,
            'student.indexNumber': indexNumber,
            term,
            academicYear
        });

        if (existingMarks) {
            return res.status(400).json({
                success: false,
                message: 'Marks already exist for this student and term'
            });
        }

        // Create new mark entry
        const newMark = await Mark.create({
            student: {
                name: studentName,
                indexNumber: indexNumber
            },
            class: className,
            term,
            subjects,
            academicYear,
            addedBy: req.user._id
        });

        await newMark.populate('addedBy', 'name');

        res.status(201).json({
            success: true,
            data: newMark
        });
    } catch (error) {
        console.error('Error adding marks:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error adding marks'
        });
    }
};

// Get student marks
export const getStudentMarks = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        
        // If the user is a student, they can only access their own marks
        if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access these marks'
            });
        }

        // Find marks for the student
        const marks = await Mark.find({ 'student.indexNumber': studentId })
            .populate('addedBy', 'name')
            .sort('-createdAt');
        
        if (!marks || marks.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No marks found for this student'
            });
        }

        res.status(200).json({
            success: true,
            data: marks
        });
    } catch (error) {
        console.error('Error fetching student marks:', error);
        next(error);
    }
};

// Update marks
export const updateMarks = async (req, res) => {
    try {
        const { markId } = req.params;
        const { subjects } = req.body;

        // Validate subjects array
        if (!Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Subjects must be a non-empty array'
            });
        }

        // Validate each subject entry
        for (const subject of subjects) {
            if (!subject.subject || typeof subject.marks !== 'number' || subject.marks < 0 || subject.marks > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Each subject must have a name and marks between 0 and 100'
                });
            }
        }

        const mark = await Mark.findByIdAndUpdate(
            markId,
            { subjects },
            { new: true, runValidators: true }
        ).populate('addedBy', 'name');

        if (!mark) {
            return res.status(404).json({
                success: false,
                message: 'Mark not found'
            });
        }

        res.status(200).json({
            success: true,
            data: mark
        });
    } catch (error) {
        console.error('Error updating marks:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating marks'
        });
    }
};

// Delete marks
export const deleteMarks = async (req, res) => {
    try {
        const { markId } = req.params;

        const mark = await Mark.findByIdAndDelete(markId);

        if (!mark) {
            return res.status(404).json({
                success: false,
                message: 'Mark not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mark deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting marks:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting marks'
        });
    }
};
