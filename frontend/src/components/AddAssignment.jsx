import React, { useState, useEffect } from "react";
import { XMarkIcon, DocumentPlusIcon, DocumentIcon } from "@heroicons/react/24/outline";

const AddAssignment = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    class: "",
    totalMarks: 100,
    attachments: [],
  });

  // Predefined list of all classes
  const allClasses = [
    // O/L Classes (Grade 6-11)
    ...[6, 7, 8, 9, 10, 11].flatMap((grade) =>
      ["A", "B", "C", "D", "E", "F"].map((division) => `${grade}${division}`)
    ),
    // A/L Classes with detailed streams
    "AL-Physical Science",
    "AL-Biological Science",
    "AL-Engineering Technology",
    "AL-Bio Technology",
    "AL-Commerce",
    "AL-Arts",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: name === "totalMarks" ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map((file) => ({
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      file: file // Store the actual file object
    }));

    setFormData((prevState) => ({
      ...prevState,
      attachments: [...prevState.attachments, ...fileData],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prevState) => {
      const newAttachments = prevState.attachments.filter((_, i) => i !== index);
      return {
        ...prevState,
        attachments: newAttachments,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      formData.attachments.forEach(attachment => {
        URL.revokeObjectURL(attachment.fileUrl);
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gradient-to-br from-red-50/90 via-red-100/90 to-gray-100/90 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Add New Assignment
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            >
              <option value="">Select Subject</option>

              {/* <!-- Grades 6-11 Subjects --> */}
              <option value="SINHALA">Sinhala (First Language)</option>
              <option value="ENGLISH">English Language</option>
              <option value="MATHEMATICS">Mathematics</option>
              <option value="SCIENCE">Science</option>
              <option value="HISTORY">History</option>
              <option value="BUDDHISM">Buddhism</option>
              <option value="HINDUISM">Hinduism</option>
              <option value="ISLAM">Islam</option>
              <option value="CHRISTIANITY">Christianity</option>
              <option value="GEOGRAPHY">Geography</option>
              <option value="CIVIC_EDUCATION">Civic Education</option>
              <option value="BUSINESS_STUDIES">Business and Accounting Studies</option>
              <option value="ICT">Information and Communication Technology (ICT)</option>
              <option value="AGRICULTURE_TECH">Agriculture and Food Technology</option>
              <option value="HEALTH_PE">Health and Physical Education</option>
              <option value="TAMIL">Second Language (Tamil)</option>
              <option value="SINHALA_2ND">Second Language (Sinhala)</option>
              <option value="ART">Art</option>
              <option value="MUSIC">Music</option>
              <option value="DANCE">Dance</option>
              <option value="DRAMA">Drama</option>

              {/* <!-- A/L Arts Stream --> */}
              <option value="SINHALA_LIT">Sinhala Literature</option>
              <option value="ENGLISH_LIT">English Literature</option>
              <option value="HISTORY_AL">History</option>
              <option value="GEOGRAPHY_AL">Geography</option>
              <option value="POLITICAL_SCIENCE">Political Science</option>
              <option value="LOGIC_METHOD">Logic and Scientific Method</option>
              <option value="ECONOMICS">Economics</option>
              <option value="BUDDHISM_AL">Buddhism (A/L)</option>
              <option value="HINDUISM_AL">Hinduism (A/L)</option>
              <option value="ISLAM_AL">Islam (A/L)</option>
              <option value="CHRISTIANITY_AL">Christianity (A/L)</option>
              <option value="ART_AL">Art (A/L)</option>
              <option value="MUSIC_AL">Music (A/L)</option>
              <option value="DANCE_AL">Dance (A/L)</option>
              <option value="DRAMA_AL">Drama (A/L)</option>
              <option value="MEDIA">Media Studies</option>
              <option value="IT_ARTS">Information Technology (Arts)</option>

              {/* <!-- A/L Commerce Stream --> */}
              <option value="BUSINESS_STUDIES_AL">Business Studies</option>
              <option value="ACCOUNTING">Accounting</option>
              <option value="ECONOMICS_AL">Economics (Commerce)</option>
              <option value="IT_COMMERCE">Information Technology (Commerce)</option>
              <option value="ENTREPRENEURSHIP">Entrepreneurship Studies</option>

              {/* <!-- A/L Physical Science Stream --> */}
              <option value="PHYSICS">Physics</option>
              <option value="CHEMISTRY">Chemistry</option>
              <option value="COMBINED_MATHS">Combined Mathematics</option>
              <option value="IT_PHYSICAL">Information Technology (Physical)</option>

              {/* <!-- A/L Biological Science Stream --> */}
              <option value="BIOLOGY">Biology</option>
              <option value="AGRICULTURE">Agriculture (Biological)</option>

              {/* A/L Technology Stream  */}
              <option value="SCIENCE_FOR_TECH">Science for Technology</option>
              <option value="ENG_TECH">Engineering Technology</option>
              <option value="BIO_SYSTEMS">Bio-systems Technology</option>
              <option value="ICT_TECH">Information and Communication Technology (Technology)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Class
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            >
              <option value="">Select Class</option>
              {allClasses.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Marks
            </label>
            <input
              type="number"
              name="totalMarks"
              value={formData.totalMarks}
              onChange={handleChange}
              required
              min="0"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-900 focus:ring-red-900 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attachments
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-red-900 hover:text-red-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-900"
                  >
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX up to 10MB each
                </p>
              </div>
            </div>

            {/* Display attached files */}
            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{file.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-900 hover:text-red-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
