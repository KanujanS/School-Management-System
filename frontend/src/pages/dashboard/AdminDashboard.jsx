import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  UserGroupIcon,
  AcademicCapIcon as StudentIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { authAPI } from '../../services/api';
import ImageSlider from '../../components/ImageSlider';
import StaffManagement from './StaffManagement';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authAPI.getDashboardStats();
      
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      setError(error.message);
      toast.error('Failed to load dashboard statistics');
      // Set default values in case of error
      setStatistics({
        totalStudents: 0,
        totalStaff: 0,
        teachingStaff: 0,
        supportStaff: 0,
        activeStaff: 0,
        inactiveStaff: 0,
        totalAdmins: 0,
        recentStaff: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Define class structure
  const ordinaryLevelClasses = Array.from({ length: 6 }, (_, i) => i + 6); // 6 to 11
  const divisions = ['A', 'B', 'C', 'D', 'E', 'F'];

  const streams = [
    { id: 'physical-science', name: 'Physical Science' },
    { id: 'biological-science', name: 'Biological Science' },
    { id: 'commerce', name: 'Commerce' },
    { id: 'arts', name: 'Arts' },
    { id: 'bio-technology', name: 'Bio Technology' },
    { id: 'engineering-technology', name: 'Engineering Technology' }
  ];

  const handleClassClick = (grade, division) => {
    navigate(`/admin/class/${grade}/${division}`);
  };

  const handleStreamClick = (streamId) => {
    navigate(`/admin/stream/${streamId}`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-800 mx-auto" />
          <p className="mt-4 text-gray-600">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-800 mx-auto" />
          <p className="mt-4 text-gray-600">Error loading dashboard: {error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header with Image Slider */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ImageSlider />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="mt-2 text-gray-600">Manage and view all classrooms</p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <StudentIcon className="h-8 w-8 text-red-900" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm font-medium uppercase">Total Students</p>
              <div className="flex items-baseline">
                <p className="text-3xl font-semibold text-gray-900">{statistics?.totalStudents || 0}</p>
                <p className="ml-2 text-sm text-gray-600">Students</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>School Capacity</span>
              <span>1500 Students</span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-900 h-2 rounded-full" 
                style={{ width: `${((statistics?.totalStudents || 0) / 1500) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <UserGroupIcon className="h-8 w-8 text-red-900" />
            </div>
            <div className="ml-5">
              <p className="text-gray-500 text-sm font-medium uppercase">Total Staff</p>
              <div className="flex items-baseline">
                <p className="text-3xl font-semibold text-gray-900">{statistics?.totalStaff || 0}</p>
                <p className="ml-2 text-sm text-gray-600">Members</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-gray-500">Teaching Staff</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics?.teachingStaff || 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-gray-500">Support Staff</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics?.supportStaff || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Management Section */}
      <StaffManagement />

      {/* Class Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Class Management</h2>
        
        {/* O/L Classes */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ordinary Level Classes</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {ordinaryLevelClasses.map(grade => (
              divisions.map(division => (
                  <button
                  key={`${grade}${division}`}
                    onClick={() => handleClassClick(grade, division)}
                  className="px-3 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                  <p className="text-lg font-semibold text-red-900">{grade}{division}</p>
                  <p className="text-sm text-gray-600">Grade {grade}</p>
                  </button>
              ))
          ))}
        </div>
        </div>

        {/* A/L Streams */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Level Streams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map(stream => (
            <button
              key={stream.id}
              onClick={() => handleStreamClick(stream.id)}
                className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
                <p className="text-lg font-semibold text-red-900">{stream.name}</p>
                <p className="text-sm text-gray-600">A/L Stream</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 