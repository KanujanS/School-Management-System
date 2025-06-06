import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AddAttendance = ({ onClose, onAdd, selectedDate }) => {
  const [formData, setFormData] = useState({
    class: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    students: []
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

  // Mock student data - in a real app, this would come from an API
  const mockStudents = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson' },
    // Add more mock students as needed
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
        student.id === studentId
          ? { ...student, status }
          : student
      )
    }));
  };

  const handleClassChange = (selectedClass) => {
    // In a real app, this would fetch students for the selected class
    setFormData(prev => ({
      ...prev,
      class: selectedClass,
      students: mockStudents.map(student => ({
        id: student.id,
        name: student.name,
        status: 'present' // Default status
      }))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure all students have a status
    const studentsWithStatus = formData.students.map(student => ({
      ...student,
      status: student.status || 'present' // Default to present if status is missing
    }));

    onAdd({
      ...formData,
      students: studentsWithStatus,
      date: formData.date
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-red-100/90 to-gray-100/90 backdrop-blur-sm"></div>
      
      <div className="relative w-full max-w-4xl p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
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
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <select
                name="class"
                value={formData.class}
                onChange={(e) => handleClassChange(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
              />
            </div>
          </div>

          {formData.students.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Students</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={student.status || 'present'}
                            onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
              Save Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAttendance; 