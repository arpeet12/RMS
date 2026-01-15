import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { jobsAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaBriefcase } from 'react-icons/fa';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getAll();
      setJobs(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.delete(id);
        setJobs(jobs.filter(job => job.id !== id));
        setError('');
      } catch (err) {
        setError('Failed to delete job');
        console.error('Error deleting job:', err);
      }
    }
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:8080${photoPath}`;
  };

  return (
    <DashboardLayout role="admin">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Demand Lines</h1>
        <Link
          to="/admin/jobs/add"
          className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Demand Line
        </Link>
      </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaBriefcase className="text-5xl mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold mb-2">No Demand Lines Found</h2>
              <p>Start by adding a new demand line.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Required (M/F)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          M: {job.requiredMale || 0} | F: {job.requiredFemale || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {job.currency || '$'} {job.salary}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.deadline}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/jobs/edit/${job.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </DashboardLayout>
  );
};

export default AdminJobs;

