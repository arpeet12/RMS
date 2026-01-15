import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import { FaUsers, FaPlus, FaThumbsUp, FaThumbsDown, FaComment, FaShare } from 'react-icons/fa';

const AdminCandidates = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Filters
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    passportNumber: '',
    fullName: '',
    district: '',
    agent: '',
    countryOfInterest: '',
    appliedTo: '',
    gender: 'Any',
    applicationStatus: 'Both',
    visaStatus: 'NoPreference',
    ticketStatus: 'All',
    acceptanceStatus: 'Either',
    ministryStatus: 'NoPreference',
    flightStatus: 'No Preference'
  });

  useEffect(() => {
    // If agent ID is passed in URL, set it in filters or fetch logic
    const agentId = searchParams.get('agentId');
    fetchCandidates();
  }, [searchParams]);

  const fetchCandidates = async () => {
    try {
      const res = await adminAPI.getCandidates();
      setCandidates(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading candidates', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [candidates, filters]);

  const applyFilters = () => {
    const agentId = searchParams.get('agentId');

    if (!Array.isArray(candidates)) {
      setFilteredCandidates([]);
      return;
    }

    const result = candidates.filter((c) => {
      // Filter by Agent ID from URL if present
      if (agentId) {
        // Assuming candidate has agent object or agentId field
        // Adjust this check based on actual data structure
        const cAgentId = c.agent?.id || c.agentId;
        if (cAgentId && cAgentId.toString() !== agentId.toString()) return false;
      }

      // Existing filters
      if (filters.gender && filters.gender !== 'Any') {
        const candGender = (c.gender || c.sex || '').toString().toLowerCase();
        if (candGender && candGender !== filters.gender.toLowerCase()) return false;
      }

      if (filters.passportNumber && !(c.passportNumber || '').toLowerCase().includes(filters.passportNumber.toLowerCase())) return false;
      if (filters.fullName && !(c.fullName || '').toLowerCase().includes(filters.fullName.toLowerCase())) return false;
      if (filters.district && !(c.permanentDistrict || '').toLowerCase().includes(filters.district.toLowerCase())) return false;
      if (filters.agent && !(c.agentName || '').toLowerCase().includes(filters.agent.toLowerCase())) return false;
      if (filters.countryOfInterest && !( (c.destinationCountry || '').toLowerCase().includes(filters.countryOfInterest.toLowerCase()) )) return false;
      if (filters.appliedTo && !( (c.jobAppliedFor || '').toLowerCase().includes(filters.appliedTo.toLowerCase()) )) return false;

      // New Filters Logic
      
      // Application: Forwarded, Hold, Both
      if (filters.applicationStatus === 'Forwarded') {
        // Assuming 'Forwarded' means has applications or status is forwarded
        if (!c.applications || c.applications.length === 0) return false; 
      } else if (filters.applicationStatus === 'Hold') {
        if (c.applications && c.applications.length > 0) return false;
      }

      // Visa: Issued, NoVisa, NoPreference
      if (filters.visaStatus === 'Issued') {
        // Assuming Issued means approved/issued
        const vStatus = (c.visaStatus || '').toUpperCase();
        if (!['ISSUED', 'APPROVED', 'VERIFIED'].includes(vStatus)) return false;
      } else if (filters.visaStatus === 'NoVisa') {
        const vStatus = (c.visaStatus || '').toUpperCase();
        if (['ISSUED', 'APPROVED', 'VERIFIED'].includes(vStatus)) return false;
      }

      // Ticket: Available, NotAvailable, All
      if (filters.ticketStatus === 'Available') {
         if (!c.tickets || c.tickets.length === 0) return false;
      } else if (filters.ticketStatus === 'NotAvailable') {
         if (c.tickets && c.tickets.length > 0) return false;
      }

      // Acceptance: Accepted, Rejected, Either
      if (filters.acceptanceStatus === 'Accepted') {
         if ((c.status || '').toUpperCase() !== 'ACCEPTED') return false;
      } else if (filters.acceptanceStatus === 'Rejected') {
         if ((c.status || '').toUpperCase() !== 'REJECTED') return false;
      }

      // Ministry Approval: Approved, Not-Approved, No-Preference
      if (filters.ministryStatus === 'Approved') {
         if ((c.ministryApprovalStatus || '').toUpperCase() !== 'APPROVED') return false;
      } else if (filters.ministryStatus === 'Not-Approved') {
         if ((c.ministryApprovalStatus || '').toUpperCase() === 'APPROVED') return false;
      }

      // Flight: Flown, Not-Flown, No Preference
      if (filters.flightStatus === 'Flown') {
         if ((c.flightStatus || '').toUpperCase() !== 'FLOWN') return false;
      } else if (filters.flightStatus === 'Not-Flown') {
         if ((c.flightStatus || '').toUpperCase() === 'FLOWN') return false;
      }

      return true;
    });

    setFilteredCandidates(result);
  };





  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDaysAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">Search</h2>
        </div>
        
        {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Passport No.:</label>
            <input
              type="text"
              name="passportNumber"
              value={filters.passportNumber}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm border p-2"
              placeholder="Passport"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name:</label>
            <input
              type="text"
              name="fullName"
              value={filters.fullName}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm border p-2"
              placeholder="Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">District:</label>
            <input
              type="text"
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border p-2"
              placeholder="No Preference"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Agent:</label>
            <input
              type="text"
              name="agent"
              value={filters.agent}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border p-2"
              placeholder="No Preference"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country Of Interest:</label>
            <input
              type="text"
              name="countryOfInterest"
              value={filters.countryOfInterest}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Applied To:</label>
             <input
              type="text"
              name="appliedTo"
              value={filters.appliedTo}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border p-2"
              placeholder="No Preference"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Gender:</label>
            <div className="mt-2 flex space-x-4">
              {['Male', 'Female', 'Any'].map(opt => (
                <label key={opt} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value={opt}
                    checked={filters.gender === opt}
                    onChange={handleFilterChange}
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* New Filters Rows */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Application:</label>
            <div className="mt-2 flex space-x-4">
              {['Forwarded', 'Hold', 'Both'].map(opt => (
                <label key={opt} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="applicationStatus"
                    value={opt}
                    checked={filters.applicationStatus === opt}
                    onChange={handleFilterChange}
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Acceptance:</label>
            <div className="mt-2 flex space-x-4">
              {['Accepted', 'Rejected', 'Either'].map(opt => (
                <label key={opt} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="acceptanceStatus"
                    value={opt}
                    checked={filters.acceptanceStatus === opt}
                    onChange={handleFilterChange}
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Visa:</label>
            <div className="mt-2 flex space-x-4">
              {['Issued', 'NoVisa', 'NoPreference'].map(opt => (
                <label key={opt} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="visaStatus"
                    value={opt}
                    checked={filters.visaStatus === opt}
                    onChange={handleFilterChange}
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Ministry Approval:</label>
            <div className="mt-2 flex space-x-4">
              {['Approved', 'Not-Approved', 'No-Preference'].map(opt => (
                <label key={opt} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="ministryStatus"
                    value={opt}
                    checked={filters.ministryStatus === opt}
                    onChange={handleFilterChange}
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Ticket:</label>
            <div className="mt-2 flex space-x-4">
              {['Available', 'NotAvailable', 'All'].map(opt => (
                <label key={opt} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="ticketStatus"
                    value={opt}
                    checked={filters.ticketStatus === opt}
                    onChange={handleFilterChange}
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Flight:</label>
            <div className="mt-2 flex space-x-4">
              {['Flown', 'Not-Flown', 'No Preference'].map(opt => (
                <label key={opt} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="flightStatus"
                    value={opt}
                    checked={filters.flightStatus === opt}
                    onChange={handleFilterChange}
                    className="form-radio text-green-600"
                  />
                  <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        )}

        <div className="flex flex-col space-y-4 mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-48 text-sm font-medium"
            >
              {showFilters ? 'Hide Search Options' : 'Show Search Options'}
            </button>
            
            <div className="flex space-x-2">
               <button onClick={applyFilters} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Search</button>
               <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Profile PDF</button>
               <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Name List Pdf</button>
               <button
                onClick={() => navigate('/admin/candidates/add')}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 ml-auto flex items-center"
               >
                 <FaPlus className="mr-2" /> Add Applicant
               </button>
            </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Applicants</h2>
        <span className="text-gray-600">Showing 1 to {filteredCandidates.length} of {filteredCandidates.length} Applicants.</span>
      </div>

      <div className="space-y-4">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} 
               className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
               onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
          >
             <div className="bg-green-500 text-white px-4 py-1 -mx-4 -mt-4 mb-4 rounded-t-lg font-semibold flex justify-between">
                <span>Applicants <span className="text-xs font-normal ml-2">Click to view more details about each applicants.</span></span>
             </div>
             
             <div className="flex flex-col md:flex-row gap-6">
               <div className="w-32 h-32 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                 {candidate.profilePhotoPath ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/${candidate.profilePhotoPath}`}
                      alt={candidate.fullName}
                      className="w-full h-full object-cover"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaUsers size={48} />
                    </div>
                 )}
               </div>

               <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                 <div className="space-y-2">
                   <p><span className="font-semibold">Name:</span> {candidate.fullName}</p>
                   <p><span className="font-semibold">Address:</span> {candidate.permanentCityStreet}, {candidate.permanentDistrict}</p>
                   <p><span className="font-semibold">Date of birth:</span> {candidate.dateOfBirth}</p>
                 </div>
                 
                 <div className="space-y-2">
                   <p><span className="font-semibold">Passport No.:</span> {candidate.passportNumber}</p>
                   <p><span className="font-semibold">Passport Received:</span> {calculateDaysAgo(candidate.createdAt)}</p>
                   <p><span className="font-semibold">Passport expiry date:</span> {candidate.passportExpiryDate}</p>
                 </div>

                 <div className="space-y-2">
                    <p><span className="font-semibold">Phone No.:</span> {candidate.phone}</p>
                    <p><span className="font-semibold">Country Of Interest:</span> {candidate.destinationCountry || 'Malaysia'}</p>
                    <p><span className="font-semibold">Applied To:</span> {candidate.jobAppliedFor || 'Heavy Driver, CG Electronics'}</p>
                 </div>

                 <div className="space-y-2">
                   <p><span className="font-semibold">Agent:</span> {candidate.agentName || 'Anil Bhattarai'}</p>
                   <p><span className="font-semibold">Medical:</span> <span className={candidate.medicalStatus === 'FIT' ? 'text-green-600 font-bold' : 'text-red-600'}>{candidate.medicalStatus || 'Fit'}</span></p>
                   <p><span className="font-semibold">No Visa</span></p>
                   <div className="flex space-x-2 mt-2 text-gray-500">
                      <button className="hover:text-green-600"><FaThumbsUp /></button>
                      <button className="hover:text-red-600"><FaThumbsDown /></button>
                      <button className="hover:text-blue-600"><FaComment /></button>
                      <button className="hover:text-gray-800"><FaShare /></button>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        ))}

        {filteredCandidates.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No applicants found matching your criteria.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCandidates;
