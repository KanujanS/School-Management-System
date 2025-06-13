import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { marksAPI } from "../services/api";
import toast from "react-hot-toast";

const AddMarks = ({ onClose, onAdd, selectedClass: initialClass }) => {
  const [formData, setFormData] = useState({
    class: initialClass || "",
    term: "",
    studentName: "",
    indexNumber: ""
  });

  const [subjectMarks, setSubjectMarks] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.class) {
      updateAvailableSubjects();
    }
  }, [formData.class]);

  // Predefined list of subjects by category
  const subjects = {
    ordinaryLevel: [
      "Sinhala",
      "English Language",
      "Mathematics",
      "Science",
      "History",
      "Buddhism",
      "Hinduism",
      "Islam",
      "Christianity",
      "Geography",
      "Civic Education",
      "Business and Accounting Studies",
      "Information and Communication Technology",
      "Agriculture and Food Technology",
      "Health and Physical Education",
      "Second Language Tamil",
      "Aesthetic Studies - Art",
      "Aesthetic Studies - Music",
      "Aesthetic Studies - Dance",
      "Aesthetic Studies - Drama",
    ],
    physicalscience: [
      "Physics",
      "Chemistry",
      "Combined Mathematics",
      "Information Technology",
      "General English",
    ],
    biologicalscience: [
      "Biology",
      "Physics",
      "Chemistry",
      "Information Technology",
      "General English",
    ],
    biotechnology: [
      "Biology",
      "Science for Technology",
      "Engineering Technology",
      "Information Technology",
      "General English",
    ],
    engineeringtechnology: [
      "Engineering Technology",
      "Science for Technology",
      "Information Technology",
      "General English",
    ],
    commerce: [
      "Business Studies",
      "Accounting",
      "Economics",
      "Information Technology",
      "General English",
    ],
    arts: [
      "Logic and Scientific Method",
      "Geography",
      "Political Science",
      "Economics",
      "History",
      "Information Technology",
      "General English",
    ],
  };

  // Terms
  const terms = ["Term 1", "Term 2", "Term 3"];

  useEffect(() => {
    if (formData.class) {
      updateAvailableSubjects();
    }
  }, [formData.class]);

  // Predefined list of all classes
  const allClasses = [
    // O/L Classes (Grade 6-11)
    ...[6, 7, 8, 9, 10, 11].flatMap((grade) =>
      ["A", "B", "C", "D", "E", "F"].map(
        (division) => `Grade-${grade}-${division}`
      )
    ),
    // A/L Classes with detailed streams
    "A/L-Physical-Science",
    "A/L-Biological-Science",
    "A/L-Bio-Technology",
    "A/L-Engineering-Technology",
    "A/L-Commerce",
    "A/L-Arts",
  ];

  const updateAvailableSubjects = () => {
    let newSubjects = [];

    if (!formData.class) {
      setAvailableSubjects([]);
      return;
    }

    if (formData.class.startsWith("A/L-")) {
      // Remove A/L- prefix and convert to lowercase without hyphens
      const stream = formData.class
        .replace("A/L-", "")
        .toLowerCase()
        .replace(/-/g, "");
      
      console.log('Selected stream:', stream);
      
      if (subjects[stream]) {
        newSubjects = subjects[stream];
      } else {
        console.error(`Unknown stream: ${stream}`);
        toast.error(`Unknown stream: ${stream}`);
        return;
      }
    } else {
      newSubjects = subjects.ordinaryLevel;
    }

    setAvailableSubjects(newSubjects);
  };

  const handleClassChange = (event) => {
    const newClass = event.target.value;
    setFormData({ ...formData, class: newClass });
    if (newClass) {
      updateAvailableSubjects();
    }
  };

  const handleAddMarks = async () => {
    try {
      // Validate required fields
      if (!formData.studentName || !formData.indexNumber || !formData.class || !formData.term) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate subjects
      if (subjectMarks.length === 0) {
        toast.error('Please add at least one subject mark');
        return;
      }

      // Validate each subject mark
      for (const mark of subjectMarks) {
        if (!mark.subject || typeof mark.marks !== 'number' || mark.marks < 0 || mark.marks > 100) {
          toast.error('Each subject must have a name and marks between 0 and 100');
          return;
        }
      }

      setLoading(true);
      
      // Prepare the marks data in the expected format
      const marksData = {
        studentName: formData.studentName.trim(),
        indexNumber: formData.indexNumber.trim(),
        class: formData.class.replace(/\s+/g, '-'),  // Normalize class name
        term: formData.term,
        subjects: subjectMarks.map(mark => ({
          subject: mark.subject,
          marks: Number(mark.marks),
          totalMarks: 100
        })),
        academicYear: new Date().getFullYear().toString()
      };

      const response = await marksAPI.create(marksData);
      
      if (response.success) {
        toast.success('Marks added successfully');
        onAdd(response.data);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to add marks');
      }
    } catch (error) {
      console.error('Error adding marks:', error);
      toast.error(error.message || 'Failed to add marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md sm:max-w-2xl p-4 sm:p-6 m-2 sm:m-4 h-[90vh] sm:h-[80vh] flex flex-col">
        <div className="flex-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Add Marks</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select
                value={formData.class}
                onChange={handleClassChange}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select class</option>
                {allClasses.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Term</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select term</option>
                {terms.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Student Name</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Index Number</label>
              <input
                type="text"
                value={formData.indexNumber}
                onChange={(e) => setFormData({ ...formData, indexNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                placeholder="Enter index number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subjects</label>
              <div className="space-y-2">
                {availableSubjects.length > 0 ? (
                  availableSubjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Marks"
                        min="0"
                        max="100"
                        className="w-24 sm:w-32 px-2 py-1 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onChange={(e) => {
                          const marks = [...subjectMarks];
                          const index = marks.findIndex((m) => m.subject === subject);
                          if (index !== -1) {
                            marks[index] = { ...marks[index], marks: parseInt(e.target.value) };
                          } else {
                            marks.push({ subject, marks: parseInt(e.target.value) });
                          }
                          setSubjectMarks(marks);
                        }}
                      />
                      <span>{subject}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Select a class to view subjects</p>
                )}
              </div>
            </div>
          </form>
        </div>
        <div className="flex-0 mt-4">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddMarks}
              disabled={loading}
              className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <CircularProgress size={20} className="mr-2" />
                  Adding...
                </span>
              ) : (
                'Add Marks'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMarks;
