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
import { Add as AddIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
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
      toast.error(error.message || 'Failed to delete attendance record');
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

      {/* Add Attendance Modal */}
      {showAddModal && (
        <Dialog
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          maxWidth="md"
          fullWidth
        >
          <AddAttendance
            onClose={() => setShowAddModal(false)}
            onSuccess={handleAddSuccess}
          />
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Attendance Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the attendance record for {selectedRecord?.class} on {selectedRecord ? new Date(selectedRecord.date).toLocaleDateString() : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Attendance Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleViewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Attendance Details - {selectedRecord?.class}
          <Typography variant="subtitle2" color="text.secondary">
            {selectedRecord ? new Date(selectedRecord.date).toLocaleDateString() : ''}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Summary
                </Typography>
                <Box display="flex" gap={2}>
                  <Chip
                    label={`Present: ${selectedRecord.students.filter(s => s.status === 'present').length}`}
                    color="success"
                  />
                  <Chip
                    label={`Absent: ${selectedRecord.students.filter(s => s.status === 'absent').length}`}
                    color="error"
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Student Details
              </Typography>
              <List>
                {selectedRecord.students.map((student, index) => {
                  // Safely access student data
                  const studentData = student.student || {};
                  const studentName = studentData.name || 'Unknown Student';
                  const studentId = studentData.admissionNumber || 'N/A';
                  const status = student.status || 'unknown';
                  
                  return (
                    <React.Fragment key={studentData._id || index}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography component="span" variant="body1" sx={{ fontWeight: 500 }}>
                                {studentName}
                              </Typography>
                              <Typography 
                                component="span" 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ ml: 2 }}
                              >
                                ID: {studentId}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Typography>
                          }
                        />
                        <Chip
                          size="small"
                          color={status === 'present' ? 'success' : 'error'}
                          label={status.charAt(0).toUpperCase() + status.slice(1)}
                          sx={{ ml: 2 }}
                        />
                      </ListItem>
                      {index < selectedRecord.students.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance; 