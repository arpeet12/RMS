import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { FaChartBar, FaChartPie, FaDownload } from 'react-icons/fa';

const AdminReports = () => {
  const [loading, setLoading] = useState(false); // Set to true when implementing API
  
  // Mock Data - Replace with API calls later
  const applicantCompositionData = [
    { name: 'Male', value: 400 },
    { name: 'Female', value: 300 }
  ];

  const countryData = [
    { name: 'Malaysia', value: 200 },
    { name: 'UAE', value: 150 },
    { name: 'Qatar', value: 100 },
    { name: 'Saudi Arabia', value: 80 },
    { name: 'Kuwait', value: 50 }
  ];

  const demandVsSupplyData = [
    { name: 'Jan', Demand: 400, Supply: 240 },
    { name: 'Feb', Demand: 300, Supply: 139 },
    { name: 'Mar', Demand: 200, Supply: 980 },
    { name: 'Apr', Demand: 278, Supply: 390 },
    { name: 'May', Demand: 189, Supply: 480 },
    { name: 'Jun', Demand: 239, Supply: 380 },
  ];

  const issueStatusData = [
    { name: 'Pending', value: 10 },
    { name: 'Resolved', value: 45 },
    { name: 'In Progress', value: 20 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
          <FaChartBar className="mr-3 text-primary-600" />
          System Reports
        </h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-700 transition">
          <FaDownload className="mr-2" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Applicant Composition By Gender */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaChartPie className="mr-2" /> Applicant Composition (Gender)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicantCompositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {applicantCompositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applicant Composition By Country */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaChartPie className="mr-2" /> Applicant Composition (Target Country)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Demand vs Supply */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaChartBar className="mr-2" /> Demand vs Supply (Last 6 Months)
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={demandVsSupplyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Demand" fill="#8884d8" />
                <Bar dataKey="Supply" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaChartPie className="mr-2" /> Issue Status Summary
          </h2>
          <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {issueStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
