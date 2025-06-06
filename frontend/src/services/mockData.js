// Mock Users
export const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@school.com',
    role: 'admin',
    password: 'admin123',
  },
  {
    id: '2',
    name: 'Teacher Smith',
    email: 'teacher@school.com',
    role: 'staff',
    password: 'staff123',
  },
  {
    id: '3',
    name: 'John Student',
    email: 'student@school.com',
    role: 'student',
    password: 'student123',
  },
];

// Mock Assignments
const assignments = [
  {
    id: 1,
    title: 'Mathematics Assignment 1',
    subject: 'Mathematics',
    description: 'Complete exercises from Chapter 3: Algebra Basics',
    dueDate: '2024-04-15',
    status: 'active',
    submissions: 15,
    assignedBy: 'Teacher Smith',
  },
  {
    id: 2,
    title: 'Science Project: Ecosystem',
    subject: 'Science',
    description: 'Create a model of a local ecosystem',
    dueDate: '2024-04-20',
    status: 'active',
    submissions: 12,
    assignedBy: 'Teacher Smith',
  },
  {
    id: 3,
    title: 'English Essay',
    subject: 'English',
    description: 'Write a 500-word essay on "The Impact of Technology"',
    dueDate: '2024-04-18',
    status: 'active',
    submissions: 8,
    assignedBy: 'Teacher Smith',
  },
  {
    id: 4,
    title: 'History Research',
    subject: 'History',
    description: 'Research and present about Ancient Civilizations',
    dueDate: '2024-04-25',
    status: 'active',
    submissions: 5,
    assignedBy: 'Teacher Smith',
  },
];

// Mock Attendance Records
const attendance = [
  {
    id: 1,
    studentId: '3',
    studentName: 'John Student',
    date: '2024-04-01',
    status: 'present',
    subject: 'Mathematics',
    class: 'Grade 10A',
  },
  {
    id: 2,
    studentId: '3',
    studentName: 'John Student',
    date: '2024-04-02',
    status: 'present',
    subject: 'Science',
    class: 'Grade 10A',
  },
  {
    id: 3,
    studentId: '3',
    studentName: 'John Student',
    date: '2024-04-03',
    status: 'absent',
    subject: 'English',
    class: 'Grade 10A',
  },
  {
    id: 4,
    studentId: '3',
    studentName: 'John Student',
    date: '2024-04-04',
    status: 'present',
    subject: 'History',
    class: 'Grade 10A',
  },
];

// Mock Marks/Grades
const marks = [
  {
    id: 1,
    studentId: '3',
    studentName: 'John Student',
    subject: 'Mathematics',
    assignment: 'Mid-Term Exam',
    term: 'Term 1',
    value: 85,
    totalMarks: 100,
    grade: 'A',
    date: '2024-03-15',
  },
  {
    id: 2,
    studentId: '3',
    studentName: 'John Student',
    subject: 'Science',
    assignment: 'Lab Report',
    term: 'Term 1',
    value: 78,
    totalMarks: 100,
    grade: 'B+',
    date: '2024-03-20',
  },
  {
    id: 3,
    studentId: '3',
    studentName: 'John Student',
    subject: 'English',
    assignment: 'Essay Writing',
    term: 'Term 1',
    value: 92,
    totalMarks: 100,
    grade: 'A+',
    date: '2024-03-25',
  },
  {
    id: 4,
    studentId: '3',
    studentName: 'John Student',
    subject: 'History',
    assignment: 'Project Presentation',
    term: 'Term 1',
    value: 88,
    totalMarks: 100,
    grade: 'A',
    date: '2024-03-30',
  },
];

// Mock Notifications
const notifications = [
  {
    id: 1,
    title: 'New Assignment Posted',
    message: 'Mathematics Assignment 1 has been posted. Due date: April 15, 2024',
    type: 'info',
    date: '2024-04-01',
    isRead: false,
  },
  {
    id: 2,
    title: 'Assignment Graded',
    message: 'Your Science Lab Report has been graded. Check your marks.',
    type: 'success',
    date: '2024-04-02',
    isRead: false,
  },
  {
    id: 3,
    title: 'Attendance Alert',
    message: 'You were marked absent for English class on April 3, 2024',
    type: 'warning',
    date: '2024-04-03',
    isRead: true,
  },
  {
    id: 4,
    title: 'Upcoming Test',
    message: 'Mathematics mid-term test scheduled for April 20, 2024',
    type: 'info',
    date: '2024-04-04',
    isRead: false,
  },
  {
    id: 5,
    title: 'System Maintenance',
    message: 'System will be under maintenance on Sunday, April 7, 2024',
    type: 'error',
    date: '2024-04-05',
    isRead: false,
  },
];

// Mock API Service
export const mockApi = {
  // Auth Methods
  login: async (email, password) => {
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    throw new Error('Invalid credentials');
  },

  // Assignments Methods
  getAssignments: async (role, userId) => {
    // Return all assignments for staff, filter for students
    if (role === 'staff') {
      return assignments;
    }
    // For students, you might want to filter based on their class/grade
    return assignments.slice(0, 2); // Just return first 2 for demo
  },

  // Attendance Methods
  getAttendance: async (role, userId, date) => {
    if (role === 'staff') {
      return attendance; // Return all attendance records
    }
    // For students, filter their own attendance
    return attendance.filter((record) => record.studentId === userId);
  },

  // Marks Methods
  getMarks: async (role, userId) => {
    if (role === 'staff') {
      return marks; // Return all marks
    }
    // For students, filter their own marks
    return marks.filter((mark) => mark.studentId === userId);
  },

  // Notifications Methods
  getNotifications: async (role, userId) => {
    if (role === 'admin') {
      return notifications; // Return all notifications
    }
    // Filter notifications based on role
    return notifications.slice(0, 3); // Just return first 3 for demo
  },

  // User Management Methods
  getUsers: async () => {
    return users.map(({ password, ...user }) => user); // Remove passwords from response
  },

  updateUser: async (userId, userData) => {
    // Simulate updating user
    return { success: true, message: 'User updated successfully' };
  },

  deleteUser: async (userId) => {
    // Simulate deleting user
    return { success: true, message: 'User deleted successfully' };
  },
}; 