import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { jobsAPI, demandDetailsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaArrowLeft,
  FaEdit,
  FaPlus,
  FaTimes,
  FaFileAlt,
  FaExclamationCircle,
  FaNewspaper,
  FaCheckCircle,
  FaTrash
} from 'react-icons/fa';

const AdminDemandDetails = () => {
  const { company } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAgent = user?.role === 'AGENT';
  const canList = (key) => (isAgent ? !!user?.permissions?.[key]?.list : true);
  const canDetail = (key) => (isAgent ? !!user?.permissions?.[key]?.detail : true);
  const canAdd = (key) => (isAgent ? !!user?.permissions?.[key]?.add : true);
  const canModify = (key) => (isAgent ? !!user?.permissions?.[key]?.modify : true);
  const canRemove = (key) => (isAgent ? !!user?.permissions?.[key]?.remove : true);
  const [loading, setLoading] = useState(true);
  const [demand, setDemand] = useState(null);
  const [activeTab, setActiveTab] = useState('demandLines');
  
  // Modals
  const [showAddPreApproval, setShowAddPreApproval] = useState(false);
  const [showAddAdvertisement, setShowAddAdvertisement] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [showAddIssue, setShowAddIssue] = useState(false);

  // Data states
  const [demandLines, setDemandLines] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [preApprovals, setPreApprovals] = useState([]);
  const [files, setFiles] = useState([]);
  const [issues, setIssues] = useState([]);

  // Form states
  const [demandLineForm, setDemandLineForm] = useState({
    job: '',
    requiredMale: '',
    requiredFemale: '',
    salary: '',
    currency: '$',
    overtime: '0',
    workingHours: '0',
    workDayPerWeek: '',
    yearlyLeave: '',
    yearlyLeaveAsPerPolicy: false,
    food: 'Yes',
    housing: 'Yes',
    tenure: ''
  });

  const [preApprovalForm, setPreApprovalForm] = useState({
    preApprovalDate: '',
    lotNo: '',
    chalaniNo: '',
    jobQuantities: {},
    remarks: ''
  });

  const [advertisementForm, setAdvertisementForm] = useState({
    newspaper: '',
    publishedDate: '',
    pageNo: '',
    remarks: ''
  });

  const [fileForm, setFileForm] = useState({
    name: '',
    file: null,
    description: ''
  });

  const [issueForm, setIssueForm] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchDemandDetails();
  }, [company]);

  const fetchDemandDetails = async () => {
    try {
      const response = await demandDetailsAPI.getByCompany(company);
      const data = response.data;
      
      if (data.demand) {
        setDemand(data.demand);
      } else if (data.demandLines && data.demandLines.length > 0) {
        const firstJob = data.demandLines[0];
        setDemand({
          company: firstJob.company || company,
          country: firstJob.country || '',
          companyDetail: firstJob.description || '',
          demandExpiry: firstJob.deadline || ''
        });
      }
      
      // Set demand lines from jobs
      if (data.demandLines) {
        setDemandLines(data.demandLines.map(job => ({
          id: job.id,
          job: job.title,
          requiredMale: job.requiredMale || 0,
          requiredFemale: job.requiredFemale || 0,
          salary: job.salary,
          currency: job.currency || '$',
          overtime: job.overtime || '0',
          workingHours: job.workingHours || '0',
          workDayPerWeek: job.workDaysPerWeek || '',
          yearlyLeave: job.yearlyLeave || '',
          food: job.food || 'Yes',
          housing: job.housing || 'Yes',
          tenure: job.tenure || '',
          applicants: 0
        })));
      }
      
      // Set advertisements, files, and issues
      if (data.advertisements) {
        setAdvertisements(data.advertisements);
      }
      if (data.files) {
        setFiles(data.files);
      }
      if (data.issues) {
        setIssues(data.issues);
      }
      
      // Set pre-approvals from jobs that have pre-approval data
      if (data.demandLines) {
        const preApprovalsData = data.demandLines
          .filter(job => job.preApprovalDate || job.lotNo || job.chalaniNo)
          .map(job => ({
            id: job.id,
            preApprovalDate: job.preApprovalDate,
            lotNo: job.lotNo,
            chalaniNo: job.chalaniNo,
            remarks: job.remarks,
            jobQuantities: {}
          }));
        setPreApprovals(preApprovalsData);
      }
    } catch (err) {
      console.error('Error fetching demand:', err);
      // Fallback to old method if API fails
      try {
        const response = await jobsAPI.getAll();
        const jobs = response.data.filter(job => job.company === company);
        if (jobs.length > 0) {
          const firstJob = jobs[0];
          setDemand({
            company: firstJob.company,
            country: firstJob.country,
            companyDetail: firstJob.description || '',
            demandExpiry: firstJob.deadline
          });
          setDemandLines(jobs.map(job => ({
            id: job.id,
            job: job.title,
            requiredMale: job.requiredMale || 0,
            requiredFemale: job.requiredFemale || 0,
            salary: job.salary,
            currency: job.currency || '$',
            overtime: job.overtime || '0',
            workingHours: job.workingHours || '0',
            workDayPerWeek: job.workDaysPerWeek || '',
            yearlyLeave: job.yearlyLeave || '',
            food: job.food || 'Yes',
            housing: job.housing || 'Yes',
            tenure: job.tenure || '',
            applicants: 0
          })));
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    
    // Auto-select first available tab if current one is not allowed
    if (isAgent) {
      const allowedTabs = [];
      if (canList('demandLines')) allowedTabs.push('demandLines');
      if (canList('advertisement')) allowedTabs.push('advertisements');
      if (canList('preApproval')) allowedTabs.push('preApprovals');
      if (canList('demandFiles')) allowedTabs.push('files');
      if (canList('demandIssues')) allowedTabs.push('issues');
      
      if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
        setActiveTab(allowedTabs[0]);
      }
    }
  }, [loading, user, activeTab]);

  const handleAddDemandLine = () => {
    if (!demandLineForm.job) {
      alert('Please enter a job title');
      return;
    }
    
    const newLine = {
      id: Date.now(),
      ...demandLineForm,
      applicants: 0
    };
    setDemandLines([...demandLines, newLine]);
    setDemandLineForm({
      job: '',
      requiredMale: '',
      requiredFemale: '',
      salary: '',
      currency: '$',
      overtime: '0',
      workingHours: '0',
      workDayPerWeek: '',
      yearlyLeave: '',
      yearlyLeaveAsPerPolicy: false,
      food: 'Yes',
      housing: 'Yes',
      tenure: ''
    });
  };

  const handleDeleteDemandLine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this demand line?')) {
      return;
    }
    
    try {
      await jobsAPI.delete(id);
      const remainingLines = demandLines.filter(line => line.id !== id);
      setDemandLines(remainingLines);
      
      if (remainingLines.length === 0) {
        navigate('/admin/demands');
      } else {
        // Refresh demand details
        fetchDemandDetails();
      }
    } catch (err) {
      alert('Error deleting demand line: ' + (err.response?.data?.error || err.message));
      console.error('Error deleting demand line:', err);
    }
  };

  const handleAddPreApproval = async () => {
    if (!preApprovalForm.preApprovalDate || !preApprovalForm.lotNo) {
      alert('Please fill in required fields (Pre Approval Date and Lot No.)');
      return;
    }

    try {
      // Get jobs to update - either from jobQuantities or all demand lines
      const jobsToUpdate = Object.keys(preApprovalForm.jobQuantities || {}).length > 0
        ? demandLines.filter(line => preApprovalForm.jobQuantities[line.id] > 0)
        : demandLines;

      if (jobsToUpdate.length === 0) {
        alert('Please select at least one job to update');
        return;
      }

      // Update each job with pre-approval data
      const updatePromises = jobsToUpdate.map(job => 
        jobsAPI.updatePreApproval(job.id, {
          preApprovalDate: preApprovalForm.preApprovalDate,
          lotNo: preApprovalForm.lotNo,
          chalaniNo: preApprovalForm.chalaniNo || '',
          remarks: preApprovalForm.remarks || ''
        })
      );

      await Promise.all(updatePromises);
      
      // Refresh demand details to get updated pre-approvals
      await fetchDemandDetails();
      
      setShowAddPreApproval(false);
      setPreApprovalForm({
        preApprovalDate: '',
        lotNo: '',
        chalaniNo: '',
        jobQuantities: {},
        remarks: ''
      });
    } catch (err) {
      alert('Error saving pre-approval: ' + (err.response?.data?.error || err.message));
      console.error('Error saving pre-approval:', err);
    }
  };

  const handleAddAdvertisement = async () => {
    if (!advertisementForm.newspaper || !advertisementForm.publishedDate) {
      alert('Please fill in required fields');
      return;
    }
    
    try {
      // Get first job ID for this company
      if (demandLines.length === 0) {
        alert('No demand lines found. Please add a demand line first.');
        return;
      }
      
      const jobId = demandLines[0].id;
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('newspaper', advertisementForm.newspaper);
      formData.append('publishedDate', advertisementForm.publishedDate);
      if (advertisementForm.pageNo) formData.append('pageNo', advertisementForm.pageNo);
      if (advertisementForm.remarks) formData.append('remarks', advertisementForm.remarks);
      
      const response = await demandDetailsAPI.createAdvertisement(formData);
      if (response.data.success) {
        setAdvertisements([...advertisements, response.data.advertisement]);
        setShowAddAdvertisement(false);
        setAdvertisementForm({
          newspaper: '',
          publishedDate: '',
          pageNo: '',
          remarks: ''
        });
      }
    } catch (err) {
      alert('Error adding advertisement: ' + (err.response?.data?.error || err.message));
      console.error('Error adding advertisement:', err);
    }
  };

  const handleAddFile = async () => {
    if (!fileForm.file) {
      alert('Please select a file');
      return;
    }
    
    try {
      if (demandLines.length === 0) {
        alert('No demand lines found. Please add a demand line first.');
        return;
      }
      
      const jobId = demandLines[0].id;
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('name', fileForm.name || fileForm.file.name);
      formData.append('file', fileForm.file);
      if (fileForm.description) formData.append('description', fileForm.description);
      
      const response = await demandDetailsAPI.uploadFile(formData);
      if (response.data.success) {
        setFiles([...files, response.data.file]);
        setShowAddFile(false);
        setFileForm({ name: '', file: null, description: '' });
      }
    } catch (err) {
      alert('Error uploading file: ' + (err.response?.data?.error || err.message));
      console.error('Error uploading file:', err);
    }
  };

  const handleAddIssue = async () => {
    if (!issueForm.title || !issueForm.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      if (demandLines.length === 0) {
        alert('No demand lines found. Please add a demand line first.');
        return;
      }
      
      const jobId = demandLines[0].id;
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('title', issueForm.title);
      formData.append('description', issueForm.description);
      
      const response = await demandDetailsAPI.createIssue(formData);
      if (response.data.success) {
        setIssues([...issues, response.data.issue]);
        setShowAddIssue(false);
        setIssueForm({ title: '', description: '' });
      }
    } catch (err) {
      alert('Error adding issue: ' + (err.response?.data?.error || err.message));
      console.error('Error adding issue:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={isAgent ? "agent" : "admin"}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!demand) {
    return (
      <DashboardLayout role={isAgent ? "agent" : "admin"}>
        <div className="text-center py-12">
          <p className="text-gray-500">Demand not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isAgent && !canDetail('demand')) {
    return (
      <DashboardLayout role="agent">
        <div className="text-center py-12">
          <p className="text-gray-500">You do not have permission to view this demand.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={isAgent ? "agent" : "admin"}>
      <div className="mb-6">
        <button
          onClick={() => navigate(isAgent ? '/agent/demands' : '/admin/demands')}
          className="text-gray-600 hover:text-gray-900 flex items-center mb-4 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Demands
        </button>
      </div>

      {/* Demand Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{demand.company} Details</h1>
          {(!isAgent || canModify('demandLines')) && (
            <button 
              onClick={() => {
                if (demandLines.length > 0) {
                  navigate(`/admin/jobs/edit/${demandLines[0].id}`);
                } else {
                  alert('No demand lines to edit');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <FaEdit /> Edit Demand
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Country:</p>
            <p className="font-semibold text-gray-900">{demand.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Company Name:</p>
            <p className="font-semibold text-gray-900">{demand.company}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Company Detail:</p>
            <p className="font-semibold text-gray-900">{demand.companyDetail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Demand Expiry:</p>
            <p className="font-semibold text-gray-900">{demand.demandExpiry}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {(!isAgent || canAdd('preApproval')) && (
            <button
              onClick={() => setShowAddPreApproval(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Pre Approvals
            </button>
          )}
          {(!isAgent || canAdd('advertisement')) && (
            <button
              onClick={() => setShowAddAdvertisement(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Advertisements
            </button>
          )}
          {(!isAgent || canAdd('demandIssues')) && (
            <button
              onClick={() => setShowAddIssue(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add issue
            </button>
          )}
          {(!isAgent || canAdd('demandFiles')) && (
            <button
              onClick={() => setShowAddFile(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add File
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {canList('demandLines') && (
            <button
              onClick={() => setActiveTab('demandLines')}
              className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
                activeTab === 'demandLines' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Demand Lines ({demandLines.length})
            </button>
          )}
          {canList('advertisement') && (
            <button
              onClick={() => setActiveTab('advertisements')}
              className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
                activeTab === 'advertisements' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaNewspaper /> Advertisements ({advertisements.length})
            </button>
          )}
          {canList('preApproval') && (
            <button
              onClick={() => setActiveTab('preApprovals')}
              className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
                activeTab === 'preApprovals' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaCheckCircle /> Pre-Approval Lines ({preApprovals.length})
            </button>
          )}
          {canList('demandFiles') && (
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
                activeTab === 'files' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFileAlt /> Files ({files.length})
            </button>
          )}
          {canList('demandIssues') && (
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
                activeTab === 'issues' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaExclamationCircle /> Issues ({issues.length})
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div>
          {/* Demand Lines Tab */}
          {activeTab === 'demandLines' && canList('demandLines') && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-green-600 mb-2">Demand Lines</h3>
                <p className="text-gray-600 text-sm mb-4">Click to view details about each demand line.</p>
              </div>

              {demandLines.length === 0 ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  Sorry, No demand lines have been added.
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {demandLines.map((line) => (
                    <div key={line.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Required male:</p>
                          <p className="font-semibold">{line.requiredMale}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Required female:</p>
                          <p className="font-semibold">{line.requiredFemale}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Currency:</p>
                          <p className="font-semibold">{line.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Salary:</p>
                          <p className="font-semibold">{line.salary}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Work Day per Week:</p>
                          <p className="font-semibold">{line.workDayPerWeek}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Working Hours:</p>
                          <p className="font-semibold">{line.workingHours} hrs</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Overtime:</p>
                          <p className="font-semibold">{line.overtime} hr</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Yearlyleave:</p>
                          <p className="font-semibold">{line.yearlyLeaveAsPerPolicy ? 'As per company policy' : line.yearlyLeave}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Food:</p>
                          <p className="font-semibold">{line.food === 'As per company policy' ? 'As per company policy' : line.food}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Housing:</p>
                          <p className="font-semibold">{line.housing === 'As per company policy' ? 'As per company policy' : line.housing}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tenure:</p>
                          <p className="font-semibold">{line.tenure}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-2">
                        {(!isAgent || canModify('demandLines')) && (
                          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Edit
                          </button>
                        )}
                        {(!isAgent || canRemove('demandLines')) && (
                          <button
                            onClick={() => handleDeleteDemandLine(line.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}
                        {(!isAgent || canAdd('applications')) && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Apply
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{line.applicants} Applicants</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Demand Line Form */}
              {(!isAgent || canAdd('demandLines')) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-700 mb-4">Add Demand Line</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job:</label>
                    <input
                      type="text"
                      value={demandLineForm.job}
                      onChange={(e) => setDemandLineForm({ ...demandLineForm, job: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Job"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours:</label>
                    <input
                      type="text"
                      value={demandLineForm.workingHours}
                      onChange={(e) => setDemandLineForm({ ...demandLineForm, workingHours: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0 hr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Male:</label>
                    <input
                      type="number"
                      value={demandLineForm.requiredMale}
                      onChange={(e) => setDemandLineForm({ ...demandLineForm, requiredMale: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Required Male"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Day Per Week:</label>
                    <input
                      type="text"
                      value={demandLineForm.workDayPerWeek}
                      onChange={(e) => setDemandLineForm({ ...demandLineForm, workDayPerWeek: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Work Day Per Week"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Female:</label>
                    <input
                      type="number"
                      value={demandLineForm.requiredFemale}
                      onChange={(e) => setDemandLineForm({ ...demandLineForm, requiredFemale: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Required Female"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Leave:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={demandLineForm.yearlyLeave}
                        onChange={(e) => setDemandLineForm({ ...demandLineForm, yearlyLeave: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Yearly Leave"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={demandLineForm.yearlyLeaveAsPerPolicy}
                          onChange={(e) => setDemandLineForm({ ...demandLineForm, yearlyLeaveAsPerPolicy: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm">OR As per company policy</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary:</label>
                    <input
                      type="text"
                      value={demandLineForm.salary}
                      onChange={(e) => setDemandLineForm({ ...demandLineForm, salary: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Salary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food:</label>
                    <div className="flex gap-4">
                      {['Yes', 'No', 'As per company policy'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="food"
                            value={option}
                            checked={demandLineForm.food === option}
                            onChange={(e) => setDemandLineForm({ ...demandLineForm, food: e.target.value })}
                            className="mr-2"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency:</label>
                    <select
                      value={demandLineForm.currency}
                      onChange={(e) => setDemandLineForm({ ...demandLineForm, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="$">$</option>
                      <option value="€">€</option>
                      <option value="£">£</option>
                      <option value="₹">₹</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Housing:</label>
                    <div className="flex gap-4">
                      {['Yes', 'No', 'As per company policy'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="housing"
                            value={option}
                            checked={demandLineForm.housing === option}
                            onChange={(e) => setDemandLineForm({ ...demandLineForm, housing: e.target.value })}
                            className="mr-2"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overtime:</label>
                    <input
                      type="text"
                      value={demandLineForm.overtime}
                      onChange={(e) => setDemandLineForm({ ...demandLineForm, overtime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0 hr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tenure:</label>
                    <input
                      type="text"
                      value={demandLineForm.tenure}
                      onChange={(e) => setDemandLineForm({ ...demandLineForm, tenure: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Tenure"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddDemandLine}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
              )}
            </div>
          )}

          {/* Advertisements Tab */}
          {activeTab === 'advertisements' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-green-600 mb-2">Advertisements</h3>
                <p className="text-gray-600 text-sm mb-4">Click to view details about each demand line.</p>
              </div>
              {advertisements.length === 0 ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  Sorry, No advertisements have been added.
                </div>
              ) : (
                <div className="space-y-4">
                  {advertisements.map((ad) => (
                    <div key={ad.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{ad.newspaper}</p>
                        <p className="text-sm text-gray-600">Published: {ad.publishedDate} | Page: {ad.pageNo}</p>
                        {ad.remarks && <p className="text-sm text-gray-600 mt-2">{ad.remarks}</p>}
                      </div>
                      {(!isAgent || canRemove('advertisement')) && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this advertisement?')) {
                            try {
                              await demandDetailsAPI.deleteAdvertisement(ad.id);
                              setAdvertisements(advertisements.filter(a => a.id !== ad.id));
                            } catch (err) {
                              alert('Error deleting advertisement: ' + (err.response?.data?.error || err.message));
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pre-Approval Lines Tab */}
          {activeTab === 'preApprovals' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-green-600 mb-2">Pre-Approval Lines</h3>
                <p className="text-gray-600 text-sm mb-4">Click to view details about each pre-approval.</p>
              </div>
              {preApprovals.length === 0 ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  Sorry, No pre-approvals have been added.
                </div>
              ) : (
                <div className="space-y-4">
                  {preApprovals.map((pa) => (
                    <div key={pa.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-semibold">Lot No: {pa.lotNo} | Date: {pa.preApprovalDate}</p>
                      <p className="text-sm text-gray-600">Chalani No: {pa.chalaniNo}</p>
                      {pa.remarks && <p className="text-sm text-gray-600 mt-2">{pa.remarks}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-green-600 mb-2">Files</h3>
                <p className="text-gray-600 text-sm mb-4">Click to view details about each file.</p>
              </div>
              {files.length === 0 ? (
                <p className="text-red-500">No files.</p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{file.name}</p>
                        {file.description && <p className="text-sm text-gray-600">{file.description}</p>}
                        {file.filePath && (
                          <a href={`http://localhost:8080${file.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-1">
                            View File
                          </a>
                        )}
                      </div>
                      {(!isAgent || canRemove('demandFiles')) && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this file?')) {
                            try {
                              await demandDetailsAPI.deleteFile(file.id);
                              setFiles(files.filter(f => f.id !== file.id));
                            } catch (err) {
                              alert('Error deleting file: ' + (err.response?.data?.error || err.message));
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Issues Tab */}
          {activeTab === 'issues' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-green-600 mb-2">Issues</h3>
                <p className="text-gray-600 text-sm mb-4">Click to view details about each issue.</p>
              </div>
              {issues.length === 0 ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  Sorry, No issues have been added.
                </div>
              ) : (
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <div key={issue.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold">{issue.title}</p>
                          <span className={`px-2 py-1 text-xs rounded ${
                            issue.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                            issue.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {issue.status || 'OPEN'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{issue.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {issue.status === 'OPEN' && (!isAgent || canModify('demandIssues')) && (
                          <button
                            onClick={async () => {
                              try {
                                await demandDetailsAPI.updateIssueStatus(issue.id, 'RESOLVED');
                                setIssues(issues.map(i => i.id === issue.id ? { ...i, status: 'RESOLVED' } : i));
                              } catch (err) {
                                alert('Error updating issue: ' + (err.response?.data?.error || err.message));
                              }
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Mark as Resolved"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        {(!isAgent || canRemove('demandIssues')) && (
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this issue?')) {
                              try {
                                await demandDetailsAPI.deleteIssue(issue.id);
                                setIssues(issues.filter(i => i.id !== issue.id));
                              } catch (err) {
                                alert('Error deleting issue: ' + (err.response?.data?.error || err.message));
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Pre Approval Modal */}
      {showAddPreApproval && (!isAgent || canAdd('preApproval')) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">Add Pre Approvals</h3>
              <button onClick={() => setShowAddPreApproval(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pre Approval Date:</label>
                <input
                  type="date"
                  value={preApprovalForm.preApprovalDate}
                  onChange={(e) => setPreApprovalForm({ ...preApprovalForm, preApprovalDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot No.:</label>
                <input
                  type="text"
                  value={preApprovalForm.lotNo}
                  onChange={(e) => setPreApprovalForm({ ...preApprovalForm, lotNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chalani No.:</label>
                <input
                  type="text"
                  value={preApprovalForm.chalaniNo}
                  onChange={(e) => setPreApprovalForm({ ...preApprovalForm, chalaniNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Reference No."
                />
              </div>
              {demandLines.map((line) => (
                <div key={line.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{line.job}:</label>
                  <input
                    type="number"
                    value={preApprovalForm.jobQuantities[line.id] || 0}
                    onChange={(e) => setPreApprovalForm({
                      ...preApprovalForm,
                      jobQuantities: { ...preApprovalForm.jobQuantities, [line.id]: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks:</label>
                <textarea
                  value={preApprovalForm.remarks}
                  onChange={(e) => setPreApprovalForm({ ...preApprovalForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Remarks"
                  rows="4"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowAddPreApproval(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleAddPreApproval}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Advertisement Modal */}
      {showAddAdvertisement && (!isAgent || canAdd('advertisement')) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="bg-green-500 text-white px-6 py-3 -mx-6 -mt-6 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Advertisement</h3>
              <button onClick={() => setShowAddAdvertisement(false)} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Newspaper:</label>
                <input
                  type="text"
                  value={advertisementForm.newspaper}
                  onChange={(e) => setAdvertisementForm({ ...advertisementForm, newspaper: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Kantipur Daily"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Published Date:</label>
                <input
                  type="date"
                  value={advertisementForm.publishedDate}
                  onChange={(e) => setAdvertisementForm({ ...advertisementForm, publishedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page No.:</label>
                <input
                  type="text"
                  value={advertisementForm.pageNo}
                  onChange={(e) => setAdvertisementForm({ ...advertisementForm, pageNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Page No."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks:</label>
                <input
                  type="text"
                  value={advertisementForm.remarks}
                  onChange={(e) => setAdvertisementForm({ ...advertisementForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Remarks"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleAddAdvertisement}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add File Modal */}
      {showAddFile && (!isAgent || canAdd('demandFiles')) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">Add File</h3>
              <button onClick={() => setShowAddFile(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                <input
                  type="text"
                  value={fileForm.name}
                  onChange={(e) => setFileForm({ ...fileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Name of file"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => setFileForm({ ...fileForm, file: e.target.files[0] })}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
                  >
                    Choose File
                  </label>
                  <span className="text-sm text-gray-500">
                    {fileForm.file ? fileForm.file.name : 'no file selected'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                <textarea
                  value={fileForm.description}
                  onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="File Description"
                  rows="4"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowAddFile(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleAddFile}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {showAddIssue && (!isAgent || canAdd('demandIssues')) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">Add Issue</h3>
              <button onClick={() => setShowAddIssue(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title:</label>
                <input
                  type="text"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Issue Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Issue Description"
                  rows="4"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowAddIssue(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleAddIssue}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDemandDetails;

