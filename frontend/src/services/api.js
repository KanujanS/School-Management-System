import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/auth/dashboard-stats');
    return response.data;
  },
  getAllStaff: async () => {
    const response = await api.get('/auth/staff');
    return response.data;
  },
  removeStaff: async (id) => {
    const response = await api.delete(`/auth/staff/${id}`);
    return response.data;
  },
  updateStaffStatus: async (id, isActive) => {
    const response = await api.patch(`/auth/staff/${id}/status`, { isActive });
    return response.data;
  }
};

// Students API
export const studentsAPI = {
  getAll: async () => {
    const response = await api.get('/students');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  getByClass: async (className) => {
    const response = await api.get(`/students/class/${encodeURIComponent(className)}`);
    return response.data;
  },
  create: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },
  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

// Marks API
export const marksAPI = {
  getAll: async (params) => {
    const response = await api.get('/marks', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/marks/${id}`);
    return response.data;
  },
  create: async (markData) => {
    const response = await api.post('/marks', markData);
    return response.data;
  },
  update: async (id, markData) => {
    const response = await api.put(`/marks/${id}`, markData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/marks/${id}`);
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (params) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },
  create: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },
  update: async (id, attendanceData) => {
    const response = await api.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
  getStudentDetails: async (studentId) => {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (params) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },
  create: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },
  update: async (id, notificationData) => {
    const response = await api.put(`/notifications/${id}`, notificationData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/mark-read`);
    return response.data;
  },
};

// Staff API
export const staffAPI = {
  getAll: async () => {
    const response = await api.get('/staff');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },
  create: async (staffData) => {
    const response = await api.post('/staff', staffData);
    return response.data;
  },
  update: async (id, staffData) => {
    const response = await api.put(`/staff/${id}`, staffData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/staff/${id}/status`, { status });
    return response.data;
  },
};

// Assignments API
export const assignmentsAPI = {
  getAll: async (params) => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },
  create: async (assignmentData) => {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
  },
  update: async (id, assignmentData) => {
    const response = await api.put(`/assignments/${id}`, assignmentData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    throw new Error(message);
  }
);

export default api; 