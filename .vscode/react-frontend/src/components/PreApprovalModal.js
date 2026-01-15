import React, { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

const PreApprovalModal = ({ isOpen, onClose, onSave, jobTitle, vacancyCount }) => {
  const [formData, setFormData] = useState({
    preApprovalDate: new Date().toISOString().split('T')[0],
    lotNo: '',
    chalaniNo: '',
    remarks: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Add Pre Approvals</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Pre Approval Date */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Pre Approval Date</label>
            <input
              type="date"
              name="preApprovalDate"
              value={formData.preApprovalDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Lot No */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Lot No.</label>
            <input
              type="text"
              name="lotNo"
              value={formData.lotNo}
              onChange={handleChange}
              placeholder="Enter Lot Number"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Chalani No */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Chalani No.</label>
            <input
              type="text"
              name="chalaniNo"
              value={formData.chalaniNo}
              onChange={handleChange}
              placeholder="Enter Chalani Number"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Job Info (Read Only) */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
             <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">{jobTitle || 'Job Position'}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                   {vacancyCount} Vacancies
                </span>
             </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              placeholder="Optional remarks..."
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
            >
              Skip
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 flex items-center"
            >
              <FaSave className="mr-2" />
              Save Pre Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreApprovalModal;
