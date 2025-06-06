import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockData';
import ImageSlider from '../../components/ImageSlider';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [assignmentsData, attendanceData, marksData, notificationsData] = await Promise.all([
          mockApi.getAssignments('student', user.id),
          mockApi.getAttendance(user.id),
          mockApi.getMarks(user.id),
          mockApi.getNotifications('student'),
        ]);

        setAssignments(assignmentsData);
        setAttendance(attendanceData);
        setMarks(marksData);
        setNotifications(notificationsData);
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
            Welcome back, {user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your academic progress
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Assignments
          </h2>
          <div className="space-y-4">
            {assignments.slice(0, 3).map((assignment) => (
              <div
                key={assignment.id}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                <p className="text-sm text-gray-500">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Attendance Overview
          </h2>
          <div className="space-y-4">
            {attendance.slice(0, 3).map((record) => (
              <div
                key={record.id}
                className={`border-l-4 pl-4 py-2 ${
                  record.status === 'present'
                    ? 'border-green-500'
                    : 'border-red-500'
                }`}
              >
                <h3 className="font-medium text-gray-900">{record.subject}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(record.date).toLocaleDateString()} -{' '}
                  <span
                    className={
                      record.status === 'present'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Marks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Marks
          </h2>
          <div className="space-y-4">
            {marks.slice(0, 3).map((mark) => (
              <div
                key={mark.id}
                className="border-l-4 border-purple-500 pl-4 py-2"
              >
                <h3 className="font-medium text-gray-900">
                  {mark.subject} - {mark.assignment}
                </h3>
                <p className="text-sm text-gray-500">
                  Score: {mark.value}/{mark.totalMarks} (
                  {((mark.value / mark.totalMarks) * 100).toFixed(1)}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Notifications
        </h2>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start space-x-4 border-b border-gray-200 pb-4"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-500">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 