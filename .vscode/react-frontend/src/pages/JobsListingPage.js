import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { jobsAPI } from '../services/api';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaBuilding } from 'react-icons/fa';

const JobsListingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const countryFilter = queryParams.get("country");
  const typeFilter = queryParams.get("type"); // e.g. zero-cost

  useEffect(() => {
    fetchJobs();
  }, [location.search]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getAll();
      let allJobs = Array.isArray(response.data) ? response.data : [];
      
      // Client-side filtering (ideally server-side)
      if (countryFilter) {
        allJobs = allJobs.filter(job => job.country && job.country.toLowerCase() === countryFilter.toLowerCase());
      }
      if (typeFilter === 'zero-cost') {
        allJobs = allJobs.filter(job => job.isZeroCost);
      }
      
      setJobs(allJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      
      <div className="bg-brand-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            {countryFilter ? `${countryFilter} Jobs` : (typeFilter === 'zero-cost' ? 'Zero Cost Jobs' : 'All Jobs')}
          </h1>
          <p className="text-blue-100 text-lg">
            Find your dream job from our extensive list of opportunities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        {loading ? (
           <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
           </div>
        ) : (
          <>
            {jobs.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    No jobs found matching your criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition h-full flex flex-col">
                        <div className="p-6 flex-grow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-brand-blue font-bold text-lg">
                                    {job.company ? job.company.substring(0, 2).toUpperCase() : 'CO'}
                                </div>
                                <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-1 rounded">
                                    {job.vacancyCount} Openings
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-brand-blue line-clamp-2">
                                {job.title}
                            </h3>
                            
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                    <FaBuilding className="text-gray-400" />
                                    <span className="truncate">{job.company}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gray-400" />
                                    <span>{job.country}</span>
                                </div>
                                <div className="flex items-center gap-2 font-semibold text-green-600">
                                    <FaMoneyBillWave />
                                    <span>{job.currency} {job.salary}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <FaCalendarAlt /> Expires: {job.deadline}
                            </div>
                            <span className="group-hover:text-brand-blue font-medium">View Details &rarr;</span>
                        </div>
                    </div>
                    </Link>
                ))}
                </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default JobsListingPage;
