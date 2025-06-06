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
    assignedBy: 'Mr. Smith',
    class: 'Grade 10-A',
    createdAt: '2024-04-01'
  },
  {
    id: 2,
    title: 'Science Project: Ecosystem',
    subject: 'Science',
    description: 'Create a model of a local ecosystem',
    dueDate: '2024-04-20',
    status: 'active',
    submissions: 12,
    assignedBy: 'Ms. Johnson',
    class: 'Grade 11-B',
    createdAt: '2024-04-02'
  },
  {
    id: 3,
    title: 'English Essay',
    subject: 'English',
    description: 'Write a 500-word essay on "The Impact of Technology"',
    dueDate: '2024-04-18',
    status: 'active',
    submissions: 8,
    assignedBy: 'Mrs. Davis',
    class: 'Grade 9-C',
    createdAt: '2024-04-03'
  },
  {
    id: 4,
    title: 'History Research',
    subject: 'History',
    description: 'Research and present about Ancient Civilizations',
    dueDate: '2024-04-25',
    status: 'active',
    submissions: 5,
    assignedBy: 'Mr. Wilson',
    class: 'Grade 10-B',
    createdAt: '2024-04-04'
  },
];

// Mock Attendance Records
const attendance = [
  // Grade 6-A
  {
    id: 1,
    studentId: '1',
    studentName: 'Kamal Perera',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 6-A',
    month: 'April'
  },
  {
    id: 2,
    studentId: '2',
    studentName: 'Saman Silva',
    date: '2024-04-01',
    status: 'absent',
    class: 'Grade 6-A',
    month: 'April'
  },
  {
    id: 3,
    studentId: '3',
    studentName: 'Nimal Fernando',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 6-A',
    month: 'April'
  },
  // Grade 7-B
  {
    id: 4,
    studentId: '4',
    studentName: 'Malini Dias',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 7-B',
    month: 'April'
  },
  {
    id: 5,
    studentId: '5',
    studentName: 'Kumara Bandara',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 7-B',
    month: 'April'
  },
  {
    id: 6,
    studentId: '6',
    studentName: 'Chamari Atapattu',
    date: '2024-04-01',
    status: 'absent',
    class: 'Grade 7-B',
    month: 'April'
  },
  // Grade 8-C
  {
    id: 7,
    studentId: '7',
    studentName: 'Dinesh Chandimal',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 8-C',
    month: 'April'
  },
  {
    id: 8,
    studentId: '8',
    studentName: 'Lasith Malinga',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 8-C',
    month: 'April'
  },
  {
    id: 9,
    studentId: '9',
    studentName: 'Mahela Jayawardene',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 8-C',
    month: 'April'
  },
  // Grade 9-A
  {
    id: 10,
    studentId: '10',
    studentName: 'Sachini Fernando',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 9-A',
    month: 'April'
  },
  {
    id: 11,
    studentId: '11',
    studentName: 'Kavindi Silva',
    date: '2024-04-01',
    status: 'absent',
    class: 'Grade 9-A',
    month: 'April'
  },
  {
    id: 12,
    studentId: '12',
    studentName: 'Thisara Perera',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 9-A',
    month: 'April'
  },
  // Grade 10-B
  {
    id: 13,
    studentId: '13',
    studentName: 'Dimuth Karunaratne',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 10-B',
    month: 'April'
  },
  {
    id: 14,
    studentId: '14',
    studentName: 'Kusal Mendis',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 10-B',
    month: 'April'
  },
  {
    id: 15,
    studentId: '15',
    studentName: 'Angelo Mathews',
    date: '2024-04-01',
    status: 'absent',
    class: 'Grade 10-B',
    month: 'April'
  },
  // Grade 11-C
  {
    id: 16,
    studentId: '16',
    studentName: 'Dhananjaya de Silva',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 11-C',
    month: 'April'
  },
  {
    id: 17,
    studentId: '17',
    studentName: 'Wanindu Hasaranga',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 11-C',
    month: 'April'
  },
  {
    id: 18,
    studentId: '18',
    studentName: 'Charith Asalanka',
    date: '2024-04-01',
    status: 'present',
    class: 'Grade 11-C',
    month: 'April'
  },
  // A/L Physical Science Students
  {
    id: 19,
    studentId: '19',
    studentName: 'Pathum Nissanka',
    date: '2024-04-01',
    status: 'present',
    class: 'A/L Physical Science',
    month: 'April'
  },
  {
    id: 20,
    studentId: '20',
    studentName: 'Dasun Shanaka',
    date: '2024-04-01',
    status: 'present',
    class: 'A/L Physical Science',
    month: 'April'
  },
  
  // A/L Biological Science Students
  {
    id: 21,
    studentId: '21',
    studentName: 'Kusal Perera',
    date: '2024-04-01',
    status: 'absent',
    class: 'A/L Biological Science',
    month: 'April'
  },
  {
    id: 22,
    studentId: '22',
    studentName: 'Chamika Karunaratne',
    date: '2024-04-01',
    status: 'present',
    class: 'A/L Biological Science',
    month: 'April'
  },
  
  // A/L Bio Technology Students
  {
    id: 23,
    studentId: '23',
    studentName: 'Dushmantha Chameera',
    date: '2024-04-01',
    status: 'present',
    class: 'A/L Bio Technology',
    month: 'April'
  },
  {
    id: 24,
    studentId: '24',
    studentName: 'Maheesh Theekshana',
    date: '2024-04-01',
    status: 'absent',
    class: 'A/L Bio Technology',
    month: 'April'
  },
  
  // A/L Engineering Technology Students
  {
    id: 25,
    studentId: '25',
    studentName: 'Ashen Bandara',
    date: '2024-04-01',
    status: 'present',
    class: 'A/L Engineering Technology',
    month: 'April'
  },
  {
    id: 26,
    studentId: '26',
    studentName: 'Praveen Jayawickrama',
    date: '2024-04-01',
    status: 'present',
    class: 'A/L Engineering Technology',
    month: 'April'
  },
  
  // A/L Commerce Students
  {
    id: 27,
    studentId: '27',
    studentName: 'Lahiru Kumara',
    date: '2024-04-01',
    status: 'present',
    class: 'A/L Commerce',
    month: 'April'
  },
  {
    id: 28,
    studentId: '28',
    studentName: 'Dilshan Madushanka',
    date: '2024-04-01',
    status: 'absent',
    class: 'A/L Commerce',
    month: 'April'
  },
  
  // A/L Arts Students
  {
    id: 29,
    studentId: '29',
    studentName: 'Kasun Rajitha',
    date: '2024-04-01',
    status: 'present',
    class: 'A/L Arts',
    month: 'April'
  },
  {
    id: 30,
    studentId: '30',
    studentName: 'Jeffrey Vandersay',
    date: '2024-04-01',
    status: 'present',
    class: 'A/L Arts',
    month: 'April'
  }
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
    class: 'Grade 10-A'
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
    class: 'Grade 10-A'
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
    class: 'Grade 10-A'
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
    class: 'Grade 10-A'
  },
];

// Mock Notifications
const notifications = [
  {
    id: 1,
    title: 'New Assignment Posted',
    message: 'Mathematics Assignment 1 has been posted. Due date: April 15, 2024',
    category: 'assignment',
    date: '2024-04-01',
    isRead: false,
  },
  {
    id: 2,
    title: 'Marks Updated',
    message: 'Your Science Lab Report has been graded. Check your marks.',
    category: 'marks',
    date: '2024-04-02',
    isRead: false,
  },
  {
    id: 3,
    title: 'New Assignment Posted',
    message: 'English Essay Assignment has been posted. Due date: April 25, 2024',
    category: 'assignment',
    date: '2024-04-03',
    isRead: true,
  },
  {
    id: 4,
    title: 'Term Test Marks Updated',
    message: 'Mathematics Term 1 Test marks have been updated.',
    category: 'marks',
    date: '2024-04-04',
    isRead: false,
  }
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
    if (role === 'staff' || role === 'admin') {
      return marks; // Return all marks for staff and admin
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