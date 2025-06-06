import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockData';
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await mockApi.getAttendance(user.role, user.id, selectedDate);
        setAttendance(data || []);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    fetchAttendance();
  }, [user.role, user.id, selectedDate]);

  const handleMarkAttendance = async (studentId, status) => {
    try {
      // In a real app, this would make an API call to update attendance
      const updatedAttendance = attendance.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      );
      setAttendance(updatedAttendance);
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    if (filter === 'all') return true;
    if (filter === 'present') return record.status === 'present';
    if (filter === 'absent') return record.status === 'absent';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600';
      case 'absent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user.role === 'staff'
                ? 'Manage and track student attendance'
                : 'View your attendance records'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('present')}
            className={`px-4 py-2 rounded-md ${
              filter === 'present'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={`px-4 py-2 rounded-md ${
              filter === 'absent'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Absent
          </button>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {user.role === 'staff' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.studentName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{record.class}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status === 'present' ? (
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 mr-1" />
                      )}
                      {record.status}
                    </span>
                  </td>
                  {user.role === 'staff' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            handleMarkAttendance(record.studentId, 'present')
                          }
                          className="text-green-600 hover:text-green-900"
                          title="Mark Present"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleMarkAttendance(record.studentId, 'absent')
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Mark Absent"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAttendance.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No attendance records found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== 'all'
              ? 'Try changing your filter selection'
              : 'No attendance records for the selected date'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Attendance; 