import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { agentAPI, adminAPI } from '../../services/api';
import {
  FaUser,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationCircle,
  FaIdCard,
  FaPassport
} from 'react-icons/fa';

const AgentCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    if (hasPermission('applicant', 'list')) {
      fetchCandidates();
    } else {
      setLoading(false);
      setError('You do not have permission to view candidates.');
    }
  }, [hasPermission]);

  const fetchCandidates = async () => {
    try {
      const response = await agentAPI.getCandidates();
      setCandidates(response.data);
      setError('');
    } catch (err) {
      console.warn('Agent API failed, trying admin API fallback...');
      try {
        const response = await adminAPI.getCandidates();
        let allCandidates = [];
        if (Array.isArray(response.data)) {
          allCandidates = response.data;
        } else if (response.data && response.data.candidates) {
          allCandidates = response.data.candidates;
        }
        
        // Filter by agent name/username if available
        const agentName = user?.username || user?.name;
        if (agentName) {
            const myCandidates = allCandidates.filter(c => 
                c.agentName === agentName
            );
            setCandidates(myCandidates);
        } else {
            // Should not happen if logged in, but fallback to empty
            setCandidates([]);
        }
        setError('');
      } catch (fallbackErr) {
        setError('Failed to load candidates');
        console.error('Error fetching candidates:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') {
      return <FaCheckCircle className="text-green-500" />;
    } else if (status === 'REJECTED') {
      return <FaTimesCircle className="text-red-500" />;
    } else if (status === 'IN_PROGRESS' || status === 'PENDING') {
      return <FaClock className="text-yellow-500" />;
    } else {
      return <FaExclamationCircle className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-800';
    if (status === 'REJECTED') return 'bg-red-100 text-red-800';
    if (status === 'IN_PROGRESS' || status === 'PENDING') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout role="agent">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Candidates</h1>
          <p className="text-gray-600 mt-2">View candidates you've referred (Read-only)</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaUser className="text-5xl mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">No Candidates Found</h2>
            <p>You haven't referred any candidates yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passport Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visa Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medical Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => {
                    const overallStatus = candidate.visaStatus === 'APPROVED' ? 'APPROVED' :
                                         candidate.visaStatus === 'REJECTED' ? 'REJECTED' :
                                         candidate.visaStatus === 'IN_PROGRESS' || candidate.visaStatus === 'PENDING' ? 'IN_PROGRESS' :
                                         'NOT_UPLOADED';
                    
                    return (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{candidate.fullName || 'N/A'}</div>
                          {candidate.passportNumber && (
                            <div className="text-sm text-gray-500">
                              <FaIdCard className="inline mr-1" />
                              {candidate.passportNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.email || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{candidate.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(candidate.passportStatus)}
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(candidate.passportStatus)}`}>
                              {candidate.passportStatus || 'NOT_UPLOADED'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(candidate.visaStatus)}
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(candidate.visaStatus)}`}>
                              {candidate.visaStatus || 'NOT_UPLOADED'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(candidate.medicalStatus)}
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(candidate.medicalStatus)}`}>
                              {candidate.medicalStatus || 'NOT_UPLOADED'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(overallStatus)}
                            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(overallStatus)}`}>
                              {overallStatus}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentCandidates;

