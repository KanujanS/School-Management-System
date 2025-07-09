import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import schoolLogo from '../../assets/logo.png';

// Define available classes
const AVAILABLE_CLASSES = [
  // Grade 6
  { value: '6A', label: 'Grade 6A' },
  { value: '6B', label: 'Grade 6B' },
  { value: '6C', label: 'Grade 6C' },
  { value: '6D', label: 'Grade 6D' },
  { value: '6E', label: 'Grade 6E' },
  { value: '6F', label: 'Grade 6F' },
  // Grade 7
  { value: '7A', label: 'Grade 7A' },
  { value: '7B', label: 'Grade 7B' },
  { value: '7C', label: 'Grade 7C' },
  { value: '7D', label: 'Grade 7D' },
  { value: '7E', label: 'Grade 7E' },
  { value: '7F', label: 'Grade 7F' },
  // Grade 8
  { value: '8A', label: 'Grade 8A' },
  { value: '8B', label: 'Grade 8B' },
  { value: '8C', label: 'Grade 8C' },
  { value: '8D', label: 'Grade 8D' },
  { value: '8E', label: 'Grade 8E' },
  { value: '8F', label: 'Grade 8F' },
  // Grade 9
  { value: '9A', label: 'Grade 9A' },
  { value: '9B', label: 'Grade 9B' },
  { value: '9C', label: 'Grade 9C' },
  { value: '9D', label: 'Grade 9D' },
  { value: '9E', label: 'Grade 9E' },
  { value: '9F', label: 'Grade 9F' },
  // Grade 10
  { value: '10A', label: 'Grade 10A' },
  { value: '10B', label: 'Grade 10B' },
  { value: '10C', label: 'Grade 10C' },
  { value: '10D', label: 'Grade 10D' },
  { value: '10E', label: 'Grade 10E' },
  { value: '10F', label: 'Grade 10F' },
  // Grade 11
  { value: '11A', label: 'Grade 11A' },
  { value: '11B', label: 'Grade 11B' },
  { value: '11C', label: 'Grade 11C' },
  { value: '11D', label: 'Grade 11D' },
  { value: '11E', label: 'Grade 11E' },
  { value: '11F', label: 'Grade 11F' },
  // Grade A/L
  { value: 'Physical Science', label: 'Grade Physical Science' },
  { value: 'Biological Science', label: 'Grade Biological Science' },
  { value: 'Commerce', label: 'Grade Commerce' },
  { value: 'Arts', label: 'Grade Arts' },
  { value: 'Bio Technology', label: 'Grade Bio Technology' },
  { value: 'Engineering Technology', label: 'Grade Engineering Technology' },
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    class: '', // Added class field for students
    studentId: '' // Added studentId field for students
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.role === 'student' && !formData.class) {
      toast.error('Class is required for students');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare registration data
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'student' && {
          class: formData.class,
          studentId: formData.studentId
        })
      };

      // Call the registration API
      await authAPI.register(registrationData);
      
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-gray-100">
      <div className="max-w-md w-5/6 sm:w-1/2 space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div>
          <img
            className="mx-auto h-24 w-auto"
            src={schoolLogo}
            alt="Mahiyangana National College"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-900 focus:border-red-900 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-900 focus:border-red-900 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-900 focus:border-red-900 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-900 focus:border-red-900 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-900 focus:border-red-900 focus:z-10 sm:text-sm [&>option]:bg-red-900 [&>option]:text-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formData.role === 'student' && (
              <>
                <div>
                  <label htmlFor="class" className="sr-only">
                    Class
                  </label>
                  <select
                    id="class"
                    name="class"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-900 focus:border-red-900 focus:z-10 sm:text-sm"
                    value={formData.class}
                    onChange={handleChange}
                  >
                    <option value="">Select your class</option>
                    {AVAILABLE_CLASSES.map((classOption) => (
                      <option key={classOption.value} value={classOption.value}>
                        {classOption.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="studentId" className="sr-only">
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-900 focus:border-red-900 focus:z-10 sm:text-sm"
                    placeholder="Student ID (optional)"
                    value={formData.studentId}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-900 transition-all duration-200 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              to="/login"
              className="font-medium text-red-900 hover:text-red-800"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 