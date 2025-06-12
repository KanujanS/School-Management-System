import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  TrashIcon,
  PencilIcon,
  ExclamationCircleIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const AddStaffModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    staffType: 'teaching' // Default to teaching staff
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-red-100/90 to-gray-100/90 backdrop-blur-sm bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Staff Member</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Staff Type</label>
            <select
              name="staffType"
              value={formData.staffType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            >
              <option value="teaching">Teaching Staff</option>
              <option value="support">Support Staff</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-900 rounded-md hover:bg-red-800"
            >
              Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PasswordField = ({ password }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <span className="font-mono">{showPassword ? password : '••••••'}</span>
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-gray-500 hover:text-gray-700"
      >
        {showPassword ? (
          <EyeSlashIcon className="w-5 h-5" />
        ) : (
          <EyeIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authAPI.getAllStaff();
      
      if (response.success && Array.isArray(response.data)) {
        setStaffList(response.data);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError(error.message || 'Failed to fetch staff list');
      toast.error('Failed to fetch staff list');
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStaff = async (staffId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to remove this staff member? This action cannot be undone.'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await authAPI.removeStaff(staffId);
      toast.success('Staff member removed successfully');
      fetchStaffList(); // Refresh the staff list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove staff member');
      console.error('Error removing staff:', error);
    }
  };

  const handleReactivateStaff = async (staffId) => {
    const confirmReactivate = window.confirm(
      'Are you sure you want to reactivate this staff member? They will regain access to the system.'
    );

    if (!confirmReactivate) {
      return;
    }

    try {
      await authAPI.updateStaffStatus(staffId, true);
      toast.success('Staff member reactivated successfully');
      fetchStaffList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reactivate staff member');
      console.error('Error reactivating staff:', error);
    }
  };

  const handleAddStaff = async (staffData) => {
    try {
      await authAPI.createStaff({
        ...staffData,
        role: 'staff',
        isActive: true
      });

      toast.success('Staff member added successfully');
      setShowAddStaffModal(false);
      fetchStaffList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add staff member');
      console.error('Error adding staff:', error);
    }
  };

  const handleUpdateStaff = async (staffId, updatedData) => {
    try {
      await authAPI.updateStaff(staffId, updatedData);
      toast.success('Staff member updated successfully');
      setSelectedStaff(null);
      fetchStaffList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff member');
      console.error('Error updating staff:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            <UserGroupIcon className="w-6 h-6 mr-2 inline-block" />
            Staff Management
          </h1>
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 transition-colors"
          >
            <PlusIcon className="w-4 h-4 inline-block mr-2" />
            Add Staff
          </button>
        </div>

        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStaffList}
            className="mt-2 bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border border-none shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          <UserGroupIcon className="w-6 h-6 mr-2 inline-block" />
          Staff Management
        </h1>
        <button
          onClick={() => setShowAddStaffModal(true)}
          className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 transition-colors"
        >
          <PlusIcon className="w-4 h-4 inline-block mr-2" />
          Add Staff
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffList.map((staff) => (
              <tr key={staff._id} className={!staff.isActive ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {staff.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {staff.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PasswordField password={staff.originalPassword || 'Not available'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {staff.staffType || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    staff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {staff.isActive ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {staff.isActive ? (
                    <button
                      onClick={() => handleRemoveStaff(staff._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Remove Staff"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivateStaff(staff._id)}
                      className="text-green-600 hover:text-green-900"
                      title="Reactivate Staff"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddStaffModal && (
        <AddStaffModal
          onClose={() => setShowAddStaffModal(false)}
          onSubmit={handleAddStaff}
        />
      )}
    </div>
  );
};

export default StaffManagement;