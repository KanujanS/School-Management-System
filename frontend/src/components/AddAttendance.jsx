import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { studentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddAttendance = ({ onClose, onAdd, selectedDate }) => {
  const [formData, setFormData] = useState({
    class: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    students: []
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttendanceChange = (studentId, status) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map(student =>
        student._id === studentId
          ? { ...student, status }
          : student
      )
    }));
  };

  const handleClassChange = async (selectedClass) => {
    try {
      setIsLoading(true);
      const students = await studentsAPI.getByClass(selectedClass);
      setFormData(prev => ({
        ...prev,
        class: selectedClass,
        students: students.map(student => ({
          _id: student._id,
          name: student.name,
          status: 'present' // Default status
        }))
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students for the selected class');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Attendance</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Class
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={(e) => handleClassChange(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Class</option>
              {allClasses.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : formData.students.length > 0 ? (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Students
              </label>
              <div className="max-h-60 overflow-y-auto">
                {formData.students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <span>{student.name}</span>
                    <select
                      value={student.status}
                      onChange={(e) =>
                        handleAttendanceChange(student._id, e.target.value)
                      }
                      className="ml-2 border rounded py-1 px-2"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-900 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={!formData.class || formData.students.length === 0}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAttendance; 