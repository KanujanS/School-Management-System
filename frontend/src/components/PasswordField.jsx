import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const PasswordField = ({ password, className = '' }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
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

export default PasswordField; 