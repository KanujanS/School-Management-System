import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon, 
  TrashIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ClassDetails = () => {
  const { gradeId, division } = useParams();
  const navigate = useNavigate();
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'John Perera',
      admissionNumber: '2024001',
      gender: 'Male',
      dateOfBirth: '2010-05-15',
      address: '123 School Lane, Mahiyangana',
      parentName: 'David Perera',
      contactNumber: '+94 77 123 4567',
      email: 'john.perera@student.com'
    },
    // Add more mock data as needed
  ]);

  const [newStudent, setNewStudent] = useState({
    name: '',
    admissionNumber: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    parentName: '',
    contactNumber: '',
    email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newStudentData = {
      id: students.length + 1,
      ...newStudent
    };
    setStudents(prev => [...prev, newStudentData]);
    handleCloseModal();
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      setStudents(students.filter(student => student.id !== studentId));
    }
  };

  const handleCloseModal = () => {
    setShowAddStudentModal(false);
    setNewStudent({
      name: '',
      admissionNumber: '',
      gender: 'Male',
      dateOfBirth: '',
      address: '',
      parentName: '',
      contactNumber: '',
      email: ''
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center text-red-900 hover:text-red-800 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Grade {gradeId} - Division {division}
            </h1>
            <p className="mt-2 text-gray-600">
              Total Students: {students.length}
            </p>
          </div>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {student.gender} | {new Date(student.dateOfBirth).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.admissionNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.parentName}</div>
                    <div className="text-sm text-gray-500">{student.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.contactNumber}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-red-900 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-red-100 to-gray-100 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Student</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Admission Number</label>
                <input
                  type="text"
                  name="admissionNumber"
                  value={newStudent.admissionNumber}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={newStudent.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={newStudent.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  name="address"
                  value={newStudent.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Parent/Guardian Name</label>
                <input
                  type="text"
                  name="parentName"
                  value={newStudent.parentName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={newStudent.contactNumber}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetails; 