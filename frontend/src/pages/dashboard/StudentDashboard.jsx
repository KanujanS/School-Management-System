import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockData';
import ImageSlider from '../../components/ImageSlider';
import {
  AcademicCapIcon,
  UserCircleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch student's personal data
        const studentDetails = await mockApi.getStudentDetails(user.id);
        setStudentData(studentDetails);

        // Fetch other dashboard data
        const [assignmentsData, marksData, notificationsData] = await Promise.all([
          mockApi.getAssignments('student', user.id),
          mockApi.getMarks(user.id),
          mockApi.getNotifications('student', user.id), // Only get notifications for this student
        ]);

        setAssignments(assignmentsData.filter(a => a.studentId === user.id));
        setMarks(marksData.filter(m => m.studentId === user.id));
        setNotifications(notificationsData.filter(n => n.studentId === user.id));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // If loading or user not loaded yet, show loading state
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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

      {/* Student Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <UserCircleIcon className="h-6 w-6 mr-2 text-red-800" />
              Personal Information
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-medium">{studentData?.studentId || user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium">{studentData?.class}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Grade</p>
                <p className="font-medium">{studentData?.grade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Section</p>
                <p className="font-medium">{studentData?.section}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpenIcon className="h-6 w-6 mr-2 text-blue-600" />
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
                <p className="text-sm text-gray-500">
                  Status: {assignment.submitted ? 
                    <span className="text-green-600">Submitted</span> : 
                    <span className="text-yellow-600">Pending</span>
                  }
                </p>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="text-gray-500 text-sm">No recent assignments</p>
            )}
          </div>
        </div>

        {/* Recent Marks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AcademicCapIcon className="h-6 w-6 mr-2 text-purple-600" />
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
                <p className="text-sm text-gray-500">
                  Grade: <span className="font-medium">{mark.grade}</span>
                </p>
              </div>
            ))}
            {marks.length === 0 && (
              <p className="text-gray-500 text-sm">No recent marks</p>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Notifications
        </h2>
        <div className="space-y-4">
          {notifications.slice(0, 5).map((notification) => (
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
          {notifications.length === 0 && (
            <p className="text-gray-500 text-sm">No new notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 