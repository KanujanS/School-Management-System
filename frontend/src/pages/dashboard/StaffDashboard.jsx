import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assignmentsAPI, marksAPI, attendanceAPI } from '../../services/api';
import {
  DocumentPlusIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import ImageSlider from '../../components/ImageSlider';
import AddAssignment from '../../components/AddAssignment';
import AddMarks from '../../components/AddMarks';
import AddAttendance from '../../components/AddAttendance';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAddMarksModal, setShowAddMarksModal] = useState(false);
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentMarks, setRecentMarks] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [assignments, marks, attendance] = await Promise.all([
          assignmentsAPI.getAll({ limit: 5 }),
          marksAPI.getAll({ limit: 5 }),
          attendanceAPI.getAll({ limit: 5 })
        ]);

        setRecentAssignments(assignments);
        setRecentMarks(marks);
        setRecentAttendance(attendance);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleAddAssignment = async (newAssignment) => {
    try {
      const response = await assignmentsAPI.create(newAssignment);
      setRecentAssignments(prev => [response, ...prev.slice(0, 4)]);
      setShowAddAssignmentModal(false);
      toast.success('Assignment added successfully');
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast.error('Failed to add assignment');
    }
  };

  const handleAddMarks = async (newMark) => {
    try {
      const response = await marksAPI.create(newMark);
      setRecentMarks(prev => [response, ...prev.slice(0, 4)]);
      setShowAddMarksModal(false);
      toast.success('Marks added successfully');
    } catch (error) {
      console.error('Error adding marks:', error);
      toast.error('Failed to add marks');
    }
  };

  const handleAddAttendance = async (attendanceData) => {
    try {
      const response = await attendanceAPI.create(attendanceData);
      setRecentAttendance(prev => [response, ...prev.slice(0, 4)]);
      setShowAddAttendanceModal(false);
      toast.success('Attendance recorded successfully');
    } catch (error) {
      console.error('Error adding attendance:', error);
      toast.error('Failed to record attendance');
    }
  };

  // If user is not loaded yet or data is loading, show loading state
  if (isLoading || !user) {
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
          <p className="mt-2 text-gray-600">Manage your teaching activities</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setShowAddAssignmentModal(true)}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <DocumentPlusIcon className="h-8 w-8 text-red-900 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Add Assignment</h3>
          <p className="mt-2 text-sm text-gray-600">Create and assign new work</p>
        </button>

        <button
          onClick={() => setShowAddMarksModal(true)}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <AcademicCapIcon className="h-8 w-8 text-red-900 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Add Marks</h3>
          <p className="mt-2 text-sm text-gray-600">Record student marks</p>
        </button>

        <button
          onClick={() => setShowAddAttendanceModal(true)}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <UserGroupIcon className="h-8 w-8 text-red-900 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
          <p className="mt-2 text-sm text-gray-600">Record student attendance</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assignments</h3>
          <div className="space-y-4">
            {recentAssignments.map((assignment) => (
              <div key={assignment._id} className="border-b pb-2">
                <p className="font-medium text-gray-900">{assignment.title}</p>
                <p className="text-sm text-gray-600">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Marks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Marks</h3>
          <div className="space-y-4">
            {recentMarks.map((mark) => (
              <div key={mark._id} className="border-b pb-2">
                <p className="font-medium text-gray-900">{mark.studentName}</p>
                <p className="text-sm text-gray-600">
                  {mark.subject}: {mark.value}/{mark.totalMarks}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          <div className="space-y-4">
            {recentAttendance.map((record) => (
              <div key={record._id} className="border-b pb-2">
                <p className="font-medium text-gray-900">{record.class}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(record.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddAssignmentModal && (
        <AddAssignment
          onClose={() => setShowAddAssignmentModal(false)}
          onAdd={handleAddAssignment}
        />
      )}

      {showAddMarksModal && (
        <AddMarks
          onClose={() => setShowAddMarksModal(false)}
          onAdd={handleAddMarks}
        />
      )}

      {showAddAttendanceModal && (
        <AddAttendance
          onClose={() => setShowAddAttendanceModal(false)}
          onAdd={handleAddAttendance}
          selectedDate={new Date().toISOString().split('T')[0]}
        />
      )}
    </div>
  );
};

export default StaffDashboard; 