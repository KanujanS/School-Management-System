import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockData';
import {
  DocumentPlusIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import ImageSlider from '../../components/ImageSlider';
import AddAssignment from '../../components/AddAssignment';
import AddMarks from '../../components/AddMarks';
import AddAttendance from '../../components/AddAttendance';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAddMarksModal, setShowAddMarksModal] = useState(false);
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentMarks, setRecentMarks] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);

  const handleAddAssignment = async (newAssignment) => {
    try {
      // In a real app, this would make an API call to add the assignment
      const notification = {
        id: Date.now(),
        title: 'New Assignment Posted',
        message: `${newAssignment.title} has been posted. Due date: ${new Date(newAssignment.dueDate).toLocaleDateString()}`,
        category: 'assignment',
        date: new Date().toISOString(),
        isRead: false,
      };
      
      // Add to recent assignments
      setRecentAssignments(prev => [
        { ...newAssignment, id: Date.now() },
        ...prev.slice(0, 4)
      ]);
      
      console.log('New Assignment Notification:', notification);
      setShowAddAssignmentModal(false);
    } catch (error) {
      console.error('Error adding assignment:', error);
    }
  };

  const handleAddMarks = async (newMark) => {
    try {
      // In a real app, this would make an API call to add the marks
      const notification = {
        id: Date.now(),
        title: 'Marks Updated',
        message: `${newMark.subject} marks have been updated for ${newMark.studentName}`,
        category: 'marks',
        date: new Date().toISOString(),
        isRead: false,
      };
      
      // Add to recent marks
      setRecentMarks(prev => [
        { ...newMark, id: Date.now() },
        ...prev.slice(0, 4)
      ]);
      
      console.log('New Marks Notification:', notification);
      setShowAddMarksModal(false);
    } catch (error) {
      console.error('Error adding marks:', error);
    }
  };

  const handleAddAttendance = async (attendanceData) => {
    try {
      // Add to recent attendance
      setRecentAttendance(prev => [
        { ...attendanceData, id: Date.now() },
        ...prev.slice(0, 4)
      ]);
      
      console.log('Attendance added:', attendanceData);
      setShowAddAttendanceModal(false);
    } catch (error) {
      console.error('Error adding attendance:', error);
    }
  };

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
    <div className="container mx-auto px-4 py-8 space-y-6">
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setShowAddAssignmentModal(true)}
          className="p-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center"
        >
          <DocumentPlusIcon className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Create Assignment
          </h3>
          <p className="text-sm text-gray-500">Upload new assignments</p>
        </button>

        <button
          onClick={() => setShowAddAttendanceModal(true)}
          className="p-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center"
        >
          <UserGroupIcon className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
          <p className="text-sm text-gray-500">Record student attendance</p>
        </button>

        <button
          onClick={() => setShowAddMarksModal(true)}
          className="p-6 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center"
        >
          <AcademicCapIcon className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Enter Marks</h3>
          <p className="text-sm text-gray-500">Grade assignments and tests</p>
        </button>
      </div>

      {/* Recent Activities Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assignments</h3>
          {recentAssignments.length > 0 ? (
            <div className="space-y-4">
              {recentAssignments.map(assignment => (
                <div key={assignment.id} className="border-b pb-4">
                  <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                  <p className="text-sm text-gray-500">Class: {assignment.class}</p>
                  <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent assignments</p>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          {recentAttendance.length > 0 ? (
            <div className="space-y-4">
              {recentAttendance.map(record => (
                <div key={record.id} className="border-b pb-4">
                  <h4 className="font-medium text-gray-900">{record.class}</h4>
                  <p className="text-sm text-gray-500">Date: {new Date(record.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">
                    Present: {record.students.filter(s => s.status === 'present').length} | 
                    Absent: {record.students.filter(s => s.status === 'absent').length}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent attendance records</p>
          )}
        </div>

        {/* Recent Marks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Marks</h3>
          {recentMarks.length > 0 ? (
            <div className="space-y-4">
              {recentMarks.map(mark => (
                <div key={mark.id} className="border-b pb-4">
                  <h4 className="font-medium text-gray-900">{mark.studentName}</h4>
                  <p className="text-sm text-gray-500">Subject: {mark.subject}</p>
                  <p className="text-sm text-gray-500">Marks: {mark.value}/{mark.totalMarks}</p>
                  <p className="text-sm text-gray-500">Grade: {mark.grade}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent marks</p>
          )}
        </div>
      </div>

      {/* Add Assignment Modal */}
      {showAddAssignmentModal && (
        <AddAssignment
          onClose={() => setShowAddAssignmentModal(false)}
          onAdd={handleAddAssignment}
        />
      )}

      {/* Add Marks Modal */}
      {showAddMarksModal && (
        <AddMarks
          onClose={() => setShowAddMarksModal(false)}
          onAdd={handleAddMarks}
        />
      )}

      {/* Add Attendance Modal */}
      {showAddAttendanceModal && (
        <AddAttendance
          onClose={() => setShowAddAttendanceModal(false)}
          onAdd={handleAddAttendance}
        />
      )}
    </div>
  );
};

export default StaffDashboard; 