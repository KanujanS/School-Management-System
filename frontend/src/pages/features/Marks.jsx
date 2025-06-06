import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockData';
import {
  AcademicCapIcon,
  PencilSquareIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Marks = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingMark, setEditingMark] = useState(null);

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const data = await mockApi.getMarks(user.role, user.id);
        setMarks(data || []);
      } catch (error) {
        console.error('Error fetching marks:', error);
      }
    };

    fetchMarks();
  }, [user.role, user.id]);

  const handleEditMark = (mark) => {
    setEditingMark(mark);
    setIsEditing(true);
  };

  const handleSaveMark = async (markId, newValue) => {
    try {
      // In a real app, this would make an API call to update the mark
      const updatedMarks = marks.map((mark) =>
        mark.id === markId ? { ...mark, value: newValue } : mark
      );
      setMarks(updatedMarks);
      setIsEditing(false);
      setEditingMark(null);
    } catch (error) {
      console.error('Error updating mark:', error);
    }
  };

  const filteredMarks = marks.filter((mark) => {
    const subjectMatch = selectedSubject === 'all' || mark.subject === selectedSubject;
    const termMatch = selectedTerm === 'all' || mark.term === selectedTerm;
    return subjectMatch && termMatch;
  });

  const getGradeColor = (value) => {
    if (value >= 75) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateAverage = (marks) => {
    if (marks.length === 0) return 0;
    const sum = marks.reduce((acc, mark) => acc + mark.value, 0);
    return (sum / marks.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marks</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user.role === 'staff'
                ? 'Manage and track student marks'
                : 'View your academic performance'}
            </p>
          </div>
          {filteredMarks.length > 0 && (
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Average: {calculateAverage(filteredMarks)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Terms</option>
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Marks List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Term
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mark (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                {user.role === 'staff' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMarks.map((mark) => (
                <tr key={mark.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {mark.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{mark.term}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing && editingMark?.id === mark.id ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingMark.value}
                        onChange={(e) =>
                          setEditingMark({ ...editingMark, value: Number(e.target.value) })
                        }
                        onBlur={() => handleSaveMark(mark.id, editingMark.value)}
                        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <div className={`text-sm ${getGradeColor(mark.value)}`}>
                        {mark.value}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mark.value >= 75
                          ? 'bg-green-100 text-green-800'
                          : mark.value >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {mark.value >= 75
                        ? 'Excellent'
                        : mark.value >= 50
                        ? 'Pass'
                        : 'Needs Improvement'}
                    </span>
                  </td>
                  {user.role === 'staff' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditMark(mark)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
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
      {filteredMarks.length === 0 && (
        <div className="text-center py-12">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No marks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedSubject !== 'all' || selectedTerm !== 'all'
              ? 'Try changing your filter selection'
              : 'No marks have been recorded yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Marks; 