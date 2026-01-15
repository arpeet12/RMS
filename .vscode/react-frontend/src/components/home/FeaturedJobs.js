import React from 'react';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FeaturedJobs = ({ jobs }) => {
  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-light text-gray-700 mb-2 uppercase">Featured Jobs</h2>
        <p className="text-gray-500 mb-12">Speed up your job search with our android app Baideshik Rojgar</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md transition h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-brand-blue font-bold text-xl">
                  {/* Logo Placeholder */}
                  {job.company ? job.company.substring(0, 2).toUpperCase() : 'CO'}
                </div>
                {/* Apply Button */}
                <button className="text-brand-blue border border-brand-blue px-4 py-1 rounded text-sm font-semibold group-hover:bg-brand-blue group-hover:text-white transition">
                  APPLY NOW
                </button>
              </div>

              <h3 className="font-bold text-gray-800 mb-1 group-hover:text-brand-blue">{job.company}</h3>
              <p className="text-sm text-gray-500 mb-4">Free Visa Free Ticket</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <span>{job.country}</span>
                  <span className="text-gray-300">|</span>
                  <FaCalendarAlt className="text-gray-400" />
                  <span>{job.deadline}</span>
                </div>
                
                <div className="font-semibold">
                  {job.currency || 'Nrs.'} {job.salary} / per month
                </div>
                
                <div className="text-brand-blue font-medium text-xs uppercase">
                  {job.company} <FaStar className="inline text-yellow-400" />
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t border-gray-50 mt-2">
                  <div>Required: {job.vacancyCount}</div>
                  <div>Lot No: {job.lotNo || 'N/A'}</div>
                  <div>Views: {job.views || 0} | Applied: 100+</div>
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedJobs;
