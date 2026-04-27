import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon, 
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { FaUserGraduate } from 'react-icons/fa';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Helper function to generate a random password
const generatePassword = () => {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

const streamCodeMap = {
  'physical-science': 'PS',
  'biological-science': 'BS',
  'commerce': 'CO',
  'arts': 'AR',
  'bio-technology': 'BT',
  'engineering-technology': 'ET'
};

const ClassDetails = () => {
  const { gradeId, division, stream } = useParams();
  const navigate = useNavigate();
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Stream information mapping for A/L streams
  const streamInfo = {
    'physical-science': {
      name: 'Physical Science'
    },
    'biological-science': {
      name: 'Biological Science'
    },
    'commerce': {
      name: 'Commerce'
    },
    'arts': {
      name: 'Arts'
    },
    'bio-technology': {
      name: 'Bio Technology'
    },
    'engineering-technology': {
      name: 'Engineering Technology'
    }
  };

  // Get current stream info if it's an A/L stream
  const currentStream = stream ? (streamInfo[stream] || {
    name: 'Unknown Stream'
  }) : null;

  const getSuggestedAdmissionNumber = (studentsList = students) => {
    const yearCode = new Date().getFullYear().toString().slice(-2);

    const prefix = stream
      ? `${yearCode}AL${streamCodeMap[stream] || 'SCI'}`
      : `${yearCode}${String(gradeId || '').padStart(2, '0')}${String(division || '').toUpperCase()}`;

    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const serialPattern = new RegExp(`^${escapedPrefix}(\\d{2})$`, 'i');

    const nextSerial = (studentsList || []).reduce((max, student) => {
      const admission = String(student?.admissionNumber || '').trim();
      const match = admission.match(serialPattern);
      if (!match) return max;

      const serial = Number(match[1]);
      if (Number.isNaN(serial)) return max;
      return Math.max(max, serial);
    }, 0) + 1;

    return `${prefix}${String(nextSerial).padStart(2, '0')}`;
  };

  const getInitialStudentState = (admissionNumber = '') => ({
    name: '',
    admissionNumber,
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    parentName: '',
    contactNumber: '',
    email: '',
    password: generatePassword()
  });

  const [newStudent, setNewStudent] = useState(getInitialStudentState());

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (stream) {
          // For A/L streams
          response = await studentAPI.getStudentsByStream(stream);
        } else {
          // For O/L classes
          response = await studentAPI.getStudentsByClass(gradeId, division);
        }

        if (response.success) {
          setStudents(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch students');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setError(error.message);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [gradeId, division, stream]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      const requiredFields = ['name', 'admissionNumber', 'gender', 'dateOfBirth', 'address', 'parentName', 'contactNumber', 'email'];
      const missingFields = requiredFields.filter(field => !newStudent[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newStudent.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate contact number (10 digits)
      const contactRegex = /^\d{10}$/;
      if (!contactRegex.test(newStudent.contactNumber)) {
        throw new Error('Contact number must be exactly 10 digits');
      }

      // Create student data with all required fields
      const studentData = {
        name: newStudent.name.trim(),
        admissionNumber: newStudent.admissionNumber.trim(),
        gender: newStudent.gender,
        dateOfBirth: newStudent.dateOfBirth,
        address: newStudent.address.trim(),
        parentName: newStudent.parentName.trim(),
        contactNumber: newStudent.contactNumber.trim(),
        email: newStudent.email.trim().toLowerCase(),
        password: newStudent.password || generatePassword(),
        role: 'student'
      };

      // Add class-specific data
      if (stream) {
        // For A/L streams
        studentData.stream = stream;
        studentData.class = `A/L-${stream}`;
        studentData.isAdvancedLevel = true;
        studentData.grade = 'A/L';
      } else {
        // For O/L classes
        studentData.grade = Number(gradeId);
        studentData.division = division.toUpperCase();
        studentData.class = `Grade-${gradeId}-${division.toUpperCase()}`;
        studentData.isAdvancedLevel = false;
      }

      // Log the data being sent
      console.log('Debug - Student data being sent:', {
        ...studentData,
        password: '[REDACTED]'
      });

      const response = await studentAPI.create(studentData);
      
      if (response.success) {
        setStudents(prev => [...prev, response.data]);
        
        // Show success message
        toast.success(
          <div>
            Student added successfully!<br />
          </div>,
          { duration: 10000 }
        );
        
        handleCloseModal();
      } else {
        throw new Error(response.message || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error(error.message || 'Failed to add student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      try {
        const response = await studentAPI.deleteStudent(studentId);
        
        if (response.success) {
          setStudents(students.filter(student => student._id !== studentId));
          toast.success('Student removed successfully');
        } else {
          throw new Error(response.message || 'Failed to remove student');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error(error.message || 'Failed to remove student');
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddStudentModal(false);
    setNewStudent(getInitialStudentState());
  };

  const handleOpenAddStudentModal = () => {
    setNewStudent(getInitialStudentState(getSuggestedAdmissionNumber()));
    setShowAddStudentModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-800 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center text-red-900 hover:text-red-800 mb-4 cursor-pointer"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {stream ? currentStream.name : `Grade ${gradeId} - Division ${division}`}
            </h1>
            <p className="mt-2 text-gray-600">
              {stream ? 'Advanced Level Stream' : 'Ordinary Level Class'}
            </p>
          </div>
          <button
            onClick={handleOpenAddStudentModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800 cursor-pointer"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-red-900">{students.length}</p>
          </div>
          <FaUserGraduate className="text-3xl text-red-900" />
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
                  {stream ? 'Index Number' : 'Admission Number'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id}>
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
                    <div className="text-sm text-gray-500">{student.contactNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Edit Student"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id)}
                        className="text-red-900 hover:text-red-800 cursor-pointer"
                        title="Delete Student"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50  bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Student</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
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
                <label className="block text-sm font-medium text-gray-700">
                  {stream ? 'Index Number' : 'Admission Number'}
                </label>
                <input
                  type="text"
                  name="admissionNumber"
                  value={newStudent.admissionNumber}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: {stream ? 'YYALSTREAMXX (e.g., 23ALSCI05)' : 'YYGCLXX (e.g., 2408A12)'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={newStudent.gender}
                  onChange={handleInputChange}
                  required
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
                <input
                  type="text"
                  name="address"
                  value={newStudent.address}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Parent's Name</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="password"
                    value={newStudent.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setNewStudent(prev => ({
                      ...prev,
                      password: generatePassword()
                    }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-red-900 hover:text-red-800"
                  >
                    Generate New
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters. Click "Generate New" for a random password.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-900 rounded-md hover:bg-red-800 cursor-pointer"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50  bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Student</h3>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <EditStudentForm
              student={selectedStudent}
              onCancel={() => setSelectedStudent(null)}
              onSaved={(updated) => {
                // Replace in list
                setStudents((prev) => prev.map(s => s._id === updated._id ? updated : s));
                setSelectedStudent(null);
                toast.success('Student updated successfully');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const EditStudentForm = ({ student, onCancel, onSaved }) => {
  const [form, setForm] = useState({
    name: student.name || '',
    admissionNumber: student.admissionNumber || '',
    gender: student.gender || 'Male',
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0,10) : '',
    address: student.address || '',
    parentName: student.parentName || '',
    contactNumber: student.contactNumber || '',
    email: student.email || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!form.name || !form.admissionNumber || !form.contactNumber || !form.parentName || !form.email) {
        throw new Error('Please fill required fields');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        throw new Error('Please enter a valid email address');
      }

      const resp = await studentAPI.updateStudent(student._id, form);
      if (resp.success) {
        onSaved(resp.data);
      } else {
        throw new Error(resp.message || 'Failed to update');
      }
    } catch (err) {
      console.error('Error updating student:', err);
      toast.error(err.message || 'Failed to update student');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Admission Number</label>
        <input name="admissionNumber" value={form.admissionNumber} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Parent Name</label>
        <input name="parentName" value={form.parentName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
        <input name="contactNumber" value={form.contactNumber} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-900 rounded-md hover:bg-red-800 cursor-pointer">Update</button>
      </div>
    </form>
  );
};

export default ClassDetails; 