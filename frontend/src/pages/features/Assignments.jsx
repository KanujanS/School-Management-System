import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assignmentsAPI } from '../../services/api';
import {
  DocumentPlusIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import AddAssignment from '../../components/AddAssignment';
import AssignmentDetails from '../../components/AssignmentDetails';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Assignments = () => {
  const { user, logout, isAuthenticated, isTokenValid } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAssignments();
  }, [user, isAuthenticated]);

  const fetchAssignments = async () => {
    try {
      if (!isTokenValid()) {
        throw new Error('Invalid authentication');
      }

      setIsLoading(true);
      setError(null);
      
      // For students, only fetch assignments for their class
      const params = user?.role === 'student' ? { class: user.class } : {};
      const response = await assignmentsAPI.getAll(params);
      
      if (response.success) {
        // Sort assignments by due date (most recent first)
        const sortedAssignments = (response.data || []).sort((a, b) => 
          new Date(a.dueDate) - new Date(b.dueDate)
        );
        setAssignments(sortedAssignments);
      } else {
        throw new Error(response.message || 'Failed to fetch assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      
      // Check if it's an authentication error
      const isAuthError = error.response?.status === 401 && (
        error.response?.data?.message?.toLowerCase().includes('token') ||
        error.response?.data?.message?.toLowerCase().includes('authentication') ||
        !error.response?.data?.message
      );
      
      if (isAuthError) {
        // Handle authentication error
        logout(true);
      } else {
        // Handle other errors
        setError(error.message || 'Failed to fetch assignments');
        toast.error(error.message || 'Failed to fetch assignments');
        setAssignments([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssignment = () => {
    if (!isTokenValid()) {
      logout(true);
      return;
    }
    setShowAddModal(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!isTokenValid()) {
      logout(true);
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (!confirmDelete) return;

    try {
      const response = await assignmentsAPI.delete(assignmentId);
      
      if (response.success) {
        setAssignments(prev => prev.filter(a => a._id !== assignmentId));
        toast.success('Assignment deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      
      // Check if it's an authentication error
      const isAuthError = error.response?.status === 401 && (
        error.response?.data?.message?.toLowerCase().includes('token') ||
        error.response?.data?.message?.toLowerCase().includes('authentication') ||
        !error.response?.data?.message
      );
      
      if (isAuthError) {
        // Handle authentication error
        logout(true);
      } else {
        // Handle other errors (permission, not found, etc.)
        toast.error(error.message || 'Failed to delete assignment');
      }
    }
  };

  const handleViewAssignment = (assignment) => {
    if (!isTokenValid()) {
      logout(true);
      return;
    }
    setSelectedAssignment(assignment);
  };

  const handleCloseViewModal = () => {
    setSelectedAssignment(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const normalizeClassName = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');

  const formatLabel = (value) =>
    String(value || '')
      .split('-')
      .map((part) => {
        if (part.toLowerCase() === 'a/l') return 'A/L';
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('-');

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesClass =
      selectedClass === 'all' ||
      normalizeClassName(assignment.class) === normalizeClassName(selectedClass);
    const matchesSubject =
      selectedSubject === 'all' ||
      String(assignment.subject || '').toLowerCase() === selectedSubject;

    return matchesClass && matchesSubject;
  });

  const availableClasses = Array.from(new Set(assignments.map((assignment) => assignment.class).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));

  const availableSubjects = Array.from(new Set(assignments.map((assignment) => assignment.subject).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));

  const handleResetFilters = () => {
    setSelectedClass('all');
    setSelectedSubject('all');
  };

  const handleSubmitAssignment = async (assignmentData) => {
    if (!isTokenValid()) {
      logout(true);
      return;
    }

    try {
      // Create assignment using the API
      const response = await assignmentsAPI.create(assignmentData);
      
      if (response.success) {
        setAssignments(prev => [response.data, ...prev]);
        setShowAddModal(false);
        toast.success('Assignment created successfully');
      } else {
        throw new Error(response.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      
      if (error.response?.status === 401) {
        logout(true);
        return;
      }
      
      toast.error(error.message || 'Failed to create assignment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <DocumentPlusIcon className="h-8 w-8 mr-2 text-red-800" />
          Assignments
        </h1>
        {(user?.role === 'staff' || user?.role === 'admin') && (
          <button
            onClick={handleAddAssignment}
            className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center cursor-pointer"
          >
            <DocumentPlusIcon className="h-5 w-5 mr-2" />
            Add Assignment
          </button>
        )}
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <AddAssignment
          onClose={handleCloseAddModal}
          onAdd={handleSubmitAssignment}
        />
      )}

      {/* View Assignment Modal */}
      {selectedAssignment && (
        <AssignmentDetails
          assignment={selectedAssignment}
          onClose={handleCloseViewModal}
        />
      )}

      {/* Assignments list */}
      {(user?.role === 'staff' || user?.role === 'admin') && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg shadow p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter by Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm cursor-pointer"
            >
              <option value="all">All Classes</option>
              {availableClasses.map((className) => (
                <option key={className} value={className}>
                  {formatLabel(className)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Filter by Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((subject) => (
                <option key={subject} value={String(subject).toLowerCase()}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                {(user?.role === 'staff' || user?.role === 'admin') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No assignments found for the selected filters
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                    </td>
                    {(user?.role === 'staff' || user?.role === 'admin') && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assignment.class}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        new Date(assignment.dueDate) < new Date() 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {new Date(assignment.dueDate) < new Date() ? 'Overdue' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewAssignment(assignment)}
                        className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {(user?.role === 'staff' || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Assignments;