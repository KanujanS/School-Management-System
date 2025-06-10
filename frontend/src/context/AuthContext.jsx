import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user and token are stored in localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      // Check if user is active
      if (!userData.isActive) {
        // Clear stored data if user is inactive
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        toast.error('Your account has been deactivated. Please contact the administrator.');
        navigate('/login');
      } else {
        setUser(userData);
      }
    } else {
      // If either is missing, clear both for consistency
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, [navigate]);

  const login = (userData) => {
    // Validate user data
    if (!userData || !userData.token) {
      toast.error('Invalid login data received');
      return;
    }

    // Check if user is active before logging in
    if (!userData.isActive) {
      toast.error('Your account has been deactivated. Please contact the administrator.');
      return;
    }

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    setUser(userData);
    
    // Navigate based on user role
    switch (userData.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'staff':
        navigate('/staff');
        break;
      case 'student':
        navigate('/student');
        break;
      default:
        navigate('/login');
        return; // Don't show success message if role is invalid
    }
    
    toast.success('Login successful!');
  };

  const logout = () => {
    // Clear both token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 