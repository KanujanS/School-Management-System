import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    recentAssignments: [],
    recentMarks: [],
    recentAttendance: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel
        const [assignmentsRes, marksRes, attendanceRes] = await Promise.all([
          assignmentsAPI.getAll({ limit: 5, staffId: user._id }),
          marksAPI.getAll({ limit: 5, staffId: user._id }),
          attendanceAPI.getAll({ limit: 5, staffId: user._id })
        ]);

        setDashboardData({
          recentAssignments: assignmentsRes.assignments || [],
          recentMarks: marksRes.marks || [],
          recentAttendance: attendanceRes.attendance || []
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

      <Grid container spacing={3}>
        {/* Recent Assignments */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Assignments
              </Typography>
              {dashboardData.recentAssignments.length === 0 ? (
                <Typography color="textSecondary">No recent assignments</Typography>
              ) : (
                dashboardData.recentAssignments.map((assignment) => (
                  <Box key={assignment._id} mb={2}>
                    <Typography variant="subtitle1">{assignment.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {assignment.subject} - Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Marks */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Marks
              </Typography>
              {dashboardData.recentMarks.length === 0 ? (
                <Typography color="textSecondary">No recent marks</Typography>
              ) : (
                dashboardData.recentMarks.map((mark) => (
                  <Box key={mark._id} mb={2}>
                    <Typography variant="subtitle1">
                      {mark.student?.name || 'Unknown Student'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {mark.subject} - Score: {mark.score}/{mark.totalMarks}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Attendance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Attendance
              </Typography>
              {dashboardData.recentAttendance.length === 0 ? (
                <Typography color="textSecondary">No recent attendance records</Typography>
              ) : (
                dashboardData.recentAttendance.map((record) => (
                  <Box key={record._id} mb={2}>
                    <Typography variant="subtitle1">{record.class}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {record.subject} - {new Date(record.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Present: {record.students.filter(s => s.status === 'present').length}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
    </Box>
  );
};

export default StaffDashboard; 