import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assignmentsAPI, marksAPI } from '../../services/api';
import ImageSlider from '../../components/ImageSlider';
import {
  AcademicCapIcon,
  UserCircleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch assignments and marks data
        const [assignmentsResponse, marksData] = await Promise.all([
          assignmentsAPI.getAll({ class: user.class }),
          marksAPI.getStudentMarks(user._id)
        ]);

        // Handle assignments response
        if (assignmentsResponse.success) {
          const sortedAssignments = (assignmentsResponse.data || [])
            .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
          setAssignments(sortedAssignments);
        } else {
          console.error('Error in assignments response:', assignmentsResponse.message);
          setAssignments([]);
        }

        // Handle marks data
        if (Array.isArray(marksData)) {
          setMarks(marksData);
        } else {
          console.error('Error in marks response:', marksData);
          setMarks([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setAssignments([]);
        setMarks([]);
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
    <div className="space-y-6 p-6">
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
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <UserCircleIcon className="h-6 w-6 mr-2 text-red-800" />
              Personal Information
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-medium">{user.studentId || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium">{user.class || 'Not assigned'}</p>
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
                key={assignment._id}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                <p className="text-sm text-gray-500">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Subject: {assignment.subject}
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
                key={mark._id}
                className="border-l-4 border-purple-500 pl-4 py-2"
              >
                <h3 className="font-medium text-gray-900">
                  {mark.subject} - {mark.assignmentTitle}
                </h3>
                <p className="text-sm text-gray-500">
                  Score: {mark.score}/{mark.totalMarks} (
                  {((mark.score / mark.totalMarks) * 100).toFixed(1)}%)
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
    </div>
  );
};

export default StudentDashboard; 