import React, { useState } from 'react';
import { XMarkIcon, DocumentIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

const AssignmentDetails = ({ assignment, onClose }) => {
  const [downloadingFiles, setDownloadingFiles] = useState({});

  const handleDownload = async (fileUrl, fileName) => {
    try {
      setDownloadingFiles(prev => ({ ...prev, [fileUrl]: true }));

      // Ensure we're using the correct URL format
      const baseUrl = 'http://localhost:5002';
      const downloadUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;

      console.log('Downloading file from:', downloadUrl);

      // Make the request to download the file
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to download file: ${response.statusText}`);
      }

      // Get the content disposition header to get the filename
      const contentDisposition = response.headers.get('content-disposition');
      const serverFileName = contentDisposition
        ? decodeURIComponent(contentDisposition.split('filename=')[1].replace(/"/g, ''))
        : fileName;

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', serverFileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(error.message || 'Failed to download file. Please try again.');
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [fileUrl]: false }));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-red-100/90 to-gray-100/90 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Assignment Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title and Subject */}
          <div>
            <h4 className="text-xl font-medium text-gray-900">{assignment.title}</h4>
            <p className="text-sm text-gray-500">{assignment.subject}</p>
          </div>

          {/* Description */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
            <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
              {assignment.description}
            </p>
          </div>

          {/* Class and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Class</h5>
              <p className="text-sm text-gray-600">{assignment.class}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Due Date</h5>
              <p className="text-sm text-gray-600">
                {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Total Marks */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Total Marks</h5>
            <p className="text-sm text-gray-600">{assignment.totalMarks}</p>
          </div>

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments</h5>
              <div className="space-y-2">
                {assignment.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Added {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(attachment.fileUrl, attachment.fileName)}
                      disabled={downloadingFiles[attachment.fileUrl]}
                      className={`ml-4 flex-shrink-0 text-sm font-medium ${
                        downloadingFiles[attachment.fileUrl]
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-900 hover:text-red-800'
                      }`}
                    >
                      {downloadingFiles[attachment.fileUrl] ? (
                        <span className="inline-flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Downloading...
                        </span>
                      ) : (
                        'Download'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Created By and Date */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Created by {assignment.createdBy?.name}</span>
              <span>
                on {new Date(assignment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails; 