import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AddMarks = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    class: '',
    subject: '',
    term: '',
    value: '',
    totalMarks: '100',
    grade: ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      const newState = {
        ...prevState,
        [name]: value
      };

      // Automatically calculate grade when marks value changes
      if (name === 'value') {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
          newState.grade = calculateGrade(numValue);
        }
      }

      return newState;
    });
  };

  const calculateGrade = (marks) => {
    if (marks >= 75) return 'A';
    if (marks >= 65) return 'B';
    if (marks >= 55) return 'C';
    if (marks >= 35) return 'S';
    return 'F';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMark = {
      id: Date.now(),
      ...formData,
      date: new Date().toISOString().split('T')[0]
    };
    onAdd(newMark);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-red-100/90 to-gray-100/90 backdrop-blur-sm"></div>
      
      <div className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Mark</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
              />
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            >
              <option value="">Select Subject</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Marks</label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
              Add Mark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarks;
