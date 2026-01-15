import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import { FaUserTie, FaEdit, FaArrowLeft } from 'react-icons/fa';

const AdminAgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAgent();
  }, [id]);

  const fetchAgent = async () => {
    try {
      const res = await adminAPI.getAgent(id);
      setAgent(res.data);
      setMessage('');
    } catch (err) {
      console.error('Error loading agent', err);
      setMessage('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Navigate to edit page (if exists, or placeholder)
    // For now, maybe just alert or navigate to placeholder
    // navigate(`/admin/agents/edit/${id}`);
    alert('Edit functionality coming soon');
  };

  const handleViewApplicants = () => {
    // Navigate to candidates list filtered by agent
    navigate(`/admin/candidates?agentId=${id}`);
  };

  if (loading) {
    return (
        <DashboardLayout role="admin">
            <div className="text-center py-8 text-gray-500">Loading agent details...</div>
        </DashboardLayout>
    );
  }

  if (!agent) {
    return (
        <DashboardLayout role="admin">
            <div className="text-center py-8 text-red-500">Agent not found</div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-green-500 text-white p-4 rounded-t-lg shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/agents')} className="hover:text-gray-200">
                    <FaArrowLeft />
                </button>
                <h1 className="text-xl font-bold">Agent Details</h1>
            </div>
            <button onClick={handleEdit} className="flex items-center gap-2 hover:text-gray-200">
                <FaEdit /> Edit
            </button>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-gray-200 p-6 -mt-6">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-3">
                    <div className="font-semibold text-gray-600">Agent Name:</div>
                    <div className="md:col-span-2 text-gray-800">{agent.fullName}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-3">
                    <div className="font-semibold text-gray-600">Address:</div>
                    <div className="md:col-span-2 text-gray-800">{agent.address || '-'}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-3">
                    <div className="font-semibold text-gray-600">Phone:</div>
                    <div className="md:col-span-2 text-gray-800">{agent.phone || '-'}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-3">
                    <div className="font-semibold text-gray-600">Mobile Number:</div>
                    <div className="md:col-span-2 text-gray-800">{agent.mobile || '-'}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-3">
                    <div className="font-semibold text-gray-600">E-Mail Address:</div>
                    <div className="md:col-span-2 text-gray-800">{agent.email || '-'}</div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleViewApplicants}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition-colors"
                    >
                        View applicants by {agent.fullName}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAgentDetails;