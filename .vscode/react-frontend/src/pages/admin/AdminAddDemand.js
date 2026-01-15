import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { jobsAPI } from '../../services/api';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

const AdminAddDemand = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);
  
  const [formData, setFormData] = useState({
    company: '',
    title: '',
    country: '',
    demandExpiryDate: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await jobsAPI.getAll();
      const jobs = response.data;
      const uniqueCompanies = [...new Set(jobs.map(job => job.company).filter(Boolean))];
      setCompanies(uniqueCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCompany = () => {
    const newCompany = prompt('Enter new company name:');
    if (newCompany && newCompany.trim()) {
      setCompanies([...companies, newCompany.trim()]);
      setFormData(prev => ({ ...prev, company: newCompany.trim() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create FormData to match backend expectations
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', 'Demand created from Add Demand form');
      formDataToSend.append('country', formData.country);
      formDataToSend.append('company', formData.company);
      formDataToSend.append('salary', '0'); // Required field, default to 0
      formDataToSend.append('vacancyCount', '0'); // Required field, default to 0
      formDataToSend.append('deadline', formData.demandExpiryDate);
      
      // Optional fields with defaults
      formDataToSend.append('currency', '$');
      formDataToSend.append('overtime', '0');
      formDataToSend.append('workingHours', '0');
      formDataToSend.append('workDaysPerWeek', '');
      formDataToSend.append('yearlyLeave', '');
      formDataToSend.append('food', 'Yes');
      formDataToSend.append('housing', 'Yes');
      formDataToSend.append('tenure', '');

      await jobsAPI.create(formDataToSend);
      navigate('/admin/demands');
    } catch (err) {
      console.error('Error creating demand:', err);
      setError(err.response?.data?.error || 'Failed to create demand');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">Add Demand</h1>
          <button
            onClick={() => navigate('/admin/demands')}
            className="text-white hover:text-gray-100 flex items-center text-sm"
          >
            <FaArrowLeft className="mr-1" /> Back
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            {error}
          </div>
        )}

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-gray-600 font-semibold">Company:</label>
                <div className="col-span-2 flex gap-2">
                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Choose Company</option>
                    {companies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCompany}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-gray-600 font-semibold">Title:</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Demand Title"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-gray-600 font-semibold">Country:</label>
                <div className="col-span-2">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Country Name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-gray-600 font-semibold">Demand Expiry Date:</label>
                <div className="col-span-2">
                  <input
                    type="date"
                    name="demandExpiryDate"
                    value={formData.demandExpiryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Demand Expiry Date"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAddDemand;

