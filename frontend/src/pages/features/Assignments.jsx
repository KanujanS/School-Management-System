import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockData';
import {
  DocumentPlusIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import AddAssignment from '../../components/AddAssignment';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // If user is a student, fetch their class information first
        let studentClass = null;
        if (user.role === 'student') {
          const studentDetails = await mockApi.getStudentDetails(user.id);
          setStudentData(studentDetails);
          studentClass = studentDetails?.class;
        }

        // Fetch assignments
        const data = await mockApi.getAssignments(user.role, user.id);
        
        // Filter assignments based on user role and class
        const filteredAssignments = user.role === 'student' 
          ? data.filter(assignment => assignment.class === studentClass)
          : data;

        setAssignments(filteredAssignments);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.role, user.id]);

  const handleAddAssignment = () => {
    setShowAddModal(true);
  };

  const handleAddNewAssignment = (newAssignment) => {
    setAssignments(prevAssignments => [newAssignment, ...prevAssignments]);
  };

  const handleDelete = (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter((a) => a.id !== assignmentId));
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user.role === 'staff' || user.role === 'admin'
                ? 'Manage class assignments'
                : `View assignments for ${studentData?.class || 'your class'}`}
            </p>
          </div>
          {(user.role === 'staff' || user.role === 'admin') && (
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
                {(user.role === 'staff' || user.role === 'admin') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
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
                      {assignment.assignedBy}
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
                  {(user.role === 'staff' || user.role === 'admin') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-900 hover:text-red-800"
                        title="Delete Assignment"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {assignments.length === 0 && (
        <div className="text-center py-12">
          <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No assignments found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {user.role === 'staff' || user.role === 'admin'
              ? 'Get started by creating a new assignment'
              : `No assignments have been assigned for ${studentData?.class || 'your class'}`}
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
    </div>
  );
};

export default Assignments; 