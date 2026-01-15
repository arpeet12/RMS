import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf } from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="bg-white text-gray-800 shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-8">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-wide">
              <span className="text-brand-blue">SAJHA</span>
              <span className="text-brand-red">JOBS</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user?.profilePhotoPath ? (
              <img 
                src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.profilePhotoPath}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-brand-blue object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-blue text-white border-2 border-white flex items-center justify-center">
                <span className="font-bold text-lg">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
            )}
             <span className="font-medium text-gray-700">Welcome, {user?.username || 'Officer'}</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
