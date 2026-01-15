import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { authAPI, agentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FaSave, FaUser, FaKey } from 'react-icons/fa';

const AgentSettings = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
  });
  const [photo, setPhoto] = useState(null);
  const [citizenshipPhoto, setCitizenshipPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.profilePhotoPath ? `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.profilePhotoPath}` : null);
  const [citizenshipPreview, setCitizenshipPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize form data with user info if available
  useEffect(() => {
    // We might need to fetch full agent profile if user object doesn't have all details
    // For now assume user object or separate fetch gets us email/phone/address
    // If not, we should fetch it here.
    const fetchProfile = async () => {
        try {
            const res = await agentAPI.getProfile();
            const p = res.data;
            setFormData(prev => ({
                ...prev,
                email: p.email || '',
                phone: p.phone || '',
                mobile: p.mobile || '',
                address: p.address || '',
            }));
            if (p.citizenshipPhotoPath) {
                setCitizenshipPreview(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${p.citizenshipPhotoPath}`);
            }
        } catch (e) {
            console.error("Failed to load profile", e);
        }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCitizenshipChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCitizenshipPhoto(file);
      setCitizenshipPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      if (photo) data.append('photo', photo);
      if (citizenshipPhoto) data.append('citizenshipPhoto', citizenshipPhoto);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('mobile', formData.mobile);
      data.append('address', formData.address);

      const response = await authAPI.updateProfile(data);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        // Force reload to update profile picture in header
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (!formData.password) {
      setMessage({ type: 'error', text: 'Please enter a new password' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('password', formData.password);

      const response = await authAPI.updateProfile(data);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setFormData({ ...formData, password: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="agent" title="Settings">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile Settings</h2>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4 border-4 border-white shadow-lg relative">
              {preview ? (
                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaUser className="text-4xl" />
                </div>
              )}
            </div>
            <label className="cursor-pointer bg-primary-50 text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors">
              <span>Change Profile Photo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="agent@example.com"
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone No</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+977-1-4000000"
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+977-9800000000"
                  />
              </div>

              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Koteshwor, Kathmandu"
                  />
              </div>

              {/* Citizenship Photo Upload */}
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship Photo / ID</label>
                  <div className="flex items-center gap-4">
                      <div className="w-32 h-20 bg-gray-100 rounded border border-gray-300 overflow-hidden flex-shrink-0">
                          {citizenshipPreview ? (
                              <img src={citizenshipPreview} alt="Citizenship" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                                  No Image
                              </div>
                          )}
                      </div>
                      <label className="cursor-pointer bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                          <span>Upload Photo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleCitizenshipChange} />
                      </label>
                  </div>
              </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FaSave />
            <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>

        <div className="border-t border-gray-200 my-8"></div>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
              >
                <FaSave className="mr-2" />
                {loading && !photo ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </form>
      </div>
    </DashboardLayout>
  );
};

export default AgentSettings;
