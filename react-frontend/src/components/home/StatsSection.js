import React from 'react';

const StatsSection = () => {
  const stats = [
    { label: "Jobs Available", value: "87", color: "text-gray-800" },
    { label: "Companies Hiring", value: "53", color: "text-gray-800" },
    { label: "Users", value: "1082406", color: "text-gray-800" },
    { label: "Candidates Applied", value: "9095", color: "text-gray-800" },
  ];

  return (
    <div className="bg-blue-50 py-16 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-200/50">
          {stats.map((stat, index) => (
            <div key={index} className="p-4">
              <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2 tracking-tight`}>
                {stat.value}
              </div>
              <div className="text-gray-500 font-medium uppercase tracking-wide text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
