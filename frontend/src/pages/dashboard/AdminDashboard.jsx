import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserPlusIcon, 
  TrashIcon,
  UserGroupIcon,
  AcademicCapIcon as StudentIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ImageSlider from '../../components/ImageSlider';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Teacher',
    subject: '',
  });
  const [staffMembers, setStaffMembers] = useState([
    { 
      id: 1, 
      name: 'John Smith', 
      role: 'Teacher', 
      subject: 'Mathematics',
      email: 'john.smith@school.com',
      phone: '+94 77 123 4567',
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Sarah Wilson', 
      role: 'Teacher', 
      subject: 'Science',
      email: 'sarah.wilson@school.com',
      phone: '+94 77 234 5678',
      status: 'active'
    },
    { 
      id: 3, 
      name: 'David Kumar', 
      role: 'Administrator', 
      subject: 'N/A',
      email: 'david.kumar@school.com',
      phone: '+94 77 345 6789',
      status: 'active'
    }
  ]);

  // Mock statistics data
  const [statistics, setStatistics] = useState({
    totalStudents: 1250,
    totalStaff: 85,
  });

  // Define class structure
  const ordinaryLevelClasses = Array.from({ length: 6 }, (_, i) => i + 6); // 6 to 11
  const divisions = ['A', 'B', 'C', 'D', 'E', 'F'];
  const advancedLevelStreams = [
    'Physical Science',
    'Biological Science',
    'Commerce',
    'Arts',
    'BioTechnology',
    'Engineering Technology'
  ];

  const streams = [
    { id: 'physical-science', name: 'Physical Science' },
    { id: 'biological-science', name: 'Biological Science' },
    { id: 'commerce', name: 'Commerce' },
    { id: 'arts', name: 'Arts' },
    { id: 'bio-technology', name: 'Bio Technology' },
    { id: 'engineering-technology', name: 'Engineering Technology' }
  ];

  const handleClassClick = (grade, division) => {
    navigate(`/admin/class/${grade}/${division}`);
  };

  const handleStreamClick = (streamId) => {
    navigate(`/admin/stream/${streamId}`);
  };

  const handleAddStaffClick = () => {
    setShowAddStaffModal(true);
  };

  const handleCloseModal = () => {
    setShowAddStaffModal(false);
    setNewStaffData({
      name: '',
      email: '',
      phone: '',
      role: 'Teacher',
      subject: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaffData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    const newStaff = {
      id: staffMembers.length + 1,
      ...newStaffData,
      status: 'active'
    };
    setStaffMembers(prev => [...prev, newStaff]);
    handleCloseModal();
  };

  const handleDeleteStaff = (staffId) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setStaffMembers(staffMembers.filter(staff => staff.id !== staffId));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header with Image Slider */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ImageSlider />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="mt-2 text-gray-600">Manage and view all classrooms</p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <StudentIcon className="h-8 w-8 text-red-900" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm font-medium uppercase">Total Students</p>
              <div className="flex items-baseline">
                <p className="text-3xl font-semibold text-gray-900">{statistics.totalStudents}</p>
                <p className="ml-2 text-sm text-gray-600">Students</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>School Capacity</span>
              <span>1500 Students</span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-900 h-2 rounded-full" 
                style={{ width: `${(statistics.totalStudents / 1500) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <UserGroupIcon className="h-8 w-8 text-red-900" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm font-medium uppercase">Total Staff</p>
              <div className="flex items-baseline">
                <p className="text-3xl font-semibold text-gray-900">{statistics.totalStaff}</p>
                <p className="ml-2 text-sm text-gray-600">Members</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-gray-500">Teaching Staff</p>
                <p className="text-2xl font-semibold text-gray-900">65</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-gray-500">Support Staff</p>
                <p className="text-2xl font-semibold text-gray-900">20</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Staff Management</h2>
            <p className="text-gray-600 mt-1">Total Staff Members: {staffMembers.length}</p>
          </div>
          <button 
            onClick={handleAddStaffClick}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Staff Member
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffMembers.map((staff) => (
                <tr key={staff.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-900 font-medium text-sm">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">{staff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{staff.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      staff.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="text-red-900 hover:text-red-800" 
                      title="Delete"
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

      {/* Ordinary Level Classes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Ordinary Level Classes</h2>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800">
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Manage Classes
          </button>
        </div>
        
        <div className="grid gap-6">
          {ordinaryLevelClasses.map(grade => (
            <div key={grade} className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Grade {grade}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {divisions.map(division => (
                  <button
                    key={`${grade}-${division}`}
                    onClick={() => handleClassClick(grade, division)}
                    className="p-4 border rounded-lg hover:bg-red-50 transition-colors duration-200 flex flex-col items-center justify-center space-y-2"
                  >
                    <span className="text-lg font-medium text-gray-900">Division {division}</span>
                    <span className="text-sm text-gray-500">Grade {grade}-{division}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Level Classes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Advanced Level Streams</h2>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800">
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Manage Streams
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <button
              key={stream.id}
              onClick={() => handleStreamClick(stream.id)}
              className="p-6 border rounded-lg hover:bg-red-50 transition-colors duration-200 text-left"
            >
              <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{stream.name}</h3>
                <p className="text-sm text-gray-500">Advanced Level</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">View Details</span>
                  <AcademicCapIcon className="h-5 w-5 text-red-900" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Class Details Panel - This will show when a class is selected */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Class Details: {selectedClass}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Students</h3>
              <p className="text-3xl font-bold text-red-900">45</p>
              <p className="text-sm text-gray-500">Total enrolled</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Subjects</h3>
              <p className="text-3xl font-bold text-red-900">8</p>
              <p className="text-sm text-gray-500">Active subjects</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance</h3>
              <p className="text-3xl font-bold text-red-900">92%</p>
              <p className="text-sm text-gray-500">Average attendance</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Staff Member</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={newStaffData.name}
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
                  value={newStaffData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={newStaffData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={newStaffData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={newStaffData.subject}
                  onChange={handleInputChange}
                  placeholder={newStaffData.role === 'Teacher' ? 'Required for teachers' : 'N/A for non-teaching staff'}
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
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 