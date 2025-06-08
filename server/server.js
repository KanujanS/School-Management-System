import express from 'express';
import 'dotenv/config'
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import markRoutes from './routes/markRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Initialize Express app
const app = express();

//Connect to MongoDB database
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Mahiyangana National School Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      attendance: '/api/attendance',
      assignments: '/api/assignments',
      marks: '/api/marks',
      notifications: '/api/notifications'
    }
  });
});

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

//Port
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`);});