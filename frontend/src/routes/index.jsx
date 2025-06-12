import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth Pages
import Login from '../pages/auth/Login';

// Dashboard Pages
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import StaffDashboard from '../pages/dashboard/StaffDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import ClassDetails from '../pages/dashboard/ClassDetails';

// Feature Pages
import Assignments from '../pages/features/Assignments';
import Attendance from '../pages/features/Attendance';
import Marks from '../pages/features/Marks';
import Notifications from '../pages/features/Notifications';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/class/:gradeId/:division" element={
          <ProtectedRoute>
            <ClassDetails />
          </ProtectedRoute>
        } />
        <Route path="/admin/stream/:stream" element={
          <ProtectedRoute>
            <ClassDetails />
          </ProtectedRoute>
        } />

        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Common Feature Routes */}
        <Route path="/assignments" element={
          <ProtectedRoute>
            <Assignments />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        } />
        <Route path="/marks" element={
          <ProtectedRoute>
            <Marks />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; 