import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AddAssignment = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    class: '',
  });

  // Predefined list of all classes
  const allClasses = [
    // O/L Classes (Grade 6-11)
    ...[6, 7, 8, 9, 10, 11].flatMap(grade => 
      ['A', 'B', 'C', 'D', 'E', 'F'].map(division => `Grade ${grade}-${division}`)
    ),
    // A/L Classes with detailed streams
    'A/L Physical Science',
    'A/L Biological Science',
    'A/L Bio Technology',
    'A/L Engineering Technology',
    'A/L Commerce',
    'A/L Arts'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAssignment = {
      id: Date.now(),
      ...formData,
      assignedBy: 'Admin User',
      createdAt: new Date().toISOString().split('T')[0]
    };
    onAdd(newAssignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-red-100/90 to-gray-100/90 backdrop-blur-sm"></div>
      
      <div className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Assignment</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            >
              <option value="">Select Subject</option>
              
              <optgroup label="Ordinary Level Subjects">
                <option value="Sinhala">Sinhala</option>
                <option value="English Language">English Language</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Buddhism">Buddhism</option>
                <option value="Hinduism">Hinduism</option>
                <option value="Islam">Islam</option>
                <option value="Christianity">Christianity</option>
                <option value="Geography">Geography</option>
                <option value="Civic Education">Civic Education</option>
                <option value="Business and Accounting Studies">Business and Accounting Studies</option>
                <option value="ICT">Information and Communication Technology</option>
                <option value="Agriculture and Food Technology">Agriculture and Food Technology</option>
                <option value="Health and Physical Education">Health and Physical Education</option>
                <option value="Tamil">Second Language Tamil</option>
                <option value="Art">Aesthetic Studies - Art</option>
                <option value="Music">Aesthetic Studies - Music</option>
                <option value="Dance">Aesthetic Studies - Dance</option>
                <option value="Drama">Aesthetic Studies - Drama</option>
              </optgroup>

              <optgroup label="A/L Arts Stream">
                <option value="Sinhala Literature">Sinhala Literature</option>
                <option value="English Literature">English Literature</option>
                <option value="History AL">History</option>
                <option value="Geography AL">Geography</option>
                <option value="Political Science">Political Science</option>
                <option value="Logic and Scientific Method">Logic and Scientific Method</option>
                <option value="Economics Arts">Economics</option>
                <option value="Buddhism AL">Buddhism</option>
                <option value="Christianity AL">Christianity</option>
                <option value="Art AL">Aesthetic Studies - Art</option>
                <option value="Music AL">Aesthetic Studies - Music</option>
                <option value="Dance AL">Aesthetic Studies - Dance</option>
                <option value="Drama AL">Aesthetic Studies - Drama</option>
                <option value="Media Studies">Media Studies</option>
                <option value="IT Arts">Information Technology</option>
              </optgroup>

              <optgroup label="A/L Commerce Stream">
                <option value="Business Studies">Business Studies</option>
                <option value="Accounting">Accounting</option>
                <option value="Economics Commerce">Economics</option>
                <option value="IT Commerce">Information Technology</option>
                <option value="Entrepreneurship Studies">Entrepreneurship Studies</option>
              </optgroup>

              <optgroup label="A/L Science Stream">
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Combined Mathematics">Combined Mathematics</option>
                <option value="Agriculture Science">Agriculture</option>
                <option value="IT Science">Information Technology</option>
              </optgroup>

              <optgroup label="A/L Technology Stream">
                <option value="Science for Technology">Science for Technology</option>
                <option value="Engineering Technology">Engineering Technology</option>
                <option value="Bio-systems Technology">Bio-systems Technology</option>
                <option value="ICT Technology">Information and Communication Technology</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            >
              <option value="">Select Class</option>
              <optgroup label="Ordinary Level">
                {allClasses
                  .filter(className => className.startsWith('Grade'))
                  .map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
              </optgroup>
              <optgroup label="Advanced Level">
                {allClasses
                  .filter(className => className.startsWith('A/L'))
                  .map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800"
            >
              Add Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssignment;
