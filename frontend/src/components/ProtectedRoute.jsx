import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is trying to access a role-specific route
  const roleRoutes = {
    '/admin': 'admin',
    '/staff': 'staff',
    '/student': 'student'
  };

  const requestedRole = roleRoutes[location.pathname];
  if (requestedRole && user.role !== requestedRole) {
    // Redirect to their appropriate dashboard if trying to access wrong role's route
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

export default ProtectedRoute; 