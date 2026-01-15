import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { jobsAPI } from '../services/api';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaStar, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaWhatsapp,
  FaClock,
  FaMoneyBillWave,
  FaBuilding
} from 'react-icons/fa';

const JobDetailsPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedJobs, setRelatedJobs] = useState([]);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getById(id);
      setJob(response.data);
      
      // Fetch related jobs (for now just fetch all and take first 5 excluding current)
      const allJobsRes = await jobsAPI.getAll();
      const allJobs = Array.isArray(allJobsRes.data) ? allJobsRes.data : [];
      setRelatedJobs(allJobs.filter(j => j.id !== parseInt(id)).slice(0, 5));
      
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-red-600">
          {error || 'Job not found'}
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate days left
  const calculateDaysLeft = (deadline) => {
    if (!deadline) return 0;
    const today = new Date();
    const expiry = new Date(deadline);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft(job.deadline);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Top Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="flex-grow">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <FaMapMarkerAlt className="mr-1 text-red-500" />
                        <span className="font-medium text-gray-700">{job.country}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        {job.title}: Excellent Salary Packages in {job.country}
                        <span className="ml-3 text-sm font-normal text-red-500 bg-red-50 px-2 py-1 rounded">
                            {daysLeft} DAYS LEFT
                        </span>
                    </h1>
                    
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center text-brand-blue font-semibold">
                            {job.company} <FaStar className="ml-1 text-yellow-400" />
                        </div>
                        <div className="text-gray-600">
                            <span className="font-medium">Hiring Company:</span> {job.company}
                        </div>
                        <div className="text-gray-600">
                            <span className="font-medium">LT Number:</span> {job.lotNo || 'N/A'} {job.chalaniNo ? `, ${job.chalaniNo}` : ''}
                        </div>
                        <div className="text-gray-600">
                            <span className="font-medium">Required Nos:</span> {job.vacancyCount}
                        </div>
                        <div className="flex items-center text-gray-600">
                            <FaMoneyBillWave className="mr-2 text-green-600" />
                            {job.currency} {job.salary} / month
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                            <span className="mr-4"><FaClock className="inline mr-1"/> {job.workingHours || '8'} hours/day</span>
                            <span>{job.views || 0} Views</span>
                        </div>
                    </div>

                    {/* Social Share */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg inline-block">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Share this link via :</p>
                        <div className="flex space-x-3">
                            <button className="text-blue-600 hover:text-blue-700 text-xl"><FaFacebook /></button>
                            <button className="text-blue-400 hover:text-blue-500 text-xl"><FaTwitter /></button>
                            <button className="text-blue-700 hover:text-blue-800 text-xl"><FaLinkedin /></button>
                            <button className="text-green-500 hover:text-green-600 text-xl"><FaWhatsapp /></button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 md:mt-0 flex flex-col items-end space-y-4">
                     <button className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded shadow-lg transform transition hover:scale-105">
                        APPLY NOW
                    </button>
                    {/* Contact Box Side */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full md:w-72 mt-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase">Contact Us</h3>
                        <div className="text-brand-blue font-semibold mb-1 flex items-center">
                            {job.company} <FaStar className="ml-1 text-yellow-400" />
                        </div>
                        <div className="text-xs text-gray-500 mb-2">Lic No. 1305/074/75</div>
                        <div className="text-sm text-gray-600 space-y-1">
                             <div className="flex items-start">
                                <FaMapMarkerAlt className="mt-1 mr-2 flex-shrink-0" />
                                <span>Kathmandu-7, Gaushala, Nepal</span>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2">📧</span>
                                <a href="mailto:info@example.com" className="hover:underline">info@example.com</a>
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2">📞</span>
                                <span>+977-1-4621975, 4621918</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content - Job Details */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Details Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-white bg-blue-800 uppercase">
                            <tr>
                                <th className="px-6 py-3 w-1/3">Particular</th>
                                <th className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr className="bg-white">
                                <td className="px-6 py-3 font-medium text-gray-700">Minimum Qualification</td>
                                <td className="px-6 py-3 text-gray-600">Under SLC</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-700">Working Experience</td>
                                <td className="px-6 py-3 text-gray-600">According to position</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-6 py-3 font-medium text-gray-700">Visa Ticket</td>
                                <td className="px-6 py-3 text-gray-600">Provided</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-700">Food</td>
                                <td className="px-6 py-3 text-gray-600">{job.food || 'Provided'}</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-6 py-3 font-medium text-gray-700">Accommodation</td>
                                <td className="px-6 py-3 text-gray-600">{job.housing || 'Provided'}</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-700">Service Charge (Nrs)</td>
                                <td className="px-6 py-3 text-gray-600">Rs. {job.isZeroCost ? '0' : '10,000'}</td>
                            </tr>
                             <tr className="bg-white">
                                <td className="px-6 py-3 font-medium text-gray-700">Pre- Medical in Nepal</td>
                                <td className="px-6 py-3 text-gray-600">Provided</td>
                            </tr>
                             <tr className="bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-700">Employment Insurance</td>
                                <td className="px-6 py-3 text-gray-600">Provided by hiring company</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-6 py-3 font-medium text-gray-700">Contract Period</td>
                                <td className="px-6 py-3 text-gray-600">{job.tenure || '2 Years'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Job Position / Salary Details */}
                <div>
                     <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Job Position/ Salary Details</h3>
                     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-white bg-blue-800 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Job Position</th>
                                    <th className="px-6 py-3">Male</th>
                                    <th className="px-6 py-3">Female</th>
                                    <th className="px-6 py-3">Salary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="bg-white">
                                    <td className="px-6 py-4 font-medium text-gray-800">{job.title}</td>
                                    <td className="px-6 py-4 text-gray-600">{job.requiredMale || 0}</td>
                                    <td className="px-6 py-4 text-gray-600">{job.requiredFemale || 0}</td>
                                    <td className="px-6 py-4 text-gray-600">{job.salary} {job.currency}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                 {/* Description */}
                 {job.description && (
                     <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Description</h3>
                        <div className="bg-white p-6 rounded-lg shadow-sm text-gray-700 whitespace-pre-wrap">
                            {job.description}
                        </div>
                     </div>
                 )}

            </div>

            {/* Right Sidebar - More Demands */}
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                     <h3 className="text-xl font-bold text-gray-700 mb-4 uppercase">More Demands</h3>
                     <div className="space-y-4">
                        {relatedJobs.map(related => (
                            <Link to={`/jobs/${related.id}`} key={related.id} className="block group">
                                <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded transition">
                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-brand-blue font-bold text-xs flex-shrink-0">
                                        {related.company ? related.company.substring(0, 2).toUpperCase() : 'CO'}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 group-hover:text-brand-blue text-sm line-clamp-2">
                                            {related.title}
                                        </h4>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {related.company}
                                        </div>
                                         <div className="text-xs text-green-600 font-medium mt-1">
                                            {related.currency} {related.salary}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                     </div>
                </div>
            </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default JobDetailsPage;
