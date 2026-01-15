import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FaSave, FaUser, FaKey } from 'react-icons/fa';

const AdminSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.profilePhotoPath ? `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.profilePhotoPath}` : null);
  const [citizenshipPhoto, setCitizenshipPhoto] = useState(null);
  const [citizenshipPreview, setCitizenshipPreview] = useState(user?.citizenshipPhotoPath ? `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.citizenshipPhotoPath}` : null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
      if (user.citizenshipPhotoPath) {
        setCitizenshipPreview(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.citizenshipPhotoPath}`);
      }
      if (user.profilePhotoPath) {
        setPreview(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.profilePhotoPath}`);
      }
    }
  }, [user]);

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

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      if (citizenshipPhoto) {
        data.append('citizenshipPhoto', citizenshipPhoto);
      }

      const response = await authAPI.updateProfile(data);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Details updated successfully' });
        // Force reload to update context
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update details' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();
    if (!photo) {
      setMessage({ type: 'error', text: 'Please select a photo first' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('photo', photo);

      const response = await authAPI.updateProfile(data);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile photo updated successfully' });
        // Force reload to update profile picture in header
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update photo' });
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
    <DashboardLayout role="ADMIN" title="Settings">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Settings</h2>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b pb-2">
            <FaUser className="mr-2" /> Profile Picture
          </h3>
          <div className="flex items-center space-x-6 mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border-2 border-gray-300">
              {preview ? (
                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-4xl text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-2">Recommended: Square image, max 2MB.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpdatePhoto}
              disabled={loading || !photo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              <FaSave className="mr-2" />
              {loading && photo ? 'Uploading...' : 'Update Photo'}
            </button>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="pt-6 border-t mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b pb-2">
             <FaUser className="mr-2" /> Personal Details
          </h3>
          <form onSubmit={handleUpdateDetails} className="space-y-4">
             {/* Role (Read Only) */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
               <input
                 type="text"
                 value={user?.role || ''}
                 readOnly
                 className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
               <input
                 type="email"
                 name="email"
                 value={formData.email}
                 onChange={handleChange}
                 className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Enter email"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
               <input
                 type="text"
                 name="phone"
                 value={formData.phone}
                 onChange={handleChange}
                 className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Enter phone number"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
               <textarea
                 name="address"
                 value={formData.address}
                 onChange={handleChange}
                 rows="2"
                 className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Enter address"
               />
             </div>
             
             {/* Citizenship Upload */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship Document</label>
                <div className="flex items-center space-x-6">
                    <div className="w-32 h-20 bg-gray-100 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center">
                        {citizenshipPreview ? (
                            <img src={citizenshipPreview} alt="Citizenship" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs text-gray-400">No Image</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCitizenshipChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>
             </div>

             <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                <FaSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Section */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b pb-2">
            <FaKey className="mr-2" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
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
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
