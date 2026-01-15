import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { jobsAPI } from '../../services/api';
import { FaBriefcase, FaGlobe, FaDollarSign } from 'react-icons/fa';

const AgentDemands = () => {
  const navigate = useNavigate();
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (hasPermission('demand', 'list')) {
      fetchDemands();
    } else {
      setLoading(false);
      setError('You do not have permission to view demands.');
    }
  }, [hasPermission]);

  const fetchDemands = async () => {
    try {
      const response = await jobsAPI.getAll();
      setDemands(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load demands');
      console.error('Error fetching demands:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="agent">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Demands</h1>
          <p className="text-gray-600 mt-2">View all available job demands (Read-only)</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : demands.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaBriefcase className="text-5xl mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">No Demands Available</h2>
            <p>There are currently no job demands available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demands.map((demand) => (
              <div 
                key={demand.id} 
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/agent/demands/${encodeURIComponent(demand.company || 'Unknown')}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{demand.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaGlobe className="mr-2" />
                      <span>{demand.country}</span>
                    </div>
                    {demand.company && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Company:</span> {demand.company}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaDollarSign className="mr-2" />
                    <span>{demand.currency || '$'} {demand.salary}</span>
                  </div>
                  {demand.requiredMale || demand.requiredFemale ? (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Required:</span> M: {demand.requiredMale || 0} | F: {demand.requiredFemale || 0}
                    </div>
                  ) : null}
                  {demand.deadline && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Deadline:</span> {new Date(demand.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {demand.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {demand.description}
                  </p>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentDemands;




