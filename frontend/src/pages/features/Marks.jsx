import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockData';
import {
  AcademicCapIcon,
  PencilSquareIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import AddMarks from '../../components/AddMarks';

const Marks = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Predefined list of all classes (only used for staff/admin)
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
    alArts: [
      'Sinhala Literature',
      'English Literature',
      'History',
      'Geography',
      'Political Science',
      'Logic and Scientific Method',
      'Economics',
      'Buddhism',
      'Christianity',
      'Aesthetic Studies - Art',
      'Aesthetic Studies - Music',
      'Aesthetic Studies - Dance',
      'Aesthetic Studies - Drama',
      'Media Studies',
      'Information Technology'
    ],
    alCommerce: [
      'Business Studies',
      'Accounting',
      'Economics',
      'Information Technology',
      'Entrepreneurship Studies'
    ],
    alScience: [
      'Physics',
      'Chemistry',
      'Biology',
      'Combined Mathematics',
      'Agriculture',
      'Information Technology'
    ],
    alTechnology: [
      'Science for Technology',
      'Engineering Technology',
      'Bio-systems Technology',
      'Information and Communication Technology'
    ]
  };

  // Terms
  const terms = ['Term 1', 'Term 2', 'Term 3'];

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const data = await mockApi.getMarks(user.role, user.id);
        // Filter marks for student users
        const filteredData = user.role === 'student'
          ? data.filter(mark => mark.studentId === user.id)
          : data;
        setMarks(filteredData);
      } catch (error) {
        console.error('Error fetching marks:', error);
      }
    };

    fetchMarks();
  }, [user.role, user.id]);

  const handleEditMark = (mark) => {
    setEditingMark(mark);
    setIsEditing(true);
  };

  const handleSaveMark = async (markId, newValue) => {
    try {
      // In a real app, this would make an API call to update the mark
      const updatedMarks = marks.map((mark) =>
        mark.id === markId ? { ...mark, value: newValue } : mark
      );
      setMarks(updatedMarks);
      setIsEditing(false);
      setEditingMark(null);
    } catch (error) {
      console.error('Error updating mark:', error);
    }
  };

  const handleAddMark = (newMark) => {
    setMarks(prevMarks => [...prevMarks, newMark]);
  };

  // Filter marks based on selections
  const filteredMarks = marks.filter(mark => {
    const classMatch = user.role === 'student' ? true : (selectedClass === 'all' || mark.class === selectedClass);
    const subjectMatch = selectedSubject === 'all' || mark.subject === selectedSubject;
    const termMatch = selectedTerm === 'all' || mark.term === selectedTerm;
    return classMatch && subjectMatch && termMatch;
  });

  const getGradeColor = (value) => {
    if (value >= 75) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Marks</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user.role === 'staff' || user.role === 'admin' ? 'Manage and view student marks' : 'View your marks'}
            </p>
          </div>
          <div>
            {(user.role === 'staff' || user.role === 'admin') && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Mark
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className={`grid grid-cols-1 ${user.role === 'student' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
          {/* Class Filter - Only for staff/admin */}
          {(user.role === 'staff' || user.role === 'admin') && (
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
          )}

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            >
              <option value="all">All Subjects</option>
              <optgroup label="Ordinary Level Subjects">
                {subjects.ordinaryLevel.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </optgroup>
              <optgroup label="A/L Arts Stream">
                {subjects.alArts.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </optgroup>
              <optgroup label="A/L Commerce Stream">
                {subjects.alCommerce.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </optgroup>
              <optgroup label="A/L Science Stream">
                {subjects.alScience.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </optgroup>
              <optgroup label="A/L Technology Stream">
                {subjects.alTechnology.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Term Filter */}
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
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {(user.role === 'staff' || user.role === 'admin') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                {(user.role === 'staff' || user.role === 'admin') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Term
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMarks.map((mark) => (
                <tr key={mark.id}>
                  {(user.role === 'staff' || user.role === 'admin') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mark.studentName}</div>
                      <div className="text-sm text-gray-500">ID: {mark.studentId}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.subject}
                  </td>
                  {(user.role === 'staff' || user.role === 'admin') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mark.class}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.term}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.value}/{mark.totalMarks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(mark.value)}`}>
                      {mark.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredMarks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No marks found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {user.role === 'student' 
              ? 'No marks available for the selected filters'
              : 'Try adjusting your filters to see more results'}
          </p>
        </div>
      )}

      {/* Add Marks Modal */}
      {showAddModal && (
        <AddMarks
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMark}
        />
      )}
    </div>
  );
};

export default Marks; 