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
      <div className="flex justify-between items-center mb-6 gap-3">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <DocumentPlusIcon className="h-8 w-8 mr-2 text-red-800" />
          Assignments
        </h1>
        {(user?.role === 'staff' || user?.role === 'admin') && (
          <button
            onClick={handleAddAssignment}
            className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center">
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
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No assignments found
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
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
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {(user?.role === 'staff' || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          className="text-red-600 hover:text-red-900"
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