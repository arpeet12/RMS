import React from 'react';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ZeroCostJobs = ({ jobs }) => {
  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2 uppercase">Zero Cost Recruitment Opportunities</h2>
        <p className="text-gray-500 mb-12 max-w-3xl mx-auto">
          There is no need to pay any fee to go for foreign employment in these demands. The employer of the respective country bears all the expenses of the workers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {jobs.map((job) => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex gap-4 hover:shadow-md transition h-full">
               <div className="w-16 h-16 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center text-green-600 font-bold text-xl">
                  {/* Logo Placeholder */}
                  {job.company ? job.company.substring(0, 2).toUpperCase() : 'ZC'}
               </div>
               
               <div className="flex-grow">
                 <h3 className="font-bold text-gray-800 text-sm mb-2 group-hover:text-brand-blue">
                   Absolutely Zero Cost Recruitment Opportunity for {job.country}!!
                 </h3>
                 
                 <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-gray-400" /> {job.country}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" /> {job.deadline}
                    </div>
                    <div className="font-semibold text-gray-700">
                      {job.currency || 'Nrs.'} {job.salary} per month
                    </div>
                 </div>

                 <div className="flex items-center justify-between mt-4">
                    <button className="text-brand-blue border border-brand-blue px-3 py-1 rounded text-xs font-semibold group-hover:bg-brand-blue group-hover:text-white transition uppercase">
                      Apply Now
                    </button>
                 </div>
                 
                 <div className="text-xs text-gray-400 mt-2">
                   Required: {job.vacancyCount} | Views: {job.views || 0}
                 </div>
               </div>
            </div>
            </Link>
          ))}
        </div>
        
        <div className="text-right mt-8">
            <a href="/jobs?type=zero-cost" className="text-brand-blue font-semibold hover:underline">See all zero cost demands &gt;</a>
        </div>
      </div>
    </div>
  );
};

export default ZeroCostJobs;
