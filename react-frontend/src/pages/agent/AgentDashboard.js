import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { agentAPI } from '../../services/api';
import {
  FaUserCircle,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaChartBar,
  FaBriefcase,
  FaGlobe
} from 'react-icons/fa';

const AgentDashboard = () => {
  const [agent, setAgent] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await agentAPI.getDashboard();
      setAgent(response.data.agent);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="agent">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout role="agent">
        <div className="text-center py-12">
          <p className="text-gray-500">No agent profile found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = statistics || {
    totalCandidatesReferred: 0,
    decidedApplicants: 0,
    undecidedApplicants: 0,
    totalDemands: 0,
    fulfilledDemands: 0,
    vacantDemands: 0,
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    closedIssues: 0
  };

  return (
    <DashboardLayout role="agent">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 mt-2">View your performance and candidate statistics</p>
        </div>

        {/* Applicants Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-brand-blue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Candidates Referred</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalCandidatesReferred}</p>
                <p className="text-xs text-gray-500 mt-1">Candidates you've referred</p>
              </div>
              <FaUsers className="text-4xl text-brand-blue opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-brand-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Decided Applicants</p>
                <p className="text-3xl font-bold text-gray-800">{stats.decidedApplicants}</p>
                <p className="text-xs text-gray-500 mt-1">Applied to a demand</p>
              </div>
              <FaCheckCircle className="text-4xl text-brand-red opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-brand-yellow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Undecided Applicants</p>
                <p className="text-3xl font-bold text-gray-800">{stats.undecidedApplicants}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting decision</p>
              </div>
              <FaClock className="text-4xl text-brand-yellow opacity-50" />
            </div>
          </div>
        </div>

        {/* Demands Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-brand-blue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Demands</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalDemands}</p>
                <p className="text-xs text-gray-500 mt-1">All active demands</p>
              </div>
              <FaBriefcase className="text-4xl text-brand-blue opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-brand-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Fulfilled</p>
                <p className="text-3xl font-bold text-gray-800">{stats.fulfilledDemands}</p>
                <p className="text-xs text-gray-500 mt-1">Vacancy filled</p>
              </div>
              <FaBriefcase className="text-4xl text-brand-red opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-brand-orange">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Vacant</p>
                <p className="text-3xl font-bold text-gray-800">{stats.vacantDemands}</p>
                <p className="text-xs text-gray-500 mt-1">Positions available</p>
              </div>
              <FaBriefcase className="text-4xl text-brand-orange opacity-50" />
            </div>
          </div>
        </div>

        {/* Issues Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalIssues}</p>
              </div>
              <FaChartBar className="text-4xl text-gray-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-brand-yellow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Open</p>
                <p className="text-3xl font-bold text-gray-800">{stats.openIssues}</p>
              </div>
              <FaChartBar className="text-4xl text-brand-yellow opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-brand-blue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-gray-800">{stats.resolvedIssues}</p>
              </div>
              <FaChartBar className="text-4xl text-brand-blue opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-brand-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Closed</p>
                <p className="text-3xl font-bold text-gray-800">{stats.closedIssues}</p>
              </div>
              <FaChartBar className="text-4xl text-brand-red opacity-50" />
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaChartBar className="mr-2 text-brand-blue" />
            Performance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Success Rate</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-brand-blue">
                  {stats.totalCandidatesReferred > 0 
                    ? Math.round((stats.decidedApplicants / stats.totalCandidatesReferred) * 100)
                    : 0}%
                </span>
                <span className="ml-2 text-gray-500">placement rate</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Active Applications</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-blue-600">
                  {stats.undecidedApplicants}
                </span>
                <span className="ml-2 text-gray-500">currently processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Profile Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaUserCircle className="mr-2 text-green-600" />
            Agent Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Full Name</p>
              <p className="font-semibold text-gray-800">{agent.fullName || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Agent Code</p>
              <p className="font-semibold text-gray-800">{agent.agentCode || 'Not Assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-800">{agent.email || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="font-semibold text-gray-800">{agent.phone || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                agent.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : agent.status === 'INACTIVE'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {agent.status || 'ACTIVE'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Commission Rate</p>
              <p className="font-semibold text-gray-800">{agent.commissionRate || 'Not Set'}</p>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <FaBriefcase className="text-2xl text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Demands</h3>
            </div>
            <p className="text-gray-600 text-sm">
              View available job demands and opportunities for your candidates.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <FaGlobe className="text-2xl text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Candidates</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Track the status of candidates you've referred to the system.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;




