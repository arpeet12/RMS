import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { candidateAPI } from '../../services/api';
import {
  FaUserCircle,
  FaIdCard,
  FaFileMedical,
  FaFileContract,
  FaHeartbeat,
  FaPassport,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationCircle
} from 'react-icons/fa';

const CandidateDashboard = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await candidateAPI.getDashboard();
      setCandidate(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') {
      return <FaCheckCircle className="text-brand-blue" />;
    } else if (status === 'REJECTED') {
      return <FaTimesCircle className="text-brand-red" />;
    } else if (status === 'IN_PROGRESS' || status === 'PENDING') {
      return <FaClock className="text-brand-yellow" />;
    } else {
      return <FaExclamationCircle className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'bg-blue-100 text-brand-blue';
    if (status === 'REJECTED') return 'bg-red-100 text-brand-red';
    if (status === 'IN_PROGRESS' || status === 'PENDING') return 'bg-yellow-100 text-brand-yellow';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-gray-500">No candidate profile found.</p>
        </div>
      </div>
    );
  }

  const progressItems = [
    { name: 'Profile', status: candidate.fullName && candidate.email ? 'COMPLETED' : 'PENDING', icon: FaUserCircle },
    { name: 'Passport', status: candidate.passportStatus, icon: FaIdCard },
    { name: 'Medical Report', status: candidate.medicalStatus, icon: FaFileMedical },
    { name: 'Police Report', status: candidate.policeReportStatus, icon: FaFileContract },
    { name: 'Health Report', status: candidate.healthReportStatus, icon: FaHeartbeat },
    { name: 'Visa', status: candidate.visaStatus, icon: FaPassport },
    { name: 'Insurance', status: candidate.insuranceStatus, icon: FaShieldAlt },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your application status and progress</p>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaCheckCircle className="mr-2 text-brand-blue" />
            Application Progress
          </h2>
          <div className="space-y-4">
            {progressItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border-l-4 border-brand-blue bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Icon className="text-2xl text-brand-blue" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(item.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                          {item.status || 'NOT_UPLOADED'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            to="/candidate/profile"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <FaUserCircle className="text-4xl text-brand-blue mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800">Update Profile</h3>
          </Link>
          <Link
            to="/candidate/documents"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <FaFileMedical className="text-4xl text-brand-blue mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800">View Documents</h3>
          </Link>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaPassport className="text-4xl text-brand-blue mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800">Application Status</h3>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Application Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Passport Number</p>
              <p className="font-semibold text-gray-800">
                {candidate.passportNumber || 'Not Set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Job Applied For</p>
              <p className="font-semibold text-gray-800">
                {candidate.jobAppliedFor || 'General Application'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Destination Country</p>
              <p className="font-semibold text-gray-800">
                {candidate.destinationCountry || 'Not Set'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;

