import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { jobsAPI, newsAPI } from '../../services/api';
import { FaStar, FaBolt, FaTag, FaPlus, FaEdit, FaTrash, FaNewspaper, FaBriefcase } from 'react-icons/fa';

const AdminEditHomepage = () => {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'news'
  const [jobs, setJobs] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // News Form State
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsFormData, setNewsFormData] = useState({ title: '', content: '', photo: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, newsRes] = await Promise.all([
        jobsAPI.getAll(),
        newsAPI.getAll()
      ]);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setNews(Array.isArray(newsRes.data) ? newsRes.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Job Handlers
  const handleToggleJobFlag = async (jobId, flag, currentValue) => {
    try {
      const updatedJobs = jobs.map(job => {
        if (job.id === jobId) {
          return { ...job, [flag]: !currentValue };
        }
        return job;
      });
      setJobs(updatedJobs); // Optimistic update

      await jobsAPI.updateFlags(jobId, { [flag]: !currentValue });
    } catch (error) {
      console.error(`Error updating ${flag}:`, error);
      fetchData(); // Revert on error
    }
  };

  // News Handlers
  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newsFormData.title);
    formData.append('content', newsFormData.content);
    if (newsFormData.photo) {
      formData.append('photo', newsFormData.photo);
    }

    try {
      if (editingNews) {
        await newsAPI.update(editingNews.id, formData);
      } else {
        await newsAPI.create(formData);
      }
      setShowNewsModal(false);
      setEditingNews(null);
      setNewsFormData({ title: '', content: '', photo: null });
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error saving news:", error);
    }
  };

  const handleEditNews = (item) => {
    setEditingNews(item);
    setNewsFormData({ title: item.title, content: item.content, photo: null });
    setShowNewsModal(true);
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        await newsAPI.delete(id);
        setNews(news.filter(n => n.id !== id));
      } catch (error) {
        console.error("Error deleting news:", error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Homepage Content</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          className={`pb-2 px-4 font-medium ${activeTab === 'jobs' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('jobs')}
        >
          <FaBriefcase className="inline mr-2" />
          Featured Jobs
        </button>
        <button
          className={`pb-2 px-4 font-medium ${activeTab === 'news' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('news')}
        >
          <FaNewspaper className="inline mr-2" />
          News & Updates
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <>
          {activeTab === 'jobs' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Urgent</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Zero Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleJobFlag(job.id, 'isUrgent', job.isUrgent)}
                          className={`p-2 rounded-full ${job.isUrgent ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          <FaBolt />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                         <button
                          onClick={() => handleToggleJobFlag(job.id, 'isFeatured', job.isFeatured)}
                          className={`p-2 rounded-full ${job.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          <FaStar />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                         <button
                          onClick={() => handleToggleJobFlag(job.id, 'isZeroCost', job.isZeroCost)}
                          className={`p-2 rounded-full ${job.isZeroCost ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          <FaTag />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'news' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setEditingNews(null);
                    setNewsFormData({ title: '', content: '', photo: null });
                    setShowNewsModal(true);
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
                >
                  <FaPlus className="mr-2" /> Add News
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden relative group">
                    <div className="h-48 bg-gray-200">
                       {item.photoPath && <img src={item.photoPath} alt={item.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{item.content}</p>
                      <div className="mt-4 flex justify-end space-x-2">
                         <button onClick={() => handleEditNews(item)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                         <button onClick={() => handleDeleteNews(item.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* News Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editingNews ? 'Edit News' : 'Add News'}</h2>
            <form onSubmit={handleNewsSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                <input
                  type="text"
                  value={newsFormData.title}
                  onChange={(e) => setNewsFormData({ ...newsFormData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Content</label>
                <textarea
                  value={newsFormData.content}
                  onChange={(e) => setNewsFormData({ ...newsFormData, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 h-32"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Photo</label>
                <input
                  type="file"
                  onChange={(e) => setNewsFormData({ ...newsFormData, photo: e.target.files[0] })}
                  className="w-full text-sm text-gray-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminEditHomepage;
