import React, { useState } from 'react';
import { FaStar, FaEye, FaBuilding, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const UrgentJobs = ({ jobs }) => {
  const [showAll, setShowAll] = useState(false);

  if (!jobs || jobs.length === 0) return null;

  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${photoPath}`;
  };

  const visibleJobs = showAll ? jobs : jobs.slice(0, 6);

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-8 uppercase">Urgent Employment Opportunities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleJobs.map((job) => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition h-full">
              {/* Image & Badge */}
              <div className="relative h-48 bg-gray-200">
                <div className="absolute top-0 left-4 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-b-md z-10 flex items-center gap-1">
                  <FaStar /> Urgently Hiring
                </div>
                {job.photoPath ? (
                  <img src={getImageUrl(job.photoPath)} alt={job.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {/* Overlay Text if any */}
                {job.country === 'KUWAIT' && (
                  <div className="absolute bottom-4 left-4 bg-white/90 px-2 py-1 text-red-600 font-bold text-lg">
                    {/* Placeholder for localized text if needed */}
                    {job.title}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-brand-blue">
                  {job.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FaBuilding className="text-gray-400" />
                  <span className="truncate">{job.company || 'Company Name'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span className="font-semibold">Salary:</span>
                  <span>{job.salary}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                  <FaEye />
                  <span>{job.views || 0} views</span>
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>

        {jobs.length > 6 && (
            <div className="mt-8 text-center">
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className="flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition"
                >
                    {showAll ? (
                        <>Show Less <FaChevronUp /></>
                    ) : (
                        <>Show More <FaChevronDown /></>
                    )}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default UrgentJobs;
