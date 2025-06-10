import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies
});

// Add a request interceptor to add the token
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

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/auth/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Staff Management Methods
  getAllStaff: async () => {
    try {
      const response = await api.get('/api/auth/staff');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  createStaff: async (staffData) => {
    try {
      const response = await api.post('/api/auth/staff', staffData);
      return response.data;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  },

  updateStaff: async (staffId, staffData) => {
    try {
      const response = await api.put(`/api/auth/staff/${staffId}`, staffData);
      return response.data;
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  },

  updateStaffStatus: async (staffId, isActive) => {
    try {
      const response = await api.put(`/api/auth/staff/${staffId}`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error updating staff status:', error);
      throw error;
    }
  },

  removeStaff: async (staffId) => {
    try {
      const response = await api.delete(`/api/auth/staff/${staffId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing staff:', error);
      throw error;
    }
  }
};

// Assignment API
export const assignmentsAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/assignments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  },

  create: async (assignmentData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all non-file fields
      Object.keys(assignmentData).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, assignmentData[key]);
        }
      });

      // Add files
      if (assignmentData.attachments && assignmentData.attachments.length > 0) {
        assignmentData.attachments.forEach((attachment, index) => {
          formData.append('attachments', attachment.file);
        });
      }

      const response = await api.post('/api/assignments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Transform the response to ensure fileUrls are absolute
      if (response.data.success && response.data.data) {
        const assignment = response.data.data;
        if (assignment.attachments) {
          assignment.attachments = assignment.attachments.map(attachment => ({
            ...attachment,
            fileUrl: attachment.fileUrl.startsWith('http') 
              ? attachment.fileUrl 
              : `http://localhost:5002${attachment.fileUrl}`
          }));
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  delete: async (assignmentId) => {
    try {
      const response = await api.delete(`/api/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }
};

// Marks API
export const marksAPI = {
  getAll: async (params = {}) => {
    try {
      // Log the incoming parameters
      console.log('Debug - Incoming params:', params);

      // Normalize class name in params and remove undefined/null/empty values
      const normalizedParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value != null && value !== '') {
          acc[key] = key === 'class' ? value.replace(/\s+/g, '-') : value;
        }
        return acc;
      }, {});

      console.log('Debug - Original params:', params);
      console.log('Debug - Normalized params:', normalizedParams);

      // Make the API request with normalized parameters
      console.log('Debug - Making API request to /api/marks with params:', normalizedParams);
      const response = await api.get('/api/marks', { 
        params: normalizedParams,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Handle different response formats
      let data;
      if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.marks)) {
        data = response.data.marks;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else {
        console.warn('Unexpected marks response format:', response.data);
        data = [];
      }
      
      // Normalize class names and ensure required fields in response
      const normalizedData = data.map(mark => ({
        ...mark,
        _id: mark._id || `temp-${Math.random()}`,
        class: mark.class?.replace(/\s+/g, '-') || 'Unknown Class',
        student: mark.student ? {
          ...mark.student,
          _id: mark.student._id || `temp-student-${Math.random()}`,
          name: mark.student.name || 'Unknown Student',
          admissionNumber: mark.student.admissionNumber || 'N/A',
          class: mark.student.class?.replace(/\s+/g, '-') || 'Unknown Class'
        } : null,
        subject: mark.subject || 'Unknown Subject',
        score: mark.score || 0,
        totalMarks: mark.totalMarks || 100,
        grade: mark.grade || 'F',
        examType: mark.examType || 'Unknown Term'
      }));

      return normalizedData;
    } catch (error) {
      console.error('Error fetching marks:', {
        error,
        params,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  create: async (markData) => {
    try {
      // If it's a bulk creation
      if (Array.isArray(markData.marks)) {
        // Validate marks data
        if (!markData.marks.length) {
          throw new Error('No marks provided');
        }

        // Validate each mark entry
        markData.marks.forEach((mark, index) => {
          if (!mark.student || !mark.subject || !mark.class || !mark.examType || mark.score === undefined) {
            throw new Error(`Invalid mark data at index ${index}: Missing required fields`);
          }
        });

        // Normalize class names (replace spaces with hyphens)
        const normalizedMarks = markData.marks.map(mark => ({
          ...mark,
          class: mark.class?.replace(/\\s+/g, '-')
        }));

        console.log('Debug - Sending bulk marks:', normalizedMarks);
        
        const response = await api.post('/api/marks/bulk', { marks: normalizedMarks });
        
        console.log('Debug - Bulk marks response:', response.data);

        // If the request was successful but some marks failed
        if (response.data.errors || (response.data.success === false)) {
          const errorMessage = response.data.errors 
            ? response.data.errors.map(err => `${err.subject}: ${err.error}`).join(', ')
            : response.data.message || 'Failed to save marks';
          throw new Error(errorMessage);
        }

        return response.data;
      }
      
      // Single mark creation
      const normalizedMark = {
        ...markData,
        class: markData.class?.replace(/\\s+/g, '-')
      };

      console.log('Debug - Sending single mark:', normalizedMark);
      
      const response = await api.post('/api/marks', normalizedMark);
      
      console.log('Debug - Single mark response:', response.data);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to save mark');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating mark:', {
        error,
        data: markData,
        message: error.message,
        response: error.response?.data
      });

      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.message || error.response.data || 'Server error');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  }
};

// Attendance API
export const attendanceAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/attendance', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },

  create: async (attendanceData) => {
    try {
      const response = await api.post('/api/attendance', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/attendance/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  }
};

// Student API
export const studentAPI = {
  getStudentsByClass: async (gradeId, division) => {
    try {
      const response = await api.get(`/api/students/class/${gradeId}/${division}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  getStudentsByStream: async (stream) => {
    try {
      const response = await api.get(`/api/students/stream/${stream}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  addStudent: async (studentData) => {
    try {
      const response = await api.post('/api/students', studentData);
      return response.data;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  updateStudent: async (studentId, studentData) => {
    try {
      const response = await api.put(`/api/students/${studentId}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  deleteStudent: async (studentId) => {
    try {
      const response = await api.delete(`/api/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
};

// User API
export const userAPI = {
  getStudentsByClass: async (className) => {
    try {
      console.log('Getting students for class:', className); // Debug log

      // Remove any existing hyphens and normalize spaces
      const normalizedClassName = className.replace(/-/g, ' ').trim();

      const response = await api.get('/api/users/students', { 
        params: { 
          class: normalizedClassName
        }
      });

      console.log('Students API response:', response.data); // Debug log

      // Ensure we have a valid response
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }

      // Extract and validate student data
      const studentsData = response.data.data || [];
      if (!Array.isArray(studentsData)) {
        throw new Error('Invalid students data format');
      }

      // Normalize student data
      const validStudents = studentsData.map(student => ({
        _id: student._id,
        name: student.name || 'Unknown Student',
        admissionNumber: student.studentId || 'N/A',
        class: student.class || normalizedClassName
      })).filter(student => student._id && student.name);

      console.log('Processed students:', validStudents); // Debug log

      return { 
        success: true,
        data: validStudents 
      };
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // ... rest of the userAPI methods ...
};

export default api; 