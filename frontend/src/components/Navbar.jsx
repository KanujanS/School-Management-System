import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import schoolLogo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();

  const navigation = user
    ? [
        { name: 'Dashboard', href: `/${user?.role}` },
        { name: 'Assignments', href: '/assignments' },
        { name: 'Attendance', href: '/attendance' },
        { name: 'Marks', href: '/marks' },
        { name: 'Notifications', href: '/notifications' },
      ]
    : [];

  return (
    <>
      <Disclosure as="nav" className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                {/* Logo Section */}
                <div className="flex-shrink-0">
                  <Link className="flex items-center">
                    <img className="h-10 w-auto" src={schoolLogo} alt="School Logo" />
                    <span className="ml-2 text-lg font-bold text-red-900">
                      Mahiyangana National School
                    </span>
                  </Link>
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-800">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex sm:flex-1 sm:justify-center">
                  <div className="flex space-x-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-800 hover:bg-gray-100 rounded-md transition-colors duration-150"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* User Menu */}
                {user && (
                  <div className="hidden sm:flex sm:items-center">
                    <button
                      onClick={logout}
                      className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-800 hover:bg-gray-100 rounded-md transition-colors duration-150"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-800 hover:bg-gray-100 rounded-md"
                  >
                    {item.name}
                  </Link>
                ))}
                {user && (
                  <button
                    onClick={logout}
                    className="mt-2 block w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-red-800 hover:bg-gray-100 rounded-md text-left"
                  >
                    Logout
                  </button>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      {/* Spacer div to prevent content from going under navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar; 