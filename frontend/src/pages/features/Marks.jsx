import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { marksAPI } from '../../services/api';
import {
  AcademicCapIcon,
  PencilSquareIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import AddMarks from '../../components/AddMarks';
import toast from 'react-hot-toast';

const Marks = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);

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

  // Terms
  const terms = ['Term 1', 'Term 2', 'Term 3'];

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Only fetch if we have a valid user
        if (!user || !user._id) {
          console.log('Debug - No valid user available, skipping fetch');
          return;
        }

        // Build filters object, ensuring we don't include 'all' values
        const filters = {};
        
        if (selectedClass && selectedClass !== 'all') {
          filters.class = selectedClass;
        }
        
        if (selectedTerm && selectedTerm !== 'all') {
          filters.examType = selectedTerm;
        }

        // If user is a student, add their ID to the filters
        if (user.role === 'student') {
          filters.student = user._id;
        }

        console.log('Debug - Fetch marks attempt:', {
          userId: user._id,
          userRole: user.role,
          filters,
          selectedClass,
          selectedTerm
        });

        const data = await marksAPI.getAll(filters);

        if (!Array.isArray(data)) {
          console.error('Invalid marks data format:', data);
          throw new Error('Invalid data format received from server');
        }

        console.log('Debug - Received raw data:', {
          count: data.length,
          sample: data[0]
        });

        // Group marks by student
        const studentMap = new Map();
        let skippedMarks = [];

        data.forEach(mark => {
          if (!mark.student || !mark.student._id) {
            console.warn('Invalid mark data:', mark);
            skippedMarks.push(mark);
            return;
          }
          
          const student = mark.student;
          if (!studentMap.has(student._id)) {
            studentMap.set(student._id, {
              _id: student._id,
              name: student.name || 'Unknown Student',
              admissionNumber: student.admissionNumber || 'N/A',
              class: mark.class || 'Unknown Class',
              marks: []
            });
          }
          studentMap.get(student._id).marks.push({
            ...mark,
            subject: mark.subject || 'Unknown Subject',
            score: mark.score || 0,
            totalMarks: mark.totalMarks || 100,
            grade: mark.grade || 'F',
            examType: mark.examType || 'Unknown Term'
          });
        });

        const studentArray = Array.from(studentMap.values());
        console.log('Debug - Processing results:', {
          totalMarks: data.length,
          validStudents: studentArray.length,
          skippedMarks: skippedMarks.length,
          filters
        });

        if (skippedMarks.length > 0) {
          toast.warning(`${skippedMarks.length} marks were skipped due to missing student data.`);
        }

        setStudents(studentArray);
        setMarks(data.filter(mark => mark.student && mark.student._id));
      } catch (error) {
        console.error('Error fetching marks:', {
          error,
          message: error.message,
          stack: error.stack
        });
        setError(error.message || 'Failed to load marks data');
        toast.error(error.message || 'Failed to load marks data');
        setStudents([]);
        setMarks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarks();
  }, [user, selectedClass, selectedTerm]);

  const handleAddMark = async (newMark) => {
    try {
      const response = await marksAPI.create(newMark);
      
      // Refresh the marks list after adding new marks
      const data = await marksAPI.getAll({
        class: selectedClass !== 'all' ? selectedClass : undefined,
        examType: selectedTerm !== 'all' ? selectedTerm : undefined
      });

      // Ensure data is an array
      const marksArray = Array.isArray(data) ? data : [];
      
      // Group marks by student
      const studentMap = new Map();
      let skippedMarks = [];

      marksArray.forEach(mark => {
        if (!mark.student || !mark.student._id) {
          console.warn('Invalid mark data:', mark);
          skippedMarks.push(mark);
          return; // Skip invalid marks
        }
        
        const student = mark.student;
        if (!studentMap.has(student._id)) {
          studentMap.set(student._id, {
            _id: student._id,
            name: student.name || 'Unknown Student',
            admissionNumber: student.admissionNumber || 'N/A',
            class: mark.class || 'Unknown Class',
            marks: []
          });
        }
        studentMap.get(student._id).marks.push({
          ...mark,
          subject: mark.subject || 'Unknown Subject',
          score: mark.score || 0,
          totalMarks: mark.totalMarks || 100,
          grade: mark.grade || 'F',
          examType: mark.examType || 'Unknown Term'
        });
      });

      const studentArray = Array.from(studentMap.values());
      console.log('Processed students data:', studentArray);
      console.log('Skipped marks due to missing student data:', skippedMarks);

      if (skippedMarks.length > 0) {
        toast.warning(`${skippedMarks.length} marks were skipped due to missing student data. Please check with the administrator.`);
      }

      setStudents(studentArray);
      setMarks(marksArray.filter(mark => mark.student && mark.student._id));
      setShowAddModal(false);
      toast.success('Marks added successfully');
    } catch (error) {
      console.error('Error adding mark:', error);
      toast.error('Failed to add mark');
    }
  };

  const handleViewMarks = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'S': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Student Marks</h1>
        {(user.role === 'staff' || user.role === 'admin') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Marks
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
          >
            <option value="all">All Classes</option>
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
          >
            <option value="all">All Terms</option>
            {terms.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.admissionNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewMarks(student)}
                    className="text-red-900 hover:text-red-800"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Marks Modal */}
      {showAddModal && (
        <AddMarks
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMark}
        />
      )}

      {/* View Marks Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Marks Details - {selectedStudent.name}
              </h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Admission Number</p>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="text-sm font-medium text-gray-900">{selectedStudent.class}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Marks by Subject</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedStudent.marks
                    .filter(mark => selectedTerm === 'all' || mark.examType === selectedTerm)
                    .map((mark) => (
                    <div key={mark._id} className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900">{mark.subject}</h5>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Score:</span>
                          <span className="text-sm font-medium text-gray-900">{mark.score}/{mark.totalMarks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Grade:</span>
                          <span className={`text-sm font-medium ${getGradeColor(mark.grade)}`}>{mark.grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Term:</span>
                          <span className="text-sm text-gray-900">{mark.examType}</span>
                        </div>
                        {mark.remarks && (
                          <div className="mt-2 text-sm text-gray-500">
                            {mark.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marks; 