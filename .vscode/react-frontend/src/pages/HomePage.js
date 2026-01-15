import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { jobsAPI, newsAPI } from '../services/api';
import HeroSection from '../components/home/HeroSection';
import CandidateStatusCheck from '../components/home/CandidateStatusCheck';
import UrgentJobs from '../components/home/UrgentJobs';
import FeaturedJobs from '../components/home/FeaturedJobs';
import ManpowerList from '../components/home/ManpowerList';
import ZeroCostJobs from '../components/home/ZeroCostJobs';
import NewsSection from '../components/home/NewsSection';
import RecentJobsAndCategories from '../components/home/RecentJobsAndCategories';
import ExchangeRateAndVacancies from '../components/home/ExchangeRateAndVacancies';
import ExpertVideos from '../components/home/ExpertVideos';
import StatsSection from '../components/home/StatsSection';
import { FaTimes } from 'react-icons/fa';

const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for hash changes to open modal
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#candidate-status-check' || location.hash === '#candidate-status-check') {
        setShowStatusModal(true);
      }
    };
    
    // Check on mount and when location changes
    checkHash();
    
    // Also listen for browser hashchange events
    window.addEventListener('hashchange', checkHash);
    
    return () => {
      window.removeEventListener('hashchange', checkHash);
    };
  }, [location.hash]);

  const fetchData = async () => {
    try {
      const [jobsRes, newsRes] = await Promise.all([
        jobsAPI.getAll(),
        newsAPI.getAll()
      ]);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setNews(Array.isArray(newsRes.data) ? newsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on flags
  const urgentJobs = jobs.filter(job => job.isUrgent);
  const featuredJobs = jobs.filter(job => job.isFeatured);
  const zeroCostJobs = jobs.filter(job => job.isZeroCost);

  const handleCheckStatus = () => {
    setShowStatusModal(true);
  };

  const handleCloseModal = () => {
    setShowStatusModal(false);
    // Clear hash when closing modal
    if (location.hash === '#candidate-status-check' || window.location.hash === '#candidate-status-check') {
      window.history.replaceState(null, '', location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <HeroSection onCheckStatus={handleCheckStatus} />

      {/* Status Check Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true" 
              onClick={handleCloseModal}
            ></div>

            {/* Modal panel */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                  onClick={handleCloseModal}
                >
                  <span className="sr-only">Close</span>
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                 <CandidateStatusCheck />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
        </div>
      ) : (
        <>
           {/* Sections */}
           <UrgentJobs jobs={urgentJobs} />
           <FeaturedJobs jobs={featuredJobs} />
           <ManpowerList />
          <RecentJobsAndCategories jobs={jobs} />
          <ExchangeRateAndVacancies />
          <ZeroCostJobs jobs={zeroCostJobs} />
          <ExpertVideos />
          <StatsSection />
          <NewsSection news={news} />
        </>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;
