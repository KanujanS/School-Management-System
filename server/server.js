import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import markRoutes from './routes/markRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import morgan from 'morgan';
import colors from 'colors';
import Mark from './models/Mark.js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Debugging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// CORS Configuration
const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  // Allow local development and deployed frontends without hardcoding one exact domain.
  const localhostPattern = /^http:\/\/localhost:\d+$/;
  const vercelPattern = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;

  return localhostPattern.test(origin) || vercelPattern.test(origin);
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Regular middleware
app.use(express.json());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static files from the uploads directory with proper CORS and security headers
app.use('/uploads', (req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (isAllowedOrigin(requestOrigin) && requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Test route
app.get("/", (req, res) => {
  res.send("API is running successfully");
});

// Error Handler
app.use(errorHandler);

// MongoDB Connection
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management');
    console.log('Connected to MongoDB');

    try {
      const indexes = await Mark.collection.indexes();
      const hasLegacyIndex = indexes.some((index) => index.name === 'student_1_subject_1_examType_1');

      if (hasLegacyIndex) {
        await Mark.collection.dropIndex('student_1_subject_1_examType_1');
        console.log('Dropped legacy marks index: student_1_subject_1_examType_1');
      }
    } catch (indexError) {
      console.error('Marks index cleanup warning:', indexError.message);
    }
    
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
      console.log(`Test the server: http://localhost:${PORT}/test`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

startServer();