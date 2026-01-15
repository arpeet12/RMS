import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { candidateAPI } from '../../services/api';
import {
  FaIdCard,
  FaFileMedical,
  FaFileContract,
  FaHeartbeat,
  FaPassport,
  FaShieldAlt,
  FaDownload,
  FaEye,
  FaClock
} from 'react-icons/fa';

const CandidateDocuments = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await candidateAPI.getDocuments();
      setCandidate(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-800';
    if (status === 'REJECTED') return 'bg-red-100 text-red-800';
    if (status === 'IN_PROGRESS' || status === 'PENDING') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const documents = [
    {
      name: 'Passport Photo',
      status: candidate?.passportStatus,
      path: candidate?.passportPhotoPath,
      icon: FaIdCard,
      color: 'text-blue-600'
    },
    {
      name: 'Medical Report',
      status: candidate?.medicalStatus,
      path: candidate?.medicalReportPath,
      icon: FaFileMedical,
      color: 'text-green-600'
    },
    {
      name: 'Police Report',
      status: candidate?.policeReportStatus,
      path: candidate?.policeReportPath,
      icon: FaFileContract,
      color: 'text-red-600'
    },
    {
      name: 'Health Report',
      status: candidate?.healthReportStatus,
      path: candidate?.healthReportPath,
      icon: FaHeartbeat,
      color: 'text-yellow-600'
    },
    {
      name: 'Visa Document',
      status: candidate?.visaStatus,
      path: candidate?.visaDocumentPath,
      icon: FaPassport,
      color: 'text-purple-600'
    },
    {
      name: 'Insurance Document',
      status: candidate?.insuranceStatus,
      path: candidate?.insuranceDocumentPath,
      icon: FaShieldAlt,
      color: 'text-indigo-600'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600 mt-2">View and download your documents uploaded by admin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => {
            const Icon = doc.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Icon className={`text-3xl ${doc.color} mr-3`} />
                  <div>
                    <h3 className="font-semibold text-gray-800">{doc.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status || 'NOT_UPLOADED'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {doc.name === 'Visa Document' || doc.name === 'Insurance Document'
                    ? 'Uploaded by administrator'
                    : 'Document uploaded by admin'}
                </p>
                {doc.path ? (
                  <div className="space-y-2">
                    <a
                      href={doc.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <FaEye className="mr-2" />
                      View Document
                    </a>
                    <a
                      href={doc.path}
                      download
                      className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      <FaDownload className="mr-2" />
                      Download
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <FaClock className="mx-auto mb-2" />
                    <p className="text-sm">Document not uploaded yet</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All documents are uploaded by administrators. 
            If you need to upload or update any document, please contact the admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateDocuments;

