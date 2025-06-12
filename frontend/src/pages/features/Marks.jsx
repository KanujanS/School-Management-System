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

        // Build filters object
        const filters = {
          class: selectedClass === 'all' ? undefined : selectedClass,
          term: selectedTerm === 'all' ? undefined : selectedTerm,
          student: user.role === 'student' ? user._id : undefined
        };

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
        
        // Group marks by student and term
        const studentMap = new Map();
        let skippedMarks = [];

        data.forEach(mark => {
          if (!mark.student || !mark.student._id) {
            console.warn('Invalid mark data:', mark);
            skippedMarks.push(mark);
            return;
          }

          const studentId = mark.student._id;
          const studentName = mark.student.name || 'Unknown Student';
          
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              id: studentId,
              name: studentName,
              marks: []
            });
          }

          studentMap.get(studentId).marks.push(mark);
        });

        if (skippedMarks.length > 0) {
          toast.warning(`${skippedMarks.length} marks were skipped due to missing student data.`);
        }

        // Convert Map to array and sort by student name
        const studentArray = Array.from(studentMap.values()).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        setStudents(studentArray);
        setMarks(data.filter(mark => mark.student && mark.student._id));

        // If user is a student, automatically set them as the selected student
        if (user.role === 'student') {
          const studentData = studentArray.find(s => s.id === user._id);
          if (studentData) {
            setSelectedStudent(studentData);
            setShowViewModal(true);
          }
        }
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

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    // Reset term when class changes
    setSelectedTerm('all');
  };

  const handleTermChange = (e) => {
    setSelectedTerm(e.target.value);
  };

  const handleAddMarks = async (data) => {
    try {
      const response = await marksAPI.create(data);
      
      if (response) {
        // Refresh the marks list
        const updatedMarks = await marksAPI.getAll({
          class: selectedClass !== 'all' ? selectedClass : undefined,
          examType: selectedTerm !== 'all' ? selectedTerm : undefined
        });

        // Process the updated marks data
        const studentMap = new Map();

        updatedMarks.forEach(mark => {
          if (!mark.student || !mark.student._id) {
            console.warn('Invalid mark data:', mark);
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
        setStudents(studentArray);
        setMarks(updatedMarks.filter(mark => mark.student && mark.student._id));
        setShowAddModal(false);
        toast.success('Marks added successfully');
      }
    } catch (error) {
      console.error('Error adding marks:', error);
      toast.error(error.message || 'Failed to add marks');
    }
  };

  const handleViewMarks = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleDeleteMarks = async (studentId) => {
    try {
      if (window.confirm('Are you sure you want to delete all marks for this student?')) {
        await marksAPI.deleteMarks(studentId);
        
        // Remove the deleted student's marks from the state
        setStudents(prevStudents => prevStudents.filter(student => student._id !== studentId));
        setMarks(prevMarks => prevMarks.filter(mark => mark.student._id !== studentId));
        
        toast.success('Marks deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting marks:', error);
      toast.error('Failed to delete marks');
    }
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

  // For students, directly show their marks without the list view
  if (user.role === 'student') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Marks</h1>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Term</label>
          <select
            value={selectedTerm}
            onChange={handleTermChange}
            className="mt-1 block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
          >
            <option value="all">All Terms</option>
            {terms.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>

        {selectedStudent ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="text-sm font-medium text-gray-900">{selectedStudent.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="text-sm font-medium text-gray-900">{user.class}</p>
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
              {selectedStudent.marks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No marks available</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No marks data available</p>
          </div>
        )}
      </div>
    );
  }

  // Staff/Admin view remains the same
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

      {user.role === 'admin' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Term
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.admissionNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.marks.length > 0 ? student.marks[0].examType : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleViewMarks(student)}
                      className="text-red-900 hover:text-red-800 inline-flex items-center"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMarks(student._id)}
                      className="text-red-900 hover:text-red-800 inline-flex items-center"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Staff view with class and term filters
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
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
                onChange={handleTermChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
              >
                <option value="all">All Terms</option>
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff marks table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id}>
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
        </>
      )}

      {/* Add Marks Modal */}
      {showAddModal && (
        <AddMarks
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMarks}
          selectedClass={selectedClass}
        />
      )}

      {/* View Marks Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {selectedStudent.name}'s Marks
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Admission Number: {selectedStudent.admissionNumber}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Class: {selectedStudent.class}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {selectedStudent.marks.map((mark) => (
                    <div key={mark._id} className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900">{mark.subject}</h5>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Score:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {mark.score}/{mark.totalMarks}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Grade:</span>
                          <span className={`text-sm font-medium ${getGradeColor(mark.grade)}`}>
                            {mark.grade}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Term:</span>
                          <span className="text-sm text-gray-900">{mark.examType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-900 text-base font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marks; 