import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const StatsCard = ({ title, count, subtitle, stats, colors }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="bg-brand-blue text-white px-4 py-2">
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    <div className="p-6">
      <div className="text-center mb-6">
        <p className="text-gray-500 text-sm">You Have</p>
        <h2 className="text-5xl font-bold text-gray-700 my-2">{count}</h2>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
      
      <div className="w-full bg-gray-100 rounded-md h-8 mb-2 flex overflow-hidden">
         {stats.map((stat, index) => (
           <div 
             key={index} 
             style={{ width: `${stat.percentage}%`, backgroundColor: colors[index] }}
             className="h-full flex items-center justify-center text-xs text-white font-bold relative group"
             title={`${stat.label}: ${stat.value}`}
           >
             {stat.value}
           </div>
         ))}
      </div>
      
      <div className="flex justify-center space-x-4 text-xs text-gray-600">
         {stats.map((stat, index) => (
           <div key={index} className="flex items-center">
              <span className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: colors[index] }}></span>
              {stat.label}
           </div>
         ))}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminAPI.getDashboard();
        setDashboardData(res.data);
      } catch (err) {
        console.error('Error loading admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const summary = dashboardData?.summary || {
    totalCandidates: 0,
    totalJobs: 0,
    totalIssues: 0,
  };

  const issueStats = dashboardData?.issues || {
    open: 0,
    resolved: 0,
    closed: 0,
  };

  const flightStats = dashboardData?.flights || {
    scheduled: 0,
    departed: 0,
    arrived: 0,
    cancelled: 0,
  };

  const issueChartData = [
    { name: 'Open', value: issueStats.open },
    { name: 'Resolved', value: issueStats.resolved },
    { name: 'Closed', value: issueStats.closed },
  ].filter(item => item.value > 0);

  const flightChartData = [
    { name: 'Scheduled', value: flightStats.scheduled },
    { name: 'Departed', value: flightStats.departed },
    { name: 'Arrived', value: flightStats.arrived },
    { name: 'Cancelled', value: flightStats.cancelled },
  ].filter(item => item.value > 0);

  const colors = ['#0056b3', '#ffc107', '#28a745', '#dc3545'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          ManpowerHub
          <span className="text-sm font-normal text-gray-500 ml-2">
            Managing Manpower Made Easier
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Candidates"
          count={summary.totalCandidates}
          subtitle="registered candidates"
          stats={[
            { label: 'Candidates', value: summary.totalCandidates, percentage: 100 },
          ]}
          colors={[colors[0]]}
        />
        <StatsCard
          title="Demands"
          count={summary.totalJobs}
          subtitle="total job demands"
          stats={[
            { label: 'Demands', value: summary.totalJobs, percentage: 100 },
          ]}
          colors={[colors[1]]}
        />
        <StatsCard
          title="Issues"
          count={summary.totalIssues}
          subtitle="total recorded issues"
          stats={[
            {
              label: 'Open',
              value: issueStats.open,
              percentage: summary.totalIssues
                ? Math.round((issueStats.open / summary.totalIssues) * 100)
                : 0,
            },
            {
              label: 'Resolved',
              value: issueStats.resolved,
              percentage: summary.totalIssues
                ? Math.round((issueStats.resolved / summary.totalIssues) * 100)
                : 0,
            },
            {
              label: 'Closed',
              value: issueStats.closed,
              percentage: summary.totalIssues
                ? Math.round((issueStats.closed / summary.totalIssues) * 100)
                : 0,
            },
          ]}
          colors={[colors[2], colors[0], colors[3]]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-brand-blue text-white px-4 py-2">
            <h3 className="font-semibold text-lg">Flight Tickets Status</h3>
          </div>
          <div className="p-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={flightChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {flightChartData.map((entry, index) => (
                    <Cell
                      key={`cell-flight-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-brand-blue text-white px-4 py-2">
            <h3 className="font-semibold text-lg">Issue Status Overview</h3>
          </div>
          <div className="p-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {issueChartData.map((entry, index) => (
                    <Cell
                      key={`cell-issue-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
