import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import { FaUserTie } from 'react-icons/fa';

const AdminAgents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await adminAPI.getAgents();
      setAgents(res.data);
      setMessage('');
    } catch (err) {
      console.error('Error loading agents', err);
      setMessage('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id) => {
    navigate(`/admin/agents/${id}`);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserTie /> Agents
          </h1>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading agents...</div>
            ) : agents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No agents found.</div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-500 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">S.N.</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">NAME</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">PHONE</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">MOBILE</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {agents.map((agent, index) => (
                            <tr 
                                key={agent.id} 
                                onClick={() => handleRowClick(agent.id)}
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.phone || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.mobile || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAgents;