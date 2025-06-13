import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Dialog, 
  IconButton, 
  Chip,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import { attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AddAttendance from '../../components/AddAttendance';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [user]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      // If user is a student, fetch only their attendance
      const params = user?.role === 'student' ? { studentId: user._id } : {};
      const response = await attendanceAPI.getAll(params);
      if (response.success) {
        setAttendanceRecords(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch attendance records');
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast.error('Failed to load attendance records');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchAttendanceRecords();
    setShowAddModal(false);
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      
      // Check if we have a selected record
      if (!selectedRecord || !selectedRecord._id) {
        throw new Error('No attendance record selected');
      }

      // Check if user is authenticated
      if (!user || !user._id) {
        throw new Error('You must be logged in to delete attendance records');
      }

      const response = await attendanceAPI.delete(selectedRecord._id);
      
      if (response.success) {
        // Remove the deleted record from the state
        setAttendanceRecords(prev => prev.filter(record => record._id !== selectedRecord._id));
        toast.success('Attendance record deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete attendance record');
      }
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      // Show more specific error messages
      let errorMessage = 'Failed to delete attendance record';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedRecord(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleViewClick = (record) => {
    console.log('Debug - Viewing attendance record:', record);
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const handleViewClose = () => {
    setViewDialogOpen(false);
    setSelectedRecord(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      default:
        return 'error'; // Default to error (red) for absent/unknown status
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Attendance Records</Typography>
        {/* Only show Record Attendance button for staff and admin */}
        {(user?.role === 'staff' || user?.role === 'admin') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddModal(true)}
            sx={{
              backgroundColor: '#7f1d1d',
              '&:hover': {
                backgroundColor: '#991b1b',
              },
            }}
          >
            Record Attendance
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>Loading attendance records...</Typography>
        </Box>
      ) : attendanceRecords.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No attendance records found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                {user?.role !== 'student' && <TableCell>Class</TableCell>}
                {user?.role === 'student' ? (
                  <TableCell align="center">Status</TableCell>
                ) : (
                  <>
                    <TableCell>Present</TableCell>
                    <TableCell>Absent</TableCell>
                  </>
                )}
                {user?.role !== 'student' && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceRecords.map((record) => {
                // For students, find their own attendance status
                const studentStatus = user?.role === 'student' 
                  ? record.students.find(s => s.student._id === user._id)?.status || 'absent'
                  : null;

                // For staff/admin, calculate present and absent counts
                const presentCount = record.students.filter(s => s.status === 'present').length;
                const absentCount = record.students.filter(s => s.status === 'absent').length;

                return (
                  <TableRow key={record._id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    {user?.role !== 'student' && <TableCell>{record.class}</TableCell>}
                    {user?.role === 'student' ? (
                      <TableCell align="center">
                        <Chip
                          label={studentStatus.charAt(0).toUpperCase() + studentStatus.slice(1)}
                          color={getStatusColor(studentStatus)}
                          size="small"
                        />
                      </TableCell>
                    ) : (
                      <>
                        <TableCell>
                          <Chip
                            label={presentCount}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={absentCount}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                      </>
                    )}
                    {user?.role !== 'student' && (
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewClick(record)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteClick(record)}
                            disabled={deleting && selectedRecord?._id === record._id}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleViewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Attendance Details - {selectedRecord?.class}
            </Typography>
            <IconButton onClick={handleViewClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle1" color="textSecondary">
              Date: {selectedRecord && new Date(selectedRecord.date).toLocaleDateString()}
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Admission Number</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedRecord?.students.map((student) => {
                  console.log('Debug - Student data:', student);
                  return (
                    <TableRow key={student._id || student.student?._id}>
  <TableCell>{student.name || student.student?.name}</TableCell>
  <TableCell>{student.admissionNumber || student.student?.admissionNumber}</TableCell>
  <TableCell align="center">
    <Chip
      label={(student.status || student?.status)?.charAt(0).toUpperCase() + (student.status || student?.status)?.slice(1)}
      color={getStatusColor(student.status)}
      size="small"
    />
  </TableCell>
</TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Attendance Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this attendance record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Attendance Modal */}
      {showAddModal && (
        <AddAttendance
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </Box>
  );
};

export default Attendance; 