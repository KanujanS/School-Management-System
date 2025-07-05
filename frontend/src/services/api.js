import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5003",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
    // Only handle auth errors if we're not already on the login page
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      // Check if it's a token-related error
      const isAuthError =
        error.response?.data?.message?.toLowerCase().includes("token") ||
        error.response?.data?.message
          ?.toLowerCase()
          .includes("authentication") ||
        !error.response?.data?.message;

      if (isAuthError) {
        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Store the current URL to redirect back after login
        const currentPath = window.location.pathname;
        localStorage.setItem("redirectPath", currentPath);

        // Redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post("/api/auth/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await api.get("/api/auth/me");
      return response.data;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get("/api/auth/dashboard-stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Staff Management Methods
  getAllStaff: async () => {
    try {
      const response = await api.get("/api/auth/staff");
      return response.data;
    } catch (error) {
      console.error("Error fetching staff:", error);
      throw error;
    }
  },

  createStaff: async (staffData) => {
    try {
      const response = await api.post("/api/auth/staff", staffData);
      return response.data;
    } catch (error) {
      console.error("Error creating staff:", error);
      throw error;
    }
  },

  updateStaff: async (staffId, staffData) => {
    try {
      const response = await api.put(`/api/auth/staff/${staffId}`, staffData);
      return response.data;
    } catch (error) {
      console.error("Error updating staff:", error);
      throw error;
    }
  },

  updateStaffStatus: async (staffId, isActive) => {
    try {
      const response = await api.put(`/api/auth/staff/${staffId}`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating staff status:", error);
      throw error;
    }
  },

  removeStaff: async (staffId) => {
    try {
      const response = await api.delete(`/api/auth/staff/${staffId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing staff:", error);
      throw error;
    }
  },
};

// Assignment API
export const assignmentsAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/api/assignments", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      throw error;
    }
  },

  create: async (assignmentData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Format class name to match our system's format
      const formattedData = {
        ...assignmentData,
        class: assignmentData.class.toLowerCase(),
      };

      // Add all non-file fields
      Object.keys(formattedData).forEach((key) => {
        if (key !== "attachments") {
          formData.append(key, formattedData[key]);
        }
      });

      // Add files
      if (formattedData.attachments && formattedData.attachments.length > 0) {
        formattedData.attachments.forEach((attachment) => {
          if (attachment.file) {
            formData.append(
              "attachments",
              attachment.file,
              attachment.fileName
            );
          }
        });
      }

      console.log("Debug - Sending assignment data:", {
        ...formattedData,
        attachments: formattedData.attachments?.map((a) => ({
          fileName: a.fileName,
          uploadedAt: a.uploadedAt,
        })),
      });

      const response = await api.post("/api/assignments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Transform the response to ensure fileUrls are absolute
      if (response.data.success && response.data.data) {
        const assignment = response.data.data;
        if (assignment.attachments) {
          assignment.attachments = assignment.attachments.map((attachment) => ({
            ...attachment,
            fileUrl: attachment.fileUrl.startsWith("http")
              ? attachment.fileUrl
              : `${api.defaults.baseURL}${attachment.fileUrl}`,
          }));
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error creating assignment:", error);

      // Let the main interceptor handle 401 errors
      if (error.response?.status === 401) {
        throw error;
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create assignment"
      );
    }
  },

  delete: async (assignmentId) => {
    try {
      const response = await api.delete(`/api/assignments/${assignmentId}`);

      // Check if the response indicates success
      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.message || "Failed to delete assignment"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error deleting assignment:", {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error("Assignment not found");
      } else if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || "";
        if (
          errorMessage.toLowerCase().includes("token") ||
          errorMessage.toLowerCase().includes("authentication") ||
          !errorMessage
        ) {
          // Let the interceptor handle the auth error
          throw error;
        } else {
          // It's a permission error, not an auth error
          throw new Error(
            errorMessage || "Not authorized to delete this assignment"
          );
        }
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete assignment"
      );
    }
  },
};

// Marks API
export const marksAPI = {
  getAll: async (params = {}) => {
    try {
      // Log the incoming parameters
      console.log("Debug - Incoming params:", params);

      // Normalize class name in params and remove undefined/null/empty values
      const normalizedParams = Object.entries(params).reduce(
        (acc, [key, value]) => {
          if (value != null && value !== "") {
            acc[key] = key === "class" ? value.replace(/\s+/g, "-") : value;
          }
          return acc;
        },
        {}
      );

      console.log("Debug - Original params:", params);
      console.log("Debug - Normalized params:", normalizedParams);

      // Make the API request with normalized parameters
      console.log(
        "Debug - Making API request to /api/marks with params:",
        normalizedParams
      );
      const response = await api.get("/api/marks", {
        params: normalizedParams,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle different response formats
      let data;
      if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.marks)) {
        data = response.data.marks;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        data = response.data.data;
      } else {
        console.warn("Unexpected marks response format:", response.data);
        data = [];
      }

      // Normalize class names and ensure required fields in response
      const normalizedData = data.map((mark) => ({
        ...mark,
        _id: mark._id || `temp-${Math.random()}`,
        class: mark.class?.replace(/\s+/g, "-") || "Unknown Class",
        student: mark.student
          ? {
              ...mark.student,
              _id: mark.student._id || `temp-student-${Math.random()}`,
              name: mark.student.name || "Unknown Student",
              admissionNumber: mark.student.admissionNumber || "N/A",
              class:
                mark.student.class?.replace(/\s+/g, "-") || "Unknown Class",
            }
          : null,
        subject: mark.subject || "Unknown Subject",
        score: mark.score || 0,
        totalMarks: mark.totalMarks || 100,
        grade: mark.grade || "F",
        examType: mark.examType || "Unknown Term",
      }));

      return normalizedData;
    } catch (error) {
      console.error("Error fetching marks:", {
        error,
        params,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  },

  getStudentMarks: async (studentId) => {
    try {
      console.log("Debug - Fetching marks for student:", studentId);

      const response = await api.get(`/api/marks/student/${studentId}`);

      console.log("Debug - Student marks response:", response.data);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch student marks"
        );
      }

      // Normalize the data
      const marks = response.data.data || [];
      return marks.map((mark) => ({
        ...mark,
        _id: mark._id || `temp-${Math.random()}`,
        class: mark.class?.replace(/\s+/g, "-") || "Unknown Class",
        student: mark.student
          ? {
              ...mark.student,
              _id: mark.student._id || `temp-student-${Math.random()}`,
              name: mark.student.name || "Unknown Student",
              admissionNumber: mark.student.admissionNumber || "N/A",
              class:
                mark.student.class?.replace(/\s+/g, "-") || "Unknown Class",
            }
          : null,
        subject: mark.subject || "Unknown Subject",
        score: mark.score || 0,
        totalMarks: mark.totalMarks || 100,
        grade: mark.grade || "F",
        examType: mark.examType || "Unknown Term",
      }));
    } catch (error) {
      console.error("Error fetching student marks:", {
        error,
        studentId,
        message: error.message,
        response: error.response?.data,
      });

      if (error.response) {
        throw new Error(
          error.response.data.message || error.response.data || "Server error"
        );
      } else if (error.request) {
        throw new Error("No response from server. Please try again.");
      } else {
        throw error;
      }
    }
  },

  create: async (markData) => {
    try {
      console.log("Debug - Incoming mark data:", markData);

      // If it's a bulk creation
      if (Array.isArray(markData.marks)) {
        // Validate marks data
        if (!markData.marks.length) {
          throw new Error("No marks provided");
        }

        // Normalize class names and validate each mark entry
        const normalizedMarks = markData.marks.map((mark, index) => {
          if (
            !mark.studentName ||
            !mark.admissionNumber ||
            !mark.subject ||
            !mark.class ||
            !mark.examType ||
            mark.score === undefined
          ) {
            throw new Error(
              `Invalid mark data at index ${index}: Missing required fields`
            );
          }

          return {
            ...mark,
            class: mark.class.replace(/\s+/g, "-"),
            score: Number(mark.score),
            totalMarks: Number(mark.totalMarks || 100),
          };
        });

        console.log("Debug - Sending bulk marks:", normalizedMarks);

        const response = await api.post("/api/marks/add", {
          marks: normalizedMarks,
        });

        console.log("Debug - Bulk marks response:", response.data);

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to save marks");
        }

        return response.data.data;
      }

      // Single mark creation
      const normalizedMark = {
        ...markData,
        class: markData.class?.replace(/\s+/g, "-"),
        score: Number(markData.score),
        totalMarks: Number(markData.totalMarks || 100),
      };

      console.log("Debug - Sending single mark:", normalizedMark);

      const response = await api.post("/api/marks/add", normalizedMark);

      console.log("Debug - Single mark response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to save mark");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating mark:", {
        error,
        data: markData,
        message: error.message,
        response: error.response?.data,
      });

      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(
          error.response.data.message || error.response.data || "Server error"
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response from server. Please try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  },

  deleteMarks: async (markId) => {
    try {
      console.log("Debug - Deleting marks for ID:", markId);

      const response = await api.delete(`/api/marks/${markId}`);

      console.log("Debug - Delete marks response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete marks");
      }

      return response.data;
    } catch (error) {
      console.error("Error deleting marks:", {
        error,
        markId,
        message: error.message,
        response: error.response?.data,
      });

      if (error.response) {
        throw new Error(
          error.response.data.message || error.response.data || "Server error"
        );
      } else if (error.request) {
        throw new Error("No response from server. Please try again.");
      } else {
        throw error;
      }
    }
  },
};

// Add to your axios instance setup
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// attendanceAPI.js
export const attendanceAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/api/attendance", { params });

      if (!response.data?.success) {
        console.error("Invalid attendance response:", response.data);
        return { success: false, data: [] };
      }

      const normalizedData = response.data.data.map((record) => {
        const students = record.students.map((studentRecord) => {
          let student = studentRecord.student;

          if (typeof student === "string" || typeof student === "number") {
            // Not populated
            student = {
              _id: student,
              name: "Loading...",
              admissionNumber: "...",
              class: record.class,
            };
          }

          return {
            _id: studentRecord._id,
            status: studentRecord.status,
            student,
          };
        });

        return {
          ...record,
          students,
        };
      });

      return { success: true, data: normalizedData };
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return { success: false, data: [] };
    }
  },

  create: async (attendanceData) => {
    try {
      // Clone to avoid mutation
      const payload = { ...attendanceData };

      // Format date without timezone conversion
      if (payload.date) {
        const date = new Date(payload.date);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        payload.date = date;
      }

      const response = await api.post("/api/attendance", payload);

      if (!response.data?.success) {
        const errorMsg =
          response.data?.message || "Failed to create attendance";
        console.error("Create attendance failed:", errorMsg);
        throw new Error(errorMsg);
      }

      return response.data;
    } catch (error) {
      console.error("Error creating attendance:", {
        error: error.message,
        data: attendanceData,
        response: error.response?.data,
      });

      throw new Error(
        error.response?.data?.message ||
          "Attendance creation failed. Please check your data."
      );
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/attendance/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting attendance:", {
        error: error.message,
        id,
        response: error.response?.data,
      });

      throw new Error(
        error.response?.data?.message ||
          "Failed to delete attendance. It may have already been removed."
      );
    }
  },
};

// Student API
export const studentAPI = {
  create: async (studentData) => {
    try {
      // Normalize the data before sending
      const normalizedData = {
        ...studentData,
        // Normalize class name
        class: studentData.class.replace(/\s+/g, "-"),
        // If it's an A/L student, normalize the stream
        ...(studentData.stream && {
          stream: studentData.stream.replace(/\s+/g, "-"),
        }),
      };

      console.log("Debug - Creating student with normalized data:", {
        ...normalizedData,
        password: "[REDACTED]",
      });

      const response = await api.post("/api/students", normalizedData);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to create student");
      }

      return response.data;
    } catch (error) {
      console.error("Error creating student:", {
        error: error.message,
        response: error.response?.data,
      });
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to create student. Please try again.");
    }
  },

  getStudentsByClass: async (grade, division) => {
    try {
      const response = await api.get(
        `/api/students/class/${grade}/${division}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching students by class:", error);
      throw error;
    }
  },

  getStudentsByStream: async (stream) => {
    try {
      // Normalize stream name
      const normalizedStream = stream.replace(/\s+/g, "-");
      const response = await api.get(
        `/api/students/stream/${normalizedStream}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching students by stream:", error);
      throw error;
    }
  },

  deleteStudent: async (studentId) => {
    try {
      const response = await api.delete(`/api/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  },
};

// User API
export const userAPI = {
  getStudentsByClass: async (className) => {
    try {
      console.log("Debug - Fetching students for class:", className);
      const response = await api.get("/api/users/students", {
        params: { class: className },
      });

      if (!response.data || !response.data.success) {
        console.error(
          "Invalid response from getStudentsByClass:",
          response.data
        );
        throw new Error(response.data?.message || "Failed to fetch students");
      }

      // Normalize student data
      const normalizedStudents = response.data.data.map((student) => ({
        _id: student._id,
        name: student.name,
        admissionNumber: student.admissionNumber || student.studentId || "N/A",
        class: student.class,
      }));

      console.log("Debug - Normalized student data:", {
        total: normalizedStudents.length,
        sample: normalizedStudents[0],
      });

      return {
        success: true,
        data: normalizedStudents,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error fetching students:", {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  addMarks: async (marksData) => {
    try {
      console.log("Debug - Adding marks:", {
        studentId: marksData.studentId,
        class: marksData.class,
        term: marksData.term,
        marksCount: marksData.marks.length,
      });

      const response = await api.post("/api/marks", marksData);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to add marks");
      }

      return response.data;
    } catch (error) {
      console.error("Error adding marks:", {
        error: error.message,
        response: error.response?.data,
        data: marksData,
      });
      throw error;
    }
  },
};

// Notification API
export const notificationAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/api/notifications");
      if (!response.data) {
        throw new Error("No data received from server");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", {
        error,
        message: error.message,
        response: error.response?.data,
      });
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch notifications"
      );
    }
  },

  create: async (notificationData) => {
    try {
      const response = await api.post("/api/notifications", notificationData);
      if (!response.data) {
        throw new Error("No data received from server");
      }
      return response.data;
    } catch (error) {
      console.error("Error creating notification:", {
        error,
        data: notificationData,
        message: error.message,
        response: error.response?.data,
      });
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to create notification"
      );
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/notifications/${id}`);
      if (!response.data) {
        throw new Error("No data received from server");
      }
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", {
        error,
        id,
        message: error.message,
        response: error.response?.data,
      });
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to delete notification"
      );
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.put(`/api/notifications/${id}/mark-read`);
      if (!response.data) {
        throw new Error("No data received from server");
      }
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", {
        error,
        id,
        message: error.message,
        response: error.response?.data,
      });
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to mark notification as read"
      );
    }
  },
};

export default api;
