import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI } from '../../services/api';
import { PlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import AddAttendance from '../../components/AddAttendance';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch student's personal data if user is a student
        if (user?.role === 'student') {
          const studentDetails = await attendanceAPI.getStudentDetails(user._id);
          setStudentData(studentDetails);
        }

        // Fetch attendance data
        const data = await attendanceAPI.getAll({
          userId: user?._id,
          role: user?.role,
          date: selectedDate,
          class: selectedClass !== 'all' ? selectedClass : undefined
        });
        
        setAttendanceData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        toast.error('Failed to load attendance data');
        setAttendanceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, selectedDate, selectedClass]);

  // Calculate attendance summary for student
  const calculateAttendanceSummary = () => {
    if (!Array.isArray(attendanceData)) {
      return {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        presentPercentage: 0
      };
    }

    const totalDays = attendanceData.length;
    const presentDays = attendanceData.filter(record => record?.status === 'present').length;
    const absentDays = totalDays - presentDays;
    const presentPercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      presentPercentage
    };
  };

  // Handle adding new attendance record
  const handleAddAttendance = async (newAttendance) => {
    try {
      const response = await attendanceAPI.create(newAttendance);
      const newData = Array.isArray(response.data) ? response.data : [response.data];
      setAttendanceData(prevData => [...prevData, ...newData]);
      setShowAddModal(false);
      toast.success('Attendance records added successfully');
    } catch (error) {
      console.error('Error adding attendance:', error);
      toast.error('Failed to add attendance records');
    }
  };

  // Filter attendance based on selected date and class
  const filteredAttendance = Array.isArray(attendanceData) 
    ? attendanceData.filter(record => {
        if (!record) return false;
        const dateMatch = record.date === selectedDate;
        const classMatch = selectedClass === 'all' || record.class === selectedClass;
        return dateMatch && classMatch;
      })
    : [];

  // If loading or user not loaded yet, show loading state
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  // If there's an error, show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-800 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">Error loading attendance records: {error}</p>
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

  const attendanceSummary = calculateAttendanceSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
            {user?.role === 'student' ? (
              <p className="mt-1 text-sm text-gray-500">
                View your attendance records for {studentData?.class || 'your class'}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                View and manage student attendance
              </p>
            )}
          </div>
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Mark Attendance
            </button>
          )}
        </div>
      </div>

      {/* Student Attendance Summary */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Present Days</h3>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold text-green-600">{attendanceSummary.presentDays}</p>
              <p className="text-sm text-gray-500">
                {attendanceSummary.presentPercentage}% Attendance Rate
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2">
              <XCircleIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Absent Days</h3>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold text-red-600">{attendanceSummary.absentDays}</p>
              <p className="text-sm text-gray-500">
                Out of {attendanceSummary.totalDays} total days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            />
          </div>

          {/* Class Filter - Only for staff/admin */}
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Class</label>
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
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {user?.role !== 'student' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                )}
                {user?.role !== 'student' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record.id}>
                  {user?.role !== 'student' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.studentName}
                      </div>
                      <div className="text-sm text-gray-500">ID: {record.studentId}</div>
                    </td>
                  )}
                  {user?.role !== 'student' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.class}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'present'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAttendance.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No attendance records found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'student' 
              ? 'No attendance records found for the selected date'
              : 'Try selecting a different date or class'}
          </p>
        </div>
      )}

      {/* Add Attendance Modal */}
      {showAddModal && (
        <AddAttendance
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAttendance}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Attendance; 