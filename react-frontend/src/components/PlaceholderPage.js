import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const PlaceholderPage = ({ title }) => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
        <p className="text-gray-500">This feature is coming soon.</p>
      </div>
    </DashboardLayout>
  );
};

export default PlaceholderPage;
