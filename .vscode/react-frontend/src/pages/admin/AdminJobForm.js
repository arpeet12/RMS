import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { jobsAPI } from '../../services/api';
import { FaArrowLeft, FaSave, FaTrash } from 'react-icons/fa';
import PreApprovalModal from '../../components/PreApprovalModal';

const AdminJobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    country: '',
    company: '',
    salary: '',
    vacancyCount: '',
    deadline: '',
    image: null,
    // New Demand Fields
    requiredMale: '',
    requiredFemale: '',
    currency: '$',
    overtime: '0',
    workingHours: '',
    workDaysPerWeek: '',
    yearlyLeave: '',
    food: 'Yes',
    housing: 'Yes',
    tenure: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingImagePath, setExistingImagePath] = useState(null);

  // Pre Approval Modal State
  const [showPreApprovalModal, setShowPreApprovalModal] = useState(false);
  const [createdJobId, setCreatedJobId] = useState(null);
  const [createdJobTitle, setCreatedJobTitle] = useState('');
  const [createdJobVacancy, setCreatedJobVacancy] = useState(0);

  useEffect(() => {
    if (isEdit) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await jobsAPI.getById(id);
      const job = response.data;
      setFormData({
        title: job.title || '',
        description: job.description || '',
        country: job.country || '',
        company: job.company || '',
        salary: job.salary || '',
        vacancyCount: job.vacancyCount || 1,
        deadline: job.deadline || '',
        requiredMale: job.requiredMale || '',
        requiredFemale: job.requiredFemale || '',
        currency: job.currency || '$',
        overtime: job.overtime || '0',
        workingHours: job.workingHours || '',
        workDaysPerWeek: job.workDaysPerWeek || '',
        yearlyLeave: job.yearlyLeave || '',
        food: job.food || 'Yes',
        housing: job.housing || 'Yes',
        tenure: job.tenure || ''
      });
      if (job.photoPath) {
        setExistingImagePath(job.photoPath);
        const imageUrl = job.photoPath.startsWith('http') 
          ? job.photoPath 
          : `http://localhost:8080${job.photoPath}`;
        setImagePreview(imageUrl);
      }
    } catch (err) {
      setError('Failed to load job');
      console.error('Error fetching job:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || 'No description');
      formDataToSend.append('country', formData.country);
      if (formData.company) formDataToSend.append('company', formData.company);
      formDataToSend.append('salary', formData.salary);
      
      // Handle numeric fields
      const vacCount = formData.vacancyCount ? formData.vacancyCount : '0';
      formDataToSend.append('vacancyCount', vacCount);
      
      formDataToSend.append('deadline', formData.deadline);

      // Append new fields - only if they have values to avoid 400 Bad Request
      if (formData.requiredMale) formDataToSend.append('requiredMale', formData.requiredMale);
      if (formData.requiredFemale) formDataToSend.append('requiredFemale', formData.requiredFemale);
      
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('overtime', formData.overtime);
      formDataToSend.append('workingHours', formData.workingHours);
      formDataToSend.append('workDaysPerWeek', formData.workDaysPerWeek);
      formDataToSend.append('yearlyLeave', formData.yearlyLeave);
      formDataToSend.append('food', formData.food);
      formDataToSend.append('housing', formData.housing);
      formDataToSend.append('tenure', formData.tenure);

      if (image) {
        formDataToSend.append('image', image);
      }

      let response;
      if (isEdit) {
        response = await jobsAPI.update(id, formDataToSend);
      } else {
        response = await jobsAPI.create(formDataToSend);
      }
      
      const savedJob = response.data.job;
      setCreatedJobId(savedJob.id);
      setCreatedJobTitle(savedJob.title);
      setCreatedJobVacancy(savedJob.vacancyCount);
      setShowPreApprovalModal(true);

      // navigate('/admin/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save job');
      console.error('Error saving job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreApprovalSave = async (preApprovalData) => {
    try {
      setLoading(true);
      await jobsAPI.updatePreApproval(createdJobId, preApprovalData);
      setShowPreApprovalModal(false);
      navigate('/admin/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save pre-approval');
      console.error('Error saving pre-approval:', err);
      // Keep modal open on error or show toast
    } finally {
        setLoading(false);
    }
  };

  const handlePreApprovalClose = () => {
    setShowPreApprovalModal(false);
    navigate('/admin/jobs');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this demand line?')) {
      return;
    }

    try {
      setLoading(true);
      await jobsAPI.delete(id);
      navigate('/admin/jobs');
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(err.response?.data?.error || 'Failed to delete demand line');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <PreApprovalModal
        isOpen={showPreApprovalModal}
        onClose={handlePreApprovalClose}
        onSave={handlePreApprovalSave}
        jobTitle={createdJobTitle}
        vacancyCount={createdJobVacancy}
      />
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Demand Line' : 'Add Demand Line'}
          </h1>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Job Title */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Job:</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Job"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Country */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Country:</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Company */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Company:</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Deadline */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Deadline:</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Required Male */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Required Male:</label>
                  <input
                    type="number"
                    name="requiredMale"
                    value={formData.requiredMale}
                    onChange={handleChange}
                    placeholder="Required Male"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Required Female */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Required Female:</label>
                  <input
                    type="number"
                    name="requiredFemale"
                    value={formData.requiredFemale}
                    onChange={handleChange}
                    placeholder="Required Female"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Salary */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Salary:</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Salary"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Currency */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Currency:</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="$">$</option>
                    <option value="€">€</option>
                    <option value="£">£</option>
                    <option value="MYR">MYR</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>

                {/* Overtime */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Overtime:</label>
                  <input
                    type="text"
                    name="overtime"
                    value={formData.overtime}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Vacancy Count */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Total Vacancy:</label>
                  <input
                    type="number"
                    name="vacancyCount"
                    value={formData.vacancyCount}
                    onChange={handleChange}
                    placeholder="Total Vacancy"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Working Hours */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Working Hours:</label>
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    placeholder="0 hr"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Work Day Per Week */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Work Day Per Week:</label>
                  <input
                    type="text"
                    name="workDaysPerWeek"
                    value={formData.workDaysPerWeek}
                    onChange={handleChange}
                    placeholder="Work Day Per Week"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Yearly Leave */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Yearly Leave:</label>
                  <div className="w-2/3 flex flex-col space-y-2">
                    <input
                        type="text"
                        name="yearlyLeave"
                        value={formData.yearlyLeave}
                        onChange={handleChange}
                        placeholder="Yearly Leave"
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-600">OR</span>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormData(prev => ({ ...prev, yearlyLeave: 'As per company policy' }));
                                    } else {
                                        setFormData(prev => ({ ...prev, yearlyLeave: '' }));
                                    }
                                }}
                                checked={formData.yearlyLeave === 'As per company policy'}
                                className="form-checkbox text-green-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">As per company policy</span>
                        </label>
                    </div>
                  </div>
                </div>

                {/* Food */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Food:</label>
                  <div className="w-2/3 flex space-x-4">
                    {['Yes', 'No', 'As per company policy'].map((option) => (
                      <label key={option} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="food"
                          value={option}
                          checked={formData.food === option}
                          onChange={handleChange}
                          className="form-radio text-green-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Housing */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Housing:</label>
                  <div className="w-2/3 flex space-x-4">
                    {['Yes', 'No', 'As per company policy'].map((option) => (
                      <label key={option} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="housing"
                          value={option}
                          checked={formData.housing === option}
                          onChange={handleChange}
                          className="form-radio text-green-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tenure */}
                <div className="flex items-center">
                  <label className="w-1/3 text-gray-700 font-semibold">Tenure:</label>
                  <input
                    type="text"
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleChange}
                    placeholder="Tenure"
                    className="w-2/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Image Upload */}
                <div className="flex items-start">
                  <label className="w-1/3 text-gray-700 font-semibold pt-2">Image:</label>
                  <div className="w-2/3">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-32 w-auto object-cover rounded border border-gray-200" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description (Full Width) */}
            <div className="mt-4">
              <label className="block text-gray-700 font-semibold mb-2">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Job Description"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              ></textarea>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-200"
                >
                {loading ? 'Saving...' : 'Submit'}
                </button>

                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center"
                  >
                    <FaTrash className="mr-2" /> Delete Demand
                  </button>
                )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminJobForm;
