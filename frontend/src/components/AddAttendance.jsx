import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography, 
  Grid, 
  Checkbox, 
  Paper, 
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { attendanceAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AddAttendance = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    class: '',
    date: new Date().toISOString().split('T')[0],
    students: []
  });
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // All available classes
  const allClasses = [
    // O/L Classes (Grade 6-11)
    ...[6, 7, 8, 9, 10, 11].flatMap((grade) =>
      ["A", "B", "C", "D", "E", "F"].map((division) => `${grade}${division}`)
    ),
    // A/L Classes with detailed streams
    "AL-Physical Science",
    "AL-Biological Science",
    "AL-Engineering Technology",
    "AL-Bio Technology",
    "AL-Commerce",
    "AL-Arts",
  ];

  useEffect(() => {
    if (formData.class) {
      fetchStudentsByClass(formData.class);
    }
  }, [formData.class]);

  const fetchStudentsByClass = async (className) => {
    try {
      setLoadingStudents(true);
      const data = await userAPI.getStudentsByClass(className);
      if (data.success) {
        setStudents(data.data || []);
        // Initialize attendance status for all students as absent
        setFormData(prev => ({
          ...prev,
          students: data.data.map(student => ({
            student: student._id,
            status: 'absent'
          }))
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.class || !formData.date || formData.students.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Log the data being sent
    console.log('Submitting attendance data:', {
      class: formData.class,
      date: formData.date,
      students: formData.students
    });

    try {
      setLoading(true);
      const response = await attendanceAPI.create({
        class: formData.class,
        date: formData.date,
        students: formData.students.map(student => ({
          student: student.student,
          status: student.status
        }))
      });
      console.log('Server response:', response);
      toast.success('Attendance recorded successfully');
      onSuccess();
    } catch (error) {
      console.error('Error recording attendance:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Server error details:', error.response.data);
      }
      toast.error(error.response?.data?.message || 'Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentStatusChange = (studentId, status) => {
    setFormData(prev => {
      const updatedStudents = prev.students.map(s => 
        s.student === studentId ? { ...s, status: status ? 'present' : 'absent' } : s
      );
      return { ...prev, students: updatedStudents };
    });
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = formData.students.filter(s => s.status === 'present').length;
  const absentCount = formData.students.filter(s => s.status === 'absent').length;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ height: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">Record Attendance</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, height: 'calc(100% - 64px)', display: 'flex', flexDirection: 'column' }}>
        {/* Controls */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Class</InputLabel>
              <Select
                name="class"
                value={formData.class}
                onChange={handleChange}
                label="Class"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 400,
                      '& .MuiMenuItem-root': {
                        padding: '12px 24px',
                        minWidth: '250px'
                      }
                    }
                  }
                }}
                sx={{
                  '& .MuiSelect-select': {
                    padding: '12px 24px',
                    minWidth: '250px'
                  }
                }}
              >
                {allClasses.map((className) => (
                  <MenuItem key={className} value={className}>
                    {className}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              name="date"
              label="Date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Students"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>

        {/* Summary */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Paper sx={{ p: 2, flex: 1, bgcolor: '#f0fdf4' }}>
            <Typography variant="h6" color="success.main">Present: {presentCount}</Typography>
            <Typography variant="body2" color="text.secondary">
              {students.length > 0 ? `${((presentCount / students.length) * 100).toFixed(1)}% of class` : 'No students'}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1, bgcolor: '#fef2f2' }}>
            <Typography variant="h6" color="error.main">Absent: {absentCount}</Typography>
            <Typography variant="body2" color="text.secondary">
              {students.length > 0 ? `${((absentCount / students.length) * 100).toFixed(1)}% of class` : 'No students'}
            </Typography>
          </Paper>
        </Box>

        {/* Students Table */}
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
          {loadingStudents ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography>Loading students...</Typography>
            </Box>
          ) : students.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {formData.class ? 'No students found in this class' : 'Select a class to view students'}
              </Typography>
            </Box>
          ) : (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Index Number</TableCell>
                  <TableCell align="center">Attendance Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow 
                    key={student._id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: formData.students.find(s => s.student === student._id)?.status === 'present' 
                        ? '#f0fdf4' 
                        : 'inherit'
                    }}
                  >
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={formData.students.find(s => s.student === student._id)?.status === 'present'}
                        onChange={(e) => handleStudentStatusChange(student._id, e.target.checked)}
                        color="success"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Footer */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: '1px solid #e0e0e0', pt: 3 }}>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingStudents || students.length === 0}
            sx={{
              bgcolor: '#7f1d1d',
              '&:hover': {
                bgcolor: '#991b1b',
              },
              '&:disabled': {
                bgcolor: '#e5e7eb',
              }
            }}
          >
            {loading ? 'Recording...' : 'Record Attendance'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddAttendance; 