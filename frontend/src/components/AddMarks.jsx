import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AddMarks = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    class: '',
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
      ['A', 'B', 'C', 'D', 'E', 'F'].map(division => `Grade ${grade}-${division}`)
    ),
    // A/L Classes with detailed streams
    'A/L Physical Science',
    'A/L Biological Science',
    'A/L Bio Technology',
    'A/L Engineering Technology',
    'A/L Commerce',
    'A/L Arts'
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
    } else if (selectedClass === 'A/L Physical Science') {
      newSubjects = subjects.alPhysicalScience;
    } else if (selectedClass === 'A/L Biological Science') {
      newSubjects = subjects.alBiologicalScience;
    } else if (selectedClass === 'A/L Bio Technology') {
      newSubjects = subjects.alBioTechnology;
    } else if (selectedClass === 'A/L Engineering Technology') {
      newSubjects = subjects.alEngineeringTechnology;
    } else if (selectedClass === 'A/L Commerce') {
      newSubjects = subjects.alCommerce;
    } else if (selectedClass === 'A/L Arts') {
      newSubjects = subjects.alArts;
    }

    setAvailableSubjects(newSubjects);
    
    // Initialize subject marks array with empty values
    setSubjectMarks(newSubjects.map(subject => ({
      subject,
      value: '',
      grade: '',
      totalMarks: '100'
    })));

    // Fetch students for the selected class
    const fetchStudents = async () => {
      if (!selectedClass) return;
      
      try {
        setLoading(true);
        console.log('Fetching students for class:', selectedClass); // Debug log
        const response = await userAPI.getStudentsByClass(selectedClass);
        
        // Log the response for debugging
        console.log('Students API response:', response);

        // Ensure we have a valid response
        if (!response) {
          throw new Error('Invalid response from server');
        }

        // Extract data from response
        const studentsData = response.data || [];

        // Ensure data is an array
        if (!Array.isArray(studentsData)) {
          console.error('Invalid students data:', studentsData);
          throw new Error('Invalid students data format');
        }

        // Validate each student object
        const validStudents = studentsData.filter(student => {
          if (!student || !student._id || !student.name || !student.admissionNumber) {
            console.warn('Invalid student data:', student);
            return false;
          }
          return true;
        });

        console.log('Processed students data:', validStudents); // Debug log

        setStudents(validStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error(error.message || 'Failed to fetch students');
        setStudents([]); // Reset students on error
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [formData.class]);

  // Filter students based on search term (now checks both name and ID)
  useEffect(() => {
    if (!searchTerm || !students.length) {
      setFilteredStudents([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filtered = students.filter(student => {
      const studentName = student?.name?.toLowerCase() || '';
      const studentId = student?.admissionNumber?.toLowerCase() || '';
      return studentName.includes(searchTermLower) || studentId.includes(searchTermLower);
    });
    setFilteredStudents(filtered);

    // Auto-fill if there's an exact match
    const exactMatch = students.find(student => {
      const studentName = student?.name?.toLowerCase() || '';
      const studentId = student?.admissionNumber?.toLowerCase() || '';
      return studentName === searchTermLower || studentId === searchTermLower;
    });

    if (exactMatch) {
      setFormData(prev => ({
        ...prev,
        studentName: exactMatch.name,
        studentId: exactMatch.admissionNumber
      }));
      setShowStudentDropdown(false);
    }

    // If there's only one match, auto-fill that
    if (filtered.length === 1) {
      setFormData(prev => ({
        ...prev,
        studentName: filtered[0].name,
        studentId: filtered[0].admissionNumber
      }));
      setShowStudentDropdown(false);
    }
  }, [searchTerm, students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'studentName' || name === 'studentId') {
      setSearchTerm(value);
      setShowStudentDropdown(true);
      
      // Find matching student
      const searchTermLower = value.toLowerCase().trim();
      const matchingStudent = students.find(student => {
        if (name === 'studentName') {
          return student.name.toLowerCase() === searchTermLower;
        } else {
          return student.admissionNumber.toLowerCase() === searchTermLower;
        }
      });

      // Update both fields if there's a match
      if (matchingStudent) {
        setFormData(prev => ({
          ...prev,
          studentName: matchingStudent.name,
          studentId: matchingStudent.admissionNumber
        }));
        setShowStudentDropdown(false);
      } else {
        // Update only the changed field if no match
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleStudentSelect = (student) => {
    if (!student) return;
    
    setFormData(prev => ({
      ...prev,
      studentName: student.name,
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
      // Filter out subjects with no marks
      const validMarks = subjectMarks.filter(mark => mark?.value);
      
      if (!validMarks.length) {
        toast.error('Please enter marks for at least one subject');
        return;
      }

      // Find the selected student from the students array
      const selectedStudent = students.find(
        student => student.name === formData.studentName && student.admissionNumber === formData.studentId
      );

      if (!selectedStudent) {
        toast.error('Please select a valid student from the dropdown');
        return;
      }

      // Validate student data
      if (!selectedStudent._id) {
        toast.error('Invalid student data: Missing ID');
        return;
      }

      // Validate class and term
      if (!formData.class) {
        toast.error('Please select a class');
        return;
      }

      if (!formData.term) {
        toast.error('Please select a term');
        return;
      }

      // Log the selected student for debugging
      console.log('Selected student:', selectedStudent);

      // Create an array of mark entries with proper validation
      const markEntries = validMarks.map(mark => {
        // Calculate grade based on score
        let grade = 'F';
        const score = Number(mark.value);
        if (score >= 75) grade = 'A';
        else if (score >= 65) grade = 'B';
        else if (score >= 55) grade = 'C';
        else if (score >= 35) grade = 'S';

        return {
          student: selectedStudent._id,
          subject: mark.subject,
          score: score,
          totalMarks: Number(mark.totalMarks || 100),
          examType: formData.term,
          class: formData.class,
          grade: grade,
          remarks: `${grade} grade in ${mark.subject}`
        };
      });

      console.log('Debug - Submitting marks:', {
        student: selectedStudent,
        marks: markEntries
      });

      // Send all marks in a single request
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
          <h3 className="text-lg font-semibold text-gray-900">Add Marks for All Subjects</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName || ''}
                  onChange={handleChange}
                  onFocus={() => setShowStudentDropdown(true)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                  placeholder="Type student name..."
                  disabled={!formData.class}
                />
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="text-sm font-medium text-gray-900">{student.name || ''}</div>
                        <div className="text-sm text-gray-500">ID: {student.admissionNumber || ''}</div>
                      </div>
                    ))}
                  </div>
                )}
                {formData.class && loading && (
                  <div className="mt-1 text-sm text-gray-500">Loading students...</div>
                )}
                {!formData.class && (
                  <div className="mt-1 text-sm text-gray-500">Please select a class first</div>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId || ''}
                  onChange={handleChange}
                  onFocus={() => setShowStudentDropdown(true)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                  placeholder="Type student ID..."
                  disabled={!formData.class}
                />
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="text-sm font-medium text-gray-900">{student.name || ''}</div>
                        <div className="text-sm text-gray-500">ID: {student.admissionNumber || ''}</div>
                      </div>
                    ))}
                  </div>
                )}
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
                      <option key={className} value={className}>{className}</option>
                    ))}
                </optgroup>
                <optgroup label="Advanced Level">
                  {allClasses
                    .filter(className => className.startsWith('A/L'))
                    .map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          {subjectMarks.length > 0 && (
            <div className="flex-1 overflow-hidden">
              <div className="p-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Enter Marks for Each Subject</h4>
                <div className="overflow-y-auto max-h-[calc(90vh-24rem)] pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectMarks.map((mark, index) => (
                      <div key={mark.subject} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">{mark.subject}</label>
                          <div className="mt-1 flex space-x-2">
                            <input
                              type="number"
                              value={mark.value}
                              onChange={(e) => handleSubjectMarkChange(index, e.target.value)}
                              min="0"
                              max="100"
                              placeholder="Enter marks"
                              className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                            />
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Grade: {mark.grade || '-'}
                            </span>
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
              Add All Marks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarks;
