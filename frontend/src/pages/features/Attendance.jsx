import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  MenuItem,
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
} from "@mui/material";

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { attendanceAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AddAttendance from "../../components/AddAttendance";
import toast from "react-hot-toast";

const Attendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [studentIndexSearch, setStudentIndexSearch] = useState("");
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
      const response =
        user?.role === "student"
          ? await attendanceAPI.getStudentAttendance()
          : await attendanceAPI.getAll({});

      if (response.success) {
        setAttendanceRecords(response.data || []);
      } else {
        throw new Error(
          response.message || "Failed to fetch attendance records"
        );
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Failed to load attendance records");
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
      if (!selectedRecord || !selectedRecord._id) {
        throw new Error("No attendance record selected");
      }

      const response = await attendanceAPI.delete(selectedRecord._id);
      if (response.success) {
        setAttendanceRecords((prev) =>
          prev.filter((r) => r._id !== selectedRecord._id)
        );
        toast.success("Attendance record deleted successfully");
      } else {
        throw new Error(
          response.message || "Failed to delete attendance record"
        );
      }
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      toast.error(error.response?.data?.message || error.message);
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
      case "present":
        return "success";
      case "absent":
        return "error";
      default:
        return "default";
    }
  };

  const toInputDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
  };

  const normalizeClassName = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");

  const availableClasses = [...new Set(attendanceRecords.map((record) => record.class).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesDate = !selectedDate || toInputDate(record.date) === selectedDate;
    const matchesClass =
      selectedClass === "all" ||
      normalizeClassName(record.class) === normalizeClassName(selectedClass);

    return matchesDate && matchesClass;
  });

  const handleResetFilters = () => {
    setSelectedDate("");
    setSelectedClass("all");
  };

  const normalizedIndexSearch = studentIndexSearch.trim().toLowerCase();

  const studentAttendanceLookup =
    user?.role === "student" || !normalizedIndexSearch
      ? []
      : filteredRecords.flatMap((record) =>
          (record.students || [])
            .filter((studentRecord) => {
              const indexNumber = String(
                studentRecord?.student?.admissionNumber ||
                  studentRecord?.student?.studentId ||
                  ""
              ).toLowerCase();
              return indexNumber.includes(normalizedIndexSearch);
            })
            .map((studentRecord) => ({
              key: `${record._id}-${studentRecord._id}`,
              date: record.date,
              className: record.class,
              status: studentRecord.status,
              studentName: studentRecord?.student?.name || "Loading...",
              indexNumber:
                studentRecord?.student?.admissionNumber ||
                studentRecord?.student?.studentId ||
                "...",
            }))
        );

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Attendance Records</Typography>
        {(user?.role === "staff" || user?.role === "admin") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddModal(true)}
            sx={{
              backgroundColor: "#7f1d1d",
              "&:hover": { backgroundColor: "#991b1b" },
            }}
          >
            Record Attendance
          </Button>
        )}
      </Box>

      {/* Filters */}
      {user?.role !== "student" && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              label="Filter by Date"
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              select
              label="Filter by Class"
              size="small"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="all">All Classes</MenuItem>
              {availableClasses.map((className) => (
                <MenuItem key={className} value={className}>
                  {className}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </Box>
        </Paper>
      )}

      {/* Student Attendance Lookup */}
      {user?.role !== "student" && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Search Student Attendance by Index Number
            </Typography>
            <TextField
              label="Student Index Number"
              size="small"
              value={studentIndexSearch}
              onChange={(e) => setStudentIndexSearch(e.target.value)}
              placeholder="Type index number (e.g., 2408A12)"
              sx={{ maxWidth: 320 }}
            />

            {normalizedIndexSearch && (
              studentAttendanceLookup.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No attendance records found for index number "{studentIndexSearch.trim()}".
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Student</TableCell>
                        <TableCell>Index Number</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentAttendanceLookup.map((entry) => (
                        <TableRow key={entry.key}>
                          <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                          <TableCell>{entry.className}</TableCell>
                          <TableCell>{entry.studentName}</TableCell>
                          <TableCell>{entry.indexNumber}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                entry.status.charAt(0).toUpperCase() +
                                entry.status.slice(1)
                              }
                              color={getStatusColor(entry.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            )}
          </Box>
        </Paper>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>Loading attendance records...</Typography>
        </Box>
      ) : filteredRecords.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="textSecondary">
            No attendance records found for selected filters
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                {user?.role !== "student" && <TableCell>Class</TableCell>}
                {user?.role === "student" ? (
                  <TableCell align="center">Status</TableCell>
                ) : (
                  <>
                    <TableCell>Present</TableCell>
                    <TableCell>Absent</TableCell>
                  </>
                )}
                {user?.role !== "student" && (
                  <TableCell align="center">Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => {
                const studentStatus =
                  user?.role === "student"
                    ? record.status || "absent"
                    : "absent";
                const presentCount =
                  user?.role === "student"
                    ? 0
                    : record.students.filter((s) => s.status === "present").length;
                const absentCount =
                  user?.role === "student"
                    ? 0
                    : record.students.filter((s) => s.status === "absent").length;

                return (
                  <TableRow key={record._id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    {user?.role !== "student" && (
                      <TableCell>{record.class}</TableCell>
                    )}
                    {user?.role === "student" ? (
                      <TableCell align="center">
                        <Chip
                          label={
                            studentStatus.charAt(0).toUpperCase() +
                            studentStatus.slice(1)
                          }
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
                    {user?.role !== "student" && (
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
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
                            disabled={
                              deleting && selectedRecord?._id === record._id
                            }
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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
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
              Date:{" "}
              {selectedRecord &&
                new Date(selectedRecord.date).toLocaleDateString()}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Recorded By: {selectedRecord?.createdBy?.name || "Unknown"}
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
                {selectedRecord?.students.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.student?.name || "Loading..."}</TableCell>
                    <TableCell>
                      {item.student?.admissionNumber || "..."}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        }
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Attendance Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this attendance record? This action
            cannot be undone.
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
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

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
