import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddMarks = ({ onClose, onAdd, selectedClass }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    class: selectedClass || '',
    term: '',
  });

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Predefined list of all classes
  const allClasses = [
    // O/L Classes (Grade 6-11)
    ...[6, 7, 8, 9, 10, 11].flatMap(grade => 
      ['A', 'B', 'C', 'D', 'E', 'F'].map(division => `Grade-${grade}-${division}`)
    ),
    // A/L Classes with detailed streams
    'A/L-Physical-Science',
    'A/L-Biological-Science',
    'A/L-Bio-Technology',
    'A/L-Engineering-Technology',
    'A/L-Commerce',
    'A/L-Arts'
  ];

  // Predefined list of subjects by category
  const subjects = {
    ordinaryLevel: [
      'Sinhala',
      'English Language',
      'Mathematics',
      'Science',
      'History',
      'Buddhism',
      'Hinduism',
      'Islam',
      'Christianity',
      'Geography',
      'Civic Education',
      'Business and Accounting Studies',
      'Information and Communication Technology',
      'Agriculture and Food Technology',
      'Health and Physical Education',
      'Second Language Tamil',
      'Aesthetic Studies - Art',
      'Aesthetic Studies - Music',
      'Aesthetic Studies - Dance',
      'Aesthetic Studies - Drama'
    ],
    alPhysicalScience: [
      'Physics',
      'Chemistry',
      'Combined Mathematics',
      'Information Technology',
      'General English'
    ],
    alBiologicalScience: [
      'Biology',
      'Physics',
      'Chemistry',
      'Information Technology',
      'General English'
    ],
    alBioTechnology: [
      'Biology',
      'Science for Technology',
      'Engineering Technology',
      'Information Technology',
      'General English'
    ],
    alEngineeringTechnology: [
      'Engineering Technology',
      'Science for Technology',
      'Information Technology',
      'General English'
    ],
    alCommerce: [
      'Business Studies',
      'Accounting',
      'Economics',
      'Information Technology',
      'General English'
    ],
    alArts: [
      'Logic and Scientific Method',
      'Geography',
      'Political Science',
      'Economics',
      'History',
      'Information Technology',
      'General English'
    ]
  };

  // Terms
  const terms = ['Term 1', 'Term 2', 'Term 3'];

  useEffect(() => {
    // Update available subjects when class changes
    const selectedClass = formData.class;
    let newSubjects = [];
    
    if (selectedClass.startsWith('Grade')) {
      newSubjects = subjects.ordinaryLevel;
    } else if (selectedClass === 'A/L-Physical-Science') {
      newSubjects = subjects.alPhysicalScience;
    } else if (selectedClass === 'A/L-Biological-Science') {
      newSubjects = subjects.alBiologicalScience;
    } else if (selectedClass === 'A/L-Bio-Technology') {
      newSubjects = subjects.alBioTechnology;
    } else if (selectedClass === 'A/L-Engineering-Technology') {
      newSubjects = subjects.alEngineeringTechnology;
    } else if (selectedClass === 'A/L-Commerce') {
      newSubjects = subjects.alCommerce;
    } else if (selectedClass === 'A/L-Arts') {
      newSubjects = subjects.alArts;
    }

    setAvailableSubjects(newSubjects);
    
    // Initialize subject marks array with empty values
    setSubjectMarks(newSubjects.map(subject => ({
      subject,
      value: '',
      grade: '',
      totalMarks: '100',
      isElective: true // Mark all subjects as elective by default
    })));

    // Fetch students for the selected class
    const fetchStudents = async () => {
      if (!selectedClass) {
        setStudents([]);
        setFilteredStudents([]);
        return;
      }
      
      try {
        setLoading(true);
        const students = await userAPI.getStudentsByClass(selectedClass);
        
        if (!students || students.length === 0) {
          toast(`No students found in class ${selectedClass}`, {
            icon: '⚠️',
            duration: 4000
          });
        }

        setStudents(students);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error(error.message || 'Failed to fetch students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [formData.class]);

  // Enhanced student filtering
  useEffect(() => {
    if (!formData.class) {
      setStudents([]);
      setFilteredStudents([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const students = await userAPI.getStudentsByClass(formData.class);
        
        if (!students || students.length === 0) {
          toast(`No students found in class ${formData.class}`, {
            icon: '⚠️',
            duration: 4000
          });
        }

        setStudents(students);
        
        // If there's a search term, filter immediately
        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase().trim();
          const filtered = students.filter(student => {
            const studentName = student?.name?.toLowerCase() || '';
            const studentId = student?.admissionNumber?.toLowerCase() || '';
            return studentName.includes(searchTermLower) || studentId.includes(searchTermLower);
          });
          setFilteredStudents(filtered);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error(error.message || 'Failed to fetch students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [formData.class, searchTerm]);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'studentName' || name === 'studentId') {
      setSearchTerm(value);
      setShowStudentDropdown(true);
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStudentSelect = (student) => {
    if (!student) return;
    
    setFormData(prev => ({
      ...prev,
      studentName: `${student.name} (${student.admissionNumber})`,
      studentId: student.admissionNumber
    }));
    setSearchTerm('');
    setShowStudentDropdown(false);
  };

  const handleSubjectMarkChange = (index, value) => {
    setSubjectMarks(prevMarks => {
      const newMarks = [...prevMarks];
      newMarks[index] = {
        ...newMarks[index],
        value: value,
        grade: calculateGrade(value)
      };
      return newMarks;
    });
  };

  const calculateGrade = (marks) => {
    const numMarks = parseInt(marks);
    if (isNaN(numMarks)) return '';
    if (numMarks >= 75) return 'A';
    if (numMarks >= 65) return 'B';
    if (numMarks >= 55) return 'C';
    if (numMarks >= 35) return 'S';
    return 'F';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Filter out subjects with marks entered
      const validMarks = subjectMarks.filter(mark => mark?.value && mark.value.trim() !== '');
      
      if (validMarks.length === 0) {
        toast.error('Please enter marks for at least one subject');
        return;
      }

      if (!formData.studentName || !formData.studentId) {
        toast.error('Please enter both student name and admission number');
        return;
      }

      if (!formData.class || !formData.term) {
        toast.error('Please select both class and term');
        return;
      }

      // Create mark entries for subjects with values
      const markEntries = validMarks.map(mark => ({
        studentName: formData.studentName,
        admissionNumber: formData.studentId,
        subject: mark.subject,
        score: Number(mark.value),
        totalMarks: Number(mark.totalMarks || 100),
        examType: formData.term,
        class: formData.class,
        grade: calculateGrade(mark.value),
        remarks: `${calculateGrade(mark.value)} grade in ${mark.subject}`
      }));

      await onAdd({ marks: markEntries });
      toast.success('Marks added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding marks:', error);
      toast.error(error.message || 'Failed to add marks');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-red-100/90 to-gray-100/90 backdrop-blur-sm"></div>
      
      <div className={`relative w-full mx-4 bg-white rounded-lg shadow-xl flex flex-col ${subjectMarks.length > 0 ? 'max-w-5xl h-[90vh]' : 'max-w-3xl'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Student Marks</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                >
                  <option value="">Select Class</option>
                  <optgroup label="Ordinary Level">
                    {allClasses
                      .filter(className => className.startsWith('Grade'))
                      .map(className => (
                        <option key={className} value={className}>
                          {className.replace(/-/g, ' ')}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Advanced Level">
                    {allClasses
                      .filter(className => className.startsWith('A/L'))
                      .map(className => (
                        <option key={className} value={className}>
                          {className.replace(/-/g, ' ')}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Term</label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                >
                  <option value="">Select Term</option>
                  {terms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                  placeholder="Enter student name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Admission Number</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  placeholder="Enter admission number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>
            </div>

            {formData.studentId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Student Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">Name</label>
                    <div className="text-sm font-medium">{formData.studentName.split(' (')[0]}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Admission Number</label>
                    <div className="text-sm font-medium">{formData.studentId}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {subjectMarks.length > 0 && (
            <div className="flex-1 overflow-hidden">
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Enter Marks for Subjects</h4>
                  <div className="text-xs text-gray-500">* All subjects are optional</div>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-24rem)] pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectMarks.map((mark, index) => (
                      <div key={mark.subject} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {mark.subject}
                          </label>
                          <div className="mt-1 flex space-x-2">
                            <input
                              type="number"
                              value={mark.value}
                              onChange={(e) => handleSubjectMarkChange(index, e.target.value)}
                              min="0"
                              max="100"
                              placeholder="Optional"
                              className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                            />
                            {mark.value && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Grade: {mark.grade || '-'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800"
            >
              Add Marks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarks;
