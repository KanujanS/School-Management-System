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

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = user?.role === 'student' ? { class: user.class } : {};
      const response = await assignmentsAPI.getAll(params);
      if (response.success) {
        setAssignments(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError(error.message || 'Failed to fetch assignments');
      toast.error(error.message || 'Failed to fetch assignments');
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAssignment = () => {
    setShowAddModal(true);
  };

  const handleAddNewAssignment = async (assignmentData) => {
    try {
      const response = await assignmentsAPI.create(assignmentData);
      if (response.success) {
        setAssignments(prevAssignments => [response.data, ...prevAssignments]);
        setShowAddModal(false);
        toast.success('Assignment created successfully');
      } else {
        throw new Error(response.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast.error(error.message || 'Failed to create assignment');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentsAPI.delete(assignmentId);
        setAssignments(prevAssignments => prevAssignments.filter((a) => a._id !== assignmentId));
        toast.success('Assignment deleted successfully');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error(error.message);
      }
    }
  };

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-800 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">Error loading assignments: {error}</p>
          <button 
            onClick={fetchAssignments}
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'staff' || user?.role === 'admin'
                ? 'Manage class assignments'
                : `View assignments for ${user?.class || 'your class'}`}
            </p>
          </div>
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <button
              onClick={handleAddAssignment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800"
            >
              <DocumentPlusIcon className="h-5 w-5 mr-2" />
              Create Assignment
            </button>
          )}
        </div>
      </div>

      {/* Assignments List */}
      {assignments && assignments.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title & Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {assignment.class}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {assignment.createdBy?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(assignment)}
                        className="text-red-900 hover:text-red-800 inline-flex items-center"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {(user?.role === 'staff' || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="text-red-900 hover:text-red-800 inline-flex items-center"
                          title="Delete Assignment"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No assignments found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'staff' || user?.role === 'admin'
              ? 'Get started by creating a new assignment'
              : `No assignments have been assigned for ${user?.class || 'your class'}`}
          </p>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddModal && (
        <AddAssignment
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddNewAssignment}
        />
      )}

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <AssignmentDetails
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
};

export default Assignments; 