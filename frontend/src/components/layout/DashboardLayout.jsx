import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'; // Heroicons v2 imports

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow-md fixed top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Hamburger Menu for Small Screens */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
              >
                {isSidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
              {/* Branding/Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="text-xl font-bold">
                  StartupHub
                </Link>
              </div>
            </div>
            {/* Right Side of Navbar (e.g., User Profile) */}
            <div className="flex items-center">
              <span className="text-sm">User Name</span>
              {/* Add more navbar items here if needed */}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside
          className={`bg-gray-800 text-white fixed top-16 bottom-0 z-10 transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static
            ${isSidebarOpen || 'lg:block'} 
            w-64 md:w-56 lg:w-64
            overflow-y-auto shadow-lg`}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Menu</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 rounded-md hover:bg-gray-700"
                  onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click (mobile)
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/startups/create"
                  className="block px-4 py-2 rounded-md hover:bg-gray-700"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Create Startup
                </Link>
              </li>
              <li>
                <Link
                  to="/startups"
                  className="block px-4 py-2 rounded-md hover:bg-gray-700"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  My Startups
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="block px-4 py-2 rounded-md hover:bg-gray-700"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/logout"
                  className="block px-4 py-2 rounded-md hover:bg-gray-700"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out bg-gray-100 min-h-screen
            ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64 md:ml-56'}
            ${isSidebarOpen && 'ml-64'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet /> {/* Renders child routes (e.g., StartupCreation) */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;