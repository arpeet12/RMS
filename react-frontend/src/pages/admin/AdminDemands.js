import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { jobsAPI } from '../../services/api';
import { FaSearch, FaFilePdf, FaChevronDown } from 'react-icons/fa';

const AdminDemands = () => {
  const navigate = useNavigate();
  const [demands, setDemands] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    country: 'No Preferences',
    company: 'No Preferences',
    fromDate: '',
    toDate: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Get unique countries and companies for dropdowns
  const [countries, setCountries] = useState(['No Preferences']);
  const [companies, setCompanies] = useState(['No Preferences']);

  useEffect(() => {
    fetchAllJobs();
  }, []);

  useEffect(() => {
    fetchGroupedDemands();
  }, [filters]);

  const fetchAllJobs = async () => {
    try {
      const response = await jobsAPI.getAll();
      const jobs = response.data;
      setAllJobs(jobs);
      
      // Extract unique countries and companies
      const uniqueCountries = ['No Preferences', ...new Set(jobs.map(job => job.country).filter(Boolean))];
      const uniqueCompanies = ['No Preferences', ...new Set(jobs.map(job => job.company).filter(Boolean))];
      setCountries(uniqueCountries);
      setCompanies(uniqueCompanies);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchGroupedDemands = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.country && filters.country !== 'No Preferences') {
        params.country = filters.country;
      }
      if (filters.company && filters.company !== 'No Preferences') {
        params.company = filters.company;
      }
      if (filters.fromDate) {
        params.fromDate = filters.fromDate;
      }
      if (filters.toDate) {
        params.toDate = filters.toDate;
      }
      
      const response = await jobsAPI.getGrouped(params);
      setDemands(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load demands');
      console.error('Error fetching grouped demands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearch = () => {
    fetchGroupedDemands();
  };

  const handleGetPdf = () => {
    // TODO: Implement PDF export
    alert('PDF export functionality will be implemented soon');
  };

  // Pagination calculations
  const totalPages = Math.ceil(demands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDemands = demands.slice(startIndex, endIndex);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Advanced Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Advanced Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country:</label>
              <select
                name="country"
                value={filters.country}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company:</label>
              <select
                name="company"
                value={filters.company}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From:</label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To:</label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSearch}
              className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition flex items-center"
            >
              <FaSearch className="mr-2" />
              Search
            </button>
            <button
              onClick={handleGetPdf}
              className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition flex items-center"
            >
              <FaFilePdf className="mr-2" />
              Get Pdf
            </button>
          </div>
        </div>

        {/* Demand List Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Demand</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, demands.length)} of {demands.length} Demands. 
              <span className="ml-2">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : demands.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <h2 className="text-xl font-semibold mb-2">No Demands Found</h2>
              <p>Try adjusting your search filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-green-50 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        COUNTRY
                      </th>
                      <th className="px-6 py-3 bg-green-50 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        COMPANY
                      </th>
                      <th className="px-6 py-3 bg-green-50 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        DEMAND
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDemands.map((demand, index) => (
                      <tr 
                        key={`${demand.country}-${demand.company}-${index}`} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/admin/demands/${encodeURIComponent(demand.company)}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {demand.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {demand.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center justify-between">
                            <span>{demand.demandCount} Demands</span>
                            <FaChevronDown className="text-gray-400" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDemands;

