import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { assignmentsAPI, marksAPI, attendanceAPI, notificationAPI } from '../../services/api';
import {
  DocumentPlusIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import ImageSlider from '../../components/ImageSlider';
import AddAssignment from '../../components/AddAssignment';
import AddMarks from '../../components/AddMarks';
import AddAttendance from '../../components/AddAttendance';
import AddNotification from '../../components/AddNotification';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAddMarksModal, setShowAddMarksModal] = useState(false);
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [showAddNotificationModal, setShowAddNotificationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    recentAssignments: [],
    recentMarks: [],
    recentAttendance: [],
    recentNotifications: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel
        const [assignmentsRes, marksRes, attendanceRes, notificationsRes] = await Promise.all([
          assignmentsAPI.getAll({ limit: 5, staffId: user._id }),
          marksAPI.getAll({ limit: 5, staffId: user._id }),
          attendanceAPI.getAll({ limit: 5, staffId: user._id }),
          notificationAPI.getAll()
        ]);

        setDashboardData({
          recentAssignments: assignmentsRes.assignments || [],
          recentMarks: marksRes.marks || [],
          recentAttendance: attendanceRes.attendance || [],
          recentNotifications: Array.isArray(notificationsRes) ? notificationsRes : []
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [user?._id]);

  const handleAddAssignment = async (newAssignment) => {
    try {
      const response = await assignmentsAPI.create(newAssignment);
      setDashboardData(prev => ({
        ...prev,
        recentAssignments: [response, ...prev.recentAssignments.slice(0, 4)]
      }));
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
      setDashboardData(prev => ({
        ...prev,
        recentMarks: [response, ...prev.recentMarks.slice(0, 4)]
      }));
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
      setDashboardData(prev => ({
        ...prev,
        recentAttendance: [response, ...prev.recentAttendance.slice(0, 4)]
      }));
      setShowAddAttendanceModal(false);
      toast.success('Attendance recorded successfully');
    } catch (error) {
      console.error('Error adding attendance:', error);
      toast.error('Failed to record attendance');
    }
  };

  const handleAddNotification = async (notificationData) => {
    try {
      const response = await notificationAPI.create({
        ...notificationData,
        userId: user._id,
        category: notificationData.type
      });
      
      if (response) {
        setDashboardData(prev => ({
          ...prev,
          recentNotifications: [response, ...prev.recentNotifications.slice(0, 4)]
        }));
        setShowAddNotificationModal(false);
        toast.success('Notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}
      </Typography>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
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

        <button
          onClick={() => setShowAddNotificationModal(true)}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <BellIcon className="h-8 w-8 text-red-900 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Send Notification</h3>
          <p className="mt-2 text-sm text-gray-600">Send announcements</p>
        </button>
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

      {showAddNotificationModal && (
        <AddNotification
          open={showAddNotificationModal}
          onClose={() => setShowAddNotificationModal(false)}
          onAdd={handleAddNotification}
        />
      )}
    </Box>
  );
};

export default StaffDashboard; 