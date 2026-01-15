import React from 'react';
import { FaChevronRight, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RecentJobsAndCategories = ({ jobs = [] }) => {
  // Use passed jobs or fallback to empty array. 
  // Sort by id descending (assuming higher ID = newer) or just take first few if already sorted.
  const displayJobs = [...jobs].sort((a, b) => b.id - a.id).slice(0, 5);

  const categories = [
    { id: 1, name: "Hotel / Restaurant / Cafe", count: 20 },
    { id: 2, name: "Construction & Real Estate", count: 14 },
    { id: 3, name: "General Worker", count: 13 },
    { id: 4, name: "Cleaning", count: 12 },
    { id: 5, name: "Hotel & Hospitality", count: 11 },
    { id: 6, name: "Safety / Security", count: 10 },
    { id: 7, name: "Labour", count: 9 }
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Recent Jobs Column */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-600 uppercase">RECENT JOBS</h2>
              <div className="h-1 w-20 bg-brand-blue mx-auto mt-2 rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              {displayJobs.map((job) => (
                <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
                <div className="flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-brand-blue rounded text-white flex items-center justify-center">
                      <FaChevronRight className="text-sm" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-gray-800 group-hover:text-brand-blue transition-colors">
                      {job.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="uppercase tracking-wide text-xs font-semibold">{job.country}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span>{job.deadline}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="inline-flex items-center gap-1">
                        {job.company}
                        {job.isVerified && <FaStar className="text-brand-yellow text-xs" />}
                      </span>
                    </div>
                  </div>
                </div>
                </Link>
              ))}
              {displayJobs.length === 0 && <p className="text-center text-gray-500">No recent jobs found.</p>}
            </div>
            
            <div className="mt-6 text-right">
              <Link to="/jobs" className="text-brand-blue font-semibold hover:underline text-sm">
                View All Recent Jobs &rarr;
              </Link>
            </div>
          </div>

          {/* Jobs Categories Column */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-600 uppercase">JOBS CATEGORIES</h2>
              <div className="h-1 w-20 bg-brand-blue mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="space-y-3">
              {categories.map((cat, index) => (
                <Link 
                  key={cat.id} 
                  to={`/jobs?category=${cat.name}`}
                  className="flex justify-between items-center p-4 border border-gray-100 rounded bg-gray-50 hover:bg-white hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-400 group-hover:text-brand-blue w-6">{index + 1}.</span>
                    <span className="text-gray-700 font-medium group-hover:text-brand-blue">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-400 group-hover:text-brand-blue">{cat.count}</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-right">
               <Link to="/jobs" className="text-brand-blue font-semibold hover:underline text-sm">
                View All Categories &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecentJobsAndCategories;
