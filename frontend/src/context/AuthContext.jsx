import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check if token is valid
  const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Add any additional token validation logic here if needed
    return true;
  };

  useEffect(() => {
    // Check if user and token are stored in localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        // Validate required user data
        if (!userData.role || !userData._id || !userData.name) {
          throw new Error('Invalid user data');
        }
        
        // Check if user is active
        if (!userData.isActive) {
          throw new Error('Account deactivated');
        }

        setUser(userData);
        setIsAuthenticated(true);
        
        // Redirect to appropriate dashboard if on login page
        if (window.location.pathname === '/login') {
          // Check if there's a redirect path stored
          const redirectPath = localStorage.getItem('redirectPath');
          if (redirectPath) {
            localStorage.removeItem('redirectPath');
            navigate(redirectPath);
          } else {
            navigate(`/${userData.role}`);
          }
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        if (error.message === 'Account deactivated') {
          toast.error('Your account has been deactivated. Please contact the administrator.');
        }
        navigate('/login');
      }
    } else {
      // If either is missing, clear both for consistency
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, [navigate]);

  const login = async (userData) => {
    try {
      // Validate user data
      if (!userData || !userData.token || !userData.role || !userData._id || !userData.name) {
        throw new Error('Invalid login data received');
      }

      // Check if user is active
      if (!userData.isActive) {
        throw new Error('Account deactivated');
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Check for redirect path
      const redirectPath = localStorage.getItem('redirectPath');
      if (redirectPath) {
        localStorage.removeItem('redirectPath');
        navigate(redirectPath);
      } else {
        // Navigate based on user role
        switch (userData.role) {
          case 'admin':
          case 'staff':
          case 'student':
            navigate(`/${userData.role}`);
            break;
          default:
            throw new Error('Invalid user role');
        }
      }
      
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partially stored data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('redirectPath');
      setUser(null);
      setIsAuthenticated(false);
      
      if (error.message === 'Account deactivated') {
        toast.error('Your account has been deactivated. Please contact the administrator.');
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const logout = (redirectToLogin = true) => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectPath');
    setUser(null);
    setIsAuthenticated(false);
    
    if (redirectToLogin) {
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      isAuthenticated,
      isTokenValid,
      role: user?.role || null
    }}>
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