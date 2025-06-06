import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockData';
import {
  DocumentPlusIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import ImageSlider from '../../components/ImageSlider';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingGrading: 0,
    totalStudents: 0,
    attendanceToday: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data - In a real app, these would be API calls
        const assignmentsData = [
          {
            id: 1,
            title: 'Mathematics Assignment 1',
            subject: 'Mathematics',
            dueDate: '2024-04-15',
            status: 'active',
            submissions: 15,
          },
          {
            id: 2,
            title: 'Science Project',
            subject: 'Science',
            dueDate: '2024-04-20',
            status: 'active',
            submissions: 12,
          },
        ];

        const studentsData = [
          { id: 1, name: 'John Doe', attendance: 'present' },
          { id: 2, name: 'Jane Smith', attendance: 'absent' },
          { id: 3, name: 'Mike Johnson', attendance: 'present' },
        ];

        setAssignments(assignmentsData);
        setStudents(studentsData);
        setStats({
          totalAssignments: assignmentsData.length,
          pendingGrading: assignmentsData.reduce(
            (acc, curr) => acc + curr.submissions,
            0
          ),
          totalStudents: studentsData.length,
          attendanceToday: studentsData.filter(
            (s) => s.attendance === 'present'
          ).length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // If user is not loaded yet, show loading state
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
    <div className="space-y-6">
      {/* Welcome Section with Image Slider */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ImageSlider />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your classes, assignments, and student progress
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button className="p-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200">
          <DocumentPlusIcon className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Create Assignment
          </h3>
          <p className="text-sm text-gray-500">Upload new assignments</p>
        </button>

        <button className="p-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200">
          <UserGroupIcon className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
          <p className="text-sm text-gray-500">Record student attendance</p>
        </button>

        <button className="p-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200">
          <ClipboardDocumentCheckIcon className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Enter Marks</h3>
          <p className="text-sm text-gray-500">Grade assignments and tests</p>
        </button>

        <button className="p-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200">
          <BellIcon className="h-8 w-8 text-yellow-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Send Notification
          </h3>
          <p className="text-sm text-gray-500">Communicate with students</p>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Total Assignments
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalAssignments}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900">Pending Grading</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pendingGrading}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalStudents}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Attendance
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.attendanceToday}/{stats.totalStudents}
          </p>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Assignments
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {assignment.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.submissions} submissions
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Today's Attendance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.attendance === 'present'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {student.attendance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 