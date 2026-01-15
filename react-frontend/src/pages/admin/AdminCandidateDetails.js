import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI, jobsAPI } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';
import {
  FaArrowLeft,
  FaUser,
  FaChevronDown,
  FaChevronUp,
  FaFileMedical,
  FaFileContract,
  FaExclamationCircle,
  FaMoneyBillWave,
  FaPlane,
  FaFileAlt,
  FaHistory,
  FaPlus,
  FaTimes,
  FaDownload,
  FaEdit,
  FaCheck,
  FaTrash,
  FaQrcode
} from 'react-icons/fa';

const AdminCandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('medical');
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    basic: false,
    contact: false,
    jobSpec: false,
    family: false
  });

  // Modals
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [showFileView, setShowFileView] = useState(null);
  const [showTicketView, setShowTicketView] = useState(null);
  const [showAddMedicalRecord, setShowAddMedicalRecord] = useState(false);
  const [showApplyDemand, setShowApplyDemand] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const qrCodeRef = useRef(null);
  
  // Application Workflow States
  const [selectedApp, setSelectedApp] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showVisaModal, setShowVisaModal] = useState(false);
  const [showMinistryModal, setShowMinistryModal] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);
  
  const [forwardDate, setForwardDate] = useState('');
  const [visaForm, setVisaForm] = useState({ visaNumber: '', visaIssuedDate: '', visaExpiryDate: '' });
  const [ministryForm, setMinistryForm] = useState({ chalaniNo: '', approvalDate: '' });
  const [flightDate, setFlightDate] = useState('');

  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    type: '',
    value: '',
    remarks: ''
  });

  const handleCreateCV = async () => {
    if (!candidate) return;

    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 138); // Brand Blue
      doc.text(candidate.fullName.toUpperCase(), 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      let contactInfo = '';
      if (candidate.phone) contactInfo += `Phone: ${candidate.phone} | `;
      if (candidate.email) contactInfo += `Email: ${candidate.email} | `;
      if (candidate.permanentCityStreet) contactInfo += `Address: ${candidate.permanentCityStreet}, ${candidate.permanentDistrict || ''}`;
      
      // Clean up trailing separator
      if (contactInfo.endsWith(' | ')) contactInfo = contactInfo.slice(0, -3);
      
      doc.text(contactInfo, 105, 28, { align: 'center' });
      
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 32, 196, 32);

      let currentY = 40;

      // Helper for sections
      const addSection = (title, data) => {
        if (!data || data.length === 0) return;
        
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text(title.toUpperCase(), 14, currentY);
        currentY += 2;
        doc.setLineWidth(0.2);
        doc.line(14, currentY, 196, currentY);
        currentY += 6;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        data.forEach(item => {
          if (Array.isArray(item)) {
             // Label: Value format
             doc.setFont(undefined, 'bold');
             doc.text(`${item[0]}:`, 14, currentY);
             doc.setFont(undefined, 'normal');
             doc.text(String(item[1] || '-'), 60, currentY);
             currentY += 6;
          } else {
             // Plain text
             const splitText = doc.splitTextToSize(item, 180);
             doc.text(splitText, 14, currentY);
             currentY += (splitText.length * 5) + 2;
          }
        });
        currentY += 4;
      };

      // Personal Details
      addSection('Personal Details', [
        ['Date of Birth', candidate.dateOfBirth],
        ['Nationality', candidate.nationality],
        ['Passport No', candidate.passportNumber],
        ['Passport Expiry', candidate.passportExpiryDate],
        ['Gender', candidate.gender],
        ['Marital Status', candidate.spouseName ? 'Married' : 'Single'],
        ['Height', candidate.height],
        ['Weight', candidate.weight],
      ]);

      // Experience
      if (candidate.experience) {
        addSection('Experience', [candidate.experience]);
      }

      // Qualification
      if (candidate.qualification) {
        addSection('Education & Qualification', [candidate.qualification]);
      }
      
      // Skills / Training
      if (candidate.technicalCourse) {
        addSection('Technical Skills & Training', [candidate.technicalCourse]);
      }

      // Generate Blob and Upload
      const blob = doc.output('blob');
      const file = new File([blob], `${candidate.fullName.replace(/\s+/g, '_')}_CV.pdf`, { type: 'application/pdf' });
      
      setMessage({ type: 'info', text: 'Generating and uploading CV...' });
      
      await adminAPI.uploadDocument(id, 'cv', file);
      
      setMessage({ type: 'success', text: 'CV created and saved to profile successfully!' });
      fetchCandidate();
      
    } catch (error) {
      console.error('Error creating CV:', error);
      setMessage({ type: 'error', text: 'Failed to create/save CV' });
    }
  };

  const handleDownloadAll = async () => {
    try {
      setMessage({ type: 'info', text: 'Preparing download...' });
      const response = await adminAPI.downloadAllDocuments(id);
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidate.fullName.replace(/\s+/g, '_')}_Documents.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage({ type: 'success', text: 'Download started successfully!' });
    } catch (error) {
      console.error('Error downloading documents:', error);
      setMessage({ type: 'error', text: 'Failed to download documents' });
    }
  };

  const generatePDF = () => {
    if (!candidate) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138); // Brand Blue
    doc.text('Manpower System - Candidate Profile', 105, 15, { align: 'center' });
    
    // Candidate Info Header
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${candidate.fullName}`, 14, 30);
    doc.text(`Passport No: ${candidate.passportNumber || 'N/A'}`, 14, 38);
    doc.text(`Agent: ${candidate.agentName || 'N/A'}`, 14, 46);
    
    // Status Summary
    const statuses = [
      ['Visa Status', candidate.visaStatus || 'NO VISA'],
      ['Medical Status', candidate.medicalStatus || 'PENDING'],
      ['Police Report', candidate.policeReportStatus || 'PENDING'],
      ['Health Report', candidate.healthReportStatus || 'PENDING'],
      ['Insurance', candidate.insuranceStatus || 'PENDING']
    ];
    
    autoTable(doc, {
      startY: 55,
      head: [['Status Type', 'Current Status']],
      body: statuses,
      theme: 'striped',
      headStyles: { fillColor: [40, 167, 69] }
    });

    // Personal Details
    const personalDetails = [
      ['Date of Birth', candidate.dateOfBirth || '-'],
      ['Gender', candidate.gender || '-'],
      ['Nationality', candidate.nationality || '-'],
      ['Phone', candidate.phone || '-'],
      ['Address', `${candidate.permanentCityStreet || ''}, ${candidate.permanentDistrict || ''}`],
      ['Father Name', candidate.fatherName || '-'],
      ['Mother Name', candidate.motherName || '-'],
      ['Spouse Name', candidate.spouseName || '-'],
      ['Children', `${candidate.noOfSons || 0} Sons, ${candidate.noOfDaughters || 0} Daughters`],
      ['Passport Expiry', candidate.passportExpiryDate || '-']
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Attribute', 'Details']],
      body: personalDetails,
      theme: 'grid',
      headStyles: { fillColor: [100, 100, 100] }
    });

    doc.save(`${candidate.fullName.replace(/\s+/g, '_')}_Profile.pdf`);
  };

  const getQRCodeData = () => {
    if (!candidate || !candidate.passportNumber || !candidate.dateOfBirth) {
      return null;
    }
    return JSON.stringify({
      passportNumber: candidate.passportNumber,
      dateOfBirth: candidate.dateOfBirth
    });
  };

  const downloadQRCode = () => {
    if (!candidate) return;
    
    // Get the SVG element
    const svgElement = document.getElementById('candidate-qr-code')?.querySelector('svg');
    if (!svgElement) return;
    
    // Create a canvas and draw the QR code
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${candidate.fullName.replace(/\s+/g, '_')}_QRCode.png`;
        link.href = downloadUrl;
        link.click();
        URL.revokeObjectURL(downloadUrl);
        URL.revokeObjectURL(url);
      });
    };
    
    img.src = url;
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateStatus(id, statusUpdateForm.type, statusUpdateForm.value, statusUpdateForm.remarks);
      setMessage({ type: 'success', text: 'Status updated successfully' });
      setShowUpdateStatus(false);
      fetchCandidate(); // Refresh data
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const openStatusUpdate = (type, currentValue) => {
    setStatusUpdateForm({
      type,
      value: currentValue ? currentValue.toUpperCase() : '',
      remarks: ''
    });
    setShowUpdateStatus(true);
  };

  // Form states
  const [ticketForm, setTicketForm] = useState({
    airline: '',
    departureFrom: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    status: 'SCHEDULED',
    remarks: ''
  });
  const [fileForm, setFileForm] = useState({
    name: '',
    file: null,
    description: ''
  });
  const [medicalRecordForm, setMedicalRecordForm] = useState({
    healthCenter: '',
    stickerNo: '',
    medicalDate: '',
    medicalExpiry: '',
    result: 'Fit',
    remarks: ''
  });
  const [applicationForm, setApplicationForm] = useState({
    jobId: '',
    country: '',
    company: '',
    demand: '', // lotNo
    interviewed: '',
    interviewDate: '',
    interviewResult: 'Pass',
    remarks: ''
  });

  const [demands, setDemands] = useState([]);

  // Derived lists for Apply Demand modal
  const uniqueCountries = [...new Set(demands.map(d => d.country).filter(Boolean))];
  
  const uniqueCompanies = applicationForm.country 
    ? [...new Set(demands.filter(d => d.country === applicationForm.country).map(d => d.company).filter(Boolean))]
    : [];

  const uniqueDemands = (applicationForm.country && applicationForm.company)
    ? [...new Set(demands.filter(d => d.country === applicationForm.country && d.company === applicationForm.company).map(d => d.lotNo || 'General Demand'))]
    : [];

  const availableJobs = (applicationForm.country && applicationForm.company && applicationForm.demand)
    ? demands.filter(d => 
        d.country === applicationForm.country && 
        d.company === applicationForm.company && 
        (d.lotNo || 'General Demand') === applicationForm.demand
      )
    : [];

  // Mock data - replace with API calls
  const [tickets, setTickets] = useState([]);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [issues, setIssues] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [applications, setApplications] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  
  // Countries list for dropdown
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bahrain', 'Bangladesh',
    'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'China', 'Cyprus', 'Denmark', 'Egypt', 'Finland',
    'France', 'Germany', 'Greece', 'Hong Kong', 'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq',
    'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kuwait', 'Lebanon', 'Libya', 'Malaysia',
    'Malawi', 'Maldives', 'Malta', 'Mauritius', 'Mexico', 'Morocco', 'Nepal', 'Netherlands',
    'New Zealand', 'Norway', 'Oman', 'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain',
    'Sri Lanka', 'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'UAE', 'UK', 'USA', 'Vietnam'
  ];

  // Get all files from candidate documents
  const getAllFiles = () => {
    const candidateFiles = [];
    if (candidate) {
      if (candidate.passportPhotoPath) {
        candidateFiles.push({
          id: 'passport-photo',
          name: 'Passport Photo',
          path: candidate.passportPhotoPath,
          type: 'passport',
          description: 'Passport photograph'
        });
      }
      if (candidate.medicalReportPath) {
        candidateFiles.push({
          id: 'medical-report',
          name: 'Medical Report',
          path: candidate.medicalReportPath,
          type: 'medical',
          description: 'Medical examination report'
        });
      }
      if (candidate.policeReportPath) {
        candidateFiles.push({
          id: 'police-report',
          name: 'Police Report',
          path: candidate.policeReportPath,
          type: 'police',
          description: 'Police clearance report'
        });
      }
      if (candidate.healthReportPath) {
        candidateFiles.push({
          id: 'health-report',
          name: 'Health Report',
          path: candidate.healthReportPath,
          type: 'health',
          description: 'Health examination report'
        });
      }
      if (candidate.visaDocumentPath) {
        candidateFiles.push({
          id: 'visa-document',
          name: 'Visa Document',
          path: candidate.visaDocumentPath,
          type: 'visa',
          description: 'Visa document'
        });
      }
      if (candidate.insuranceDocumentPath) {
        candidateFiles.push({
          id: 'insurance-document',
          name: 'Insurance Document',
          path: candidate.insuranceDocumentPath,
          type: 'insurance',
          description: 'Insurance document'
        });
      }
      if (candidate.cvPath) {
        candidateFiles.push({
          id: 'cv-document',
          name: 'Curriculum Vitae',
          path: candidate.cvPath,
          type: 'cv',
          description: 'Generated CV'
        });
      }
    }
    return [...candidateFiles, ...additionalFiles];
  };

  const fetchCandidate = async () => {
    try {
      const response = await adminAPI.getCandidate(id);
      setCandidate(response.data.candidate);
      setMedicalRecords(response.data.medicalRecords || []);
      setApplications(response.data.applications || []);
      setStatusHistory(response.data.statusHistory || []);
      setIssues(response.data.issues || []);
    } catch (error) {
      console.error('Error fetching candidate:', error);
      const errorMsg = error.response?.data?.error || 'Failed to load candidate details';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const fetchDemands = async () => {
    try {
      const response = await jobsAPI.getAll();
      setDemands(Array.isArray(response.data) ? response.data : (response.data.jobs || []));
    } catch (error) {
      console.error('Error fetching demands:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await adminAPI.getFlightTickets(id);
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    fetchCandidate();
    fetchDemands();
    fetchTickets();
  }, [id]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAddTicket = async () => {
    try {
      await adminAPI.addFlightTicket(id, ticketForm);
      setTicketForm({
        airline: '',
        departureFrom: '',
        destination: '',
        departureDate: '',
        departureTime: '',
        status: 'SCHEDULED',
        remarks: ''
      });
      setShowAddTicket(false);
      setMessage({ type: 'success', text: 'Flight ticket added successfully' });
      fetchTickets();
    } catch (err) {
      console.error('Error adding ticket:', err);
      setMessage({ type: 'error', text: 'Failed to add flight ticket' });
    }
  };

  const onUpdateTicketStatus = async (ticket, newStatus) => {
    try {
      await adminAPI.updateFlightTicket(ticket.id, { ...ticket, status: newStatus });
      setMessage({ type: 'success', text: 'Flight status updated successfully' });
      fetchTickets();
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setMessage({ type: 'error', text: 'Failed to update flight status' });
    }
  };

  const onDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await adminAPI.deleteFlightTicket(ticketId);
      setMessage({ type: 'success', text: 'Flight ticket deleted successfully' });
      fetchTickets();
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setMessage({ type: 'error', text: 'Failed to delete flight ticket' });
    }
  };

  const handleAddFile = () => {
    if (!fileForm.file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }
    const newFile = {
      id: `additional-${additionalFiles.length + 1}`,
      name: fileForm.name || fileForm.file.name,
      description: fileForm.description,
      file: fileForm.file,
      type: fileForm.file.type,
      uploadedAt: new Date().toISOString(),
      isAdditional: true
    };
    setAdditionalFiles([...additionalFiles, newFile]);
    setShowAddFile(false);
    setFileForm({ name: '', file: null, description: '' });
    setMessage({ type: 'success', text: 'File added successfully!' });
  };

  const handleAddMedicalRecord = async () => {
    // Simple front-end validation
    if (!medicalRecordForm.healthCenter || !medicalRecordForm.medicalDate) {
      setMessage({ type: 'error', text: 'Please fill in Health Center and Medical Date' });
      return;
    }

    try {
      console.log('Adding medical record', medicalRecordForm);
      const res = await adminAPI.addMedicalRecord(id, medicalRecordForm);

      // Backend returns the saved record
      setMedicalRecords((prev) => [...prev, res.data]);
      setShowAddMedicalRecord(false);
      setMedicalRecordForm({
        healthCenter: '',
        stickerNo: '',
        medicalDate: '',
        medicalExpiry: '',
        result: 'Fit',
        remarks: ''
      });
      setMessage({ type: 'success', text: 'Medical record added successfully!' });
      alert('Medical record added successfully');
    } catch (err) {
      console.error('Error adding medical record', err);
      const errorText = err.response?.data?.error || 'Failed to add medical record';
      setMessage({ type: 'error', text: errorText });
      alert(errorText);
    }
  };

  const handleApplyDemand = async () => {
    if (!applicationForm.country) {
      setMessage({ type: 'error', text: 'Please select a demand/country' });
      return;
    }
    try {
      console.log('Adding application', applicationForm);
      const res = await adminAPI.addApplication(id, applicationForm);
      setApplications((prev) => [...prev, res.data]);
      setShowApplyDemand(false);
      setApplicationForm({
        jobId: '',
        country: '',
        company: '',
        demand: '',
        interviewed: '',
        interviewDate: '',
        interviewResult: 'Pass',
        remarks: ''
      });
      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      alert('Application submitted successfully');
    } catch (err) {
      console.error('Error submitting application', err);
      const errorText = err.response?.data?.error || 'Failed to submit application';
      setMessage({ type: 'error', text: errorText });
      alert(errorText);
    }
  };

  // Application Workflow Handlers
  const handleUpdateApplication = async (appId, data) => {
    try {
      const res = await adminAPI.updateApplication(appId, data);
      setApplications(prev => prev.map(app => app.id === appId ? res.data : app));
      setMessage({ type: 'success', text: 'Application updated successfully!' });
      return true;
    } catch (err) {
      console.error('Error updating application', err);
      setMessage({ type: 'error', text: 'Failed to update application' });
      return false;
    }
  };

  const onForwardApplication = async () => {
    if (!selectedApp || !forwardDate) {
      alert('Please select a forward date');
      return;
    }
    const success = await handleUpdateApplication(selectedApp.id, { applicationForwardedDate: forwardDate });
    if (success) {
      setShowForwardModal(false);
      setForwardDate('');
      setSelectedApp(null);
      await fetchCandidate(); // Refresh to show updated data
    }
  };

  const onAddVisa = async () => {
    if (!selectedApp) return;
    if (!visaForm.visaNumber || !visaForm.visaIssuedDate || !visaForm.visaExpiryDate) {
      alert('Please fill in all visa details');
      return;
    }
    const success = await handleUpdateApplication(selectedApp.id, {
      visaNumber: visaForm.visaNumber,
      visaIssuedDate: visaForm.visaIssuedDate,
      visaExpiryDate: visaForm.visaExpiryDate,
      status: 'ACCEPTED' // Update status to ACCEPTED when visa is added
    });
    if (success) {
        setShowVisaModal(false);
        setVisaForm({ visaNumber: '', visaIssuedDate: '', visaExpiryDate: '' });
        setSelectedApp(null);
        await fetchCandidate(); // Refresh to show updated data
    }
  };

  const onAddMinistryApproval = async () => {
    if (!selectedApp) return;
    if (!ministryForm.chalaniNo || !ministryForm.approvalDate) {
      alert('Please fill in all ministry approval details');
      return;
    }
    const success = await handleUpdateApplication(selectedApp.id, { 
        ministryChalaniNo: ministryForm.chalaniNo,
        ministryApprovalDate: ministryForm.approvalDate
    });
    if (success) {
        setShowMinistryModal(false);
        setMinistryForm({ chalaniNo: '', approvalDate: '' });
        setSelectedApp(null);
        await fetchCandidate(); // Refresh to show updated data
    }
  };

  const onAddFlight = async () => {
    if (!selectedApp || !flightDate) {
      alert('Please select a flight date');
      return;
    }
    const success = await handleUpdateApplication(selectedApp.id, { flightDate });
    if (success) {
      setShowFlightModal(false);
      setFlightDate('');
      setSelectedApp(null);
      await fetchCandidate(); // Refresh to show updated data
    }
  };

  const onUpdateAppStatus = async (app, status) => {
    if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) {
      const success = await handleUpdateApplication(app.id, { status });
      if (success) {
        await fetchCandidate(); // Refresh to show updated data
      }
    }
  };

  const onWithdrawApplication = async (app) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      const success = await handleUpdateApplication(app.id, { status: 'WITHDRAWN' });
      if (success) {
        await fetchCandidate(); // Refresh to show updated data
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Candidate not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/admin/candidates')}
          className="text-gray-600 hover:text-gray-900 flex items-center transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Applicants List
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/admin/candidates/edit/${id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center shadow-sm"
          >
            <FaEdit className="mr-2" /> Edit Candidate
          </button>
          <button 
            onClick={handleCreateCV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center shadow-sm"
          >
            <FaFileAlt className="mr-2" /> Create CV
          </button>
          <button 
            onClick={handleDownloadAll}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center shadow-sm"
          >
            <FaDownload className="mr-2" /> Download All
          </button>
          <button 
            onClick={generatePDF}
            className="bg-brand-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center shadow-sm"
          >
            <FaDownload className="mr-2" /> Get PDF
          </button>
          {candidate && candidate.passportNumber && candidate.dateOfBirth && (
            <button 
              onClick={() => setShowQRCode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center shadow-sm"
            >
              <FaQrcode className="mr-2" /> QR Code
            </button>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                {candidate.profilePhotoPath ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/${candidate.profilePhotoPath}`}
                      alt={candidate.fullName}
                      className="w-full h-full object-cover"
                    />
                 ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaUser size={48} />
                </div>
                 )}
             </div>
          </div>

          {/* Passport and Personal Info */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Passport Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Passport Number:</span> {candidate.passportNumber || 'N/A'}</p>
                <p><span className="font-medium">Date of Expiry:</span> {candidate.passportExpiryDate || 'N/A'}</p>
                <p><span className="font-medium">Issued District:</span> {candidate.passportIssuedDistrict || 'N/A'}</p>
             </div>
          </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Gender:</span> {candidate.gender || 'N/A'}</p>
                <p><span className="font-medium">Date of Birth:</span> {candidate.dateOfBirth || 'N/A'}</p>
                <p><span className="font-medium">Nationality:</span> {candidate.nationality || 'N/A'}</p>
                <p><span className="font-medium">Religion:</span> {candidate.religion || 'N/A'}</p>
                <p><span className="font-medium">Height:</span> {candidate.height || '0'} cm</p>
                <p><span className="font-medium">Weight:</span> {candidate.weight || '0'} kg</p>
                <p><span className="font-medium">Agent:</span> {candidate.agentName || 'No Agent'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Update Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition" onClick={() => openStatusUpdate('visa', candidate.visaStatus)}>
            <div className="flex items-center gap-2 mb-2">
              <FaPlane className="text-blue-500" />
              <p className="text-xs text-gray-500 uppercase">Visa Status</p>
            </div>
            <p className={`font-semibold ${candidate.visaStatus === 'APPROVED' ? 'text-green-600' : candidate.visaStatus === 'REJECTED' ? 'text-red-600' : 'text-gray-800'}`}>
              {(!candidate.visaStatus || candidate.visaStatus === 'NOT_UPLOADED' || candidate.visaStatus === 'PENDING') ? 'NO VISA' : candidate.visaStatus}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition" onClick={() => openStatusUpdate('medical', candidate.medicalStatus)}>
            <div className="flex items-center gap-2 mb-2">
              <FaFileMedical className="text-red-500" />
              <p className="text-xs text-gray-500 uppercase">Medical Status</p>
            </div>
            <p className={`font-semibold ${candidate.medicalStatus === 'FIT' ? 'text-green-600' : 'text-gray-800'}`}>{candidate.medicalStatus || 'PENDING'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition" onClick={() => openStatusUpdate('police', candidate.policeReportStatus)}>
             <div className="flex items-center gap-2 mb-2">
              <FaFileAlt className="text-purple-500" />
              <p className="text-xs text-gray-500 uppercase">Police Report</p>
            </div>
            <p className={`font-semibold ${candidate.policeReportStatus === 'CLEARED' ? 'text-green-600' : 'text-gray-800'}`}>{candidate.policeReportStatus || 'PENDING'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition" onClick={() => openStatusUpdate('insurance', candidate.insuranceStatus)}>
            <div className="flex items-center gap-2 mb-2">
              <FaFileContract className="text-yellow-500" />
              <p className="text-xs text-gray-500 uppercase">Insurance</p>
            </div>
            <p className={`font-semibold ${candidate.insuranceStatus === 'DONE' ? 'text-green-600' : 'text-gray-800'}`}>{candidate.insuranceStatus || 'PENDING'}</p>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="mt-6 space-y-2">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-700">Basic Information</span>
            {expandedSections.basic ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections.basic && (
            <div className="p-4 bg-gray-50 rounded-lg mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Full Name:</span> {candidate.fullName}</div>
                <div><span className="font-medium">Date of Birth:</span> {candidate.dateOfBirth}</div>
                <div><span className="font-medium">Gender:</span> {candidate.gender}</div>
                <div><span className="font-medium">Nationality:</span> {candidate.nationality}</div>
                <div><span className="font-medium">Religion:</span> {candidate.religion}</div>
                <div><span className="font-medium">Height:</span> {candidate.height || '0'} cm</div>
                <div><span className="font-medium">Weight:</span> {candidate.weight || '0'} kg</div>
              </div>
            </div>
          )}

          <button
            onClick={() => toggleSection('contact')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-700">Contact Information</span>
            {expandedSections.contact ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections.contact && (
            <div className="p-4 bg-gray-50 rounded-lg mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Phone:</span> {candidate.phone || 'N/A'}</div>
                <div><span className="font-medium">Email:</span> {candidate.email || 'N/A'}</div>
                <div className="col-span-2"><span className="font-medium">Address:</span> {candidate.permanentCityStreet}, {candidate.permanentDistrict}, {candidate.permanentCountry}</div>
              </div>
            </div>
          )}

          <button
            onClick={() => toggleSection('jobSpec')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-700">Job Specification</span>
            {expandedSections.jobSpec ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections.jobSpec && (
            <div className="p-4 bg-gray-50 rounded-lg mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Job Applied For:</span> {candidate.jobAppliedFor || 'N/A'}</div>
                <div><span className="font-medium">Destination Country:</span> {candidate.destinationCountry || 'N/A'}</div>
                <div className="col-span-2"><span className="font-medium">Experience:</span> {candidate.experience || 'N/A'}</div>
              </div>
            </div>
          )}

          <button
            onClick={() => toggleSection('family')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-medium text-gray-700">Family Information</span>
            {expandedSections.family ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections.family && (
            <div className="p-4 bg-gray-50 rounded-lg mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Father's Name:</span> {candidate.fatherName || 'N/A'}</div>
                <div><span className="font-medium">Mother's Name:</span> {candidate.motherName || 'N/A'}</div>
                <div><span className="font-medium">Spouse Name:</span> {candidate.spouseName || 'N/A'}</div>
                <div><span className="font-medium">Children:</span> {candidate.noOfSons || 0} Sons, {candidate.noOfDaughters || 0} Daughters</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('medical')}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
              activeTab === 'medical' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaFileMedical /> Medical Records ({medicalRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
              activeTab === 'applications' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaFileContract /> Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
              activeTab === 'issues' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaExclamationCircle /> Issues ({issues.length})
          </button>
          <button
            onClick={() => setActiveTab('flight-history')}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
              activeTab === 'flight-history' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaPlane /> Flight History ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
              activeTab === 'logs' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaHistory /> Logs ({statusHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 ${
              activeTab === 'files' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaFileAlt /> Files ({getAllFiles().length})
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {/* Medical Records */}
          {activeTab === 'medical' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">Medical Records - Click to view details of each medical record.</p>
                <button
                  onClick={() => setShowAddMedicalRecord(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <FaPlus /> Add Medical Record
                </button>
              </div>
              {medicalRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No medical records found.</p>
              ) : (
                <div className="space-y-2">
                  {medicalRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{record.healthCenter}</p>
                          <p className="text-sm text-gray-500">
                            Sticker No: {record.stickerNo} | Date: {record.medicalDate} | Result: 
                            <span className={`ml-1 font-semibold ${record.result === 'Fit' ? 'text-green-600' : 'text-red-600'}`}>
                              {record.result}
             </span>
                          </p>
          </div>
                        <FaFileMedical className="text-gray-400" />
        </div>
      </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applications */}
          {activeTab === 'applications' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">Applications - Click to view details of each application.</p>
                <button
                  onClick={() => setShowApplyDemand(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <FaPlus /> Apply A Demand
                </button>
              </div>
              {applications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No applications found.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Header with Job Title and Status */}
                      <div className="bg-green-500 text-white px-6 py-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            {app.job?.title || app.job?.jobTitle || 'Electrician'}
                            {app.status === 'ACCEPTED' && app.visaNumber && (
                              <span className="text-sm bg-white text-green-600 px-2 py-1 rounded flex items-center gap-1">
                                <FaCheck /> Accepted VISA
                              </span>
                            )}
                            {app.status === 'ACCEPTED' && !app.visaNumber && (
                              <span className="text-sm bg-white text-green-600 px-2 py-1 rounded flex items-center gap-1">
                                <FaCheck /> Accepted
                              </span>
                            )}
                            {app.status === 'REJECTED' && (
                              <span className="text-sm bg-white text-red-600 px-2 py-1 rounded">
                                Rejected
                              </span>
                            )}
                            {app.status === 'WITHDRAWN' && (
                              <span className="text-sm bg-white text-yellow-600 px-2 py-1 rounded">
                                Withdrawn
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>
                      
                      {/* Application Details Table */}
                      <div className="p-6">
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr className="border-b border-gray-200">
                              <td className="py-3 px-4 font-medium text-gray-700 w-1/3">Company:</td>
                              <td className="py-3 px-4 text-gray-900">{app.job?.company || app.company || 'N/A'}</td>
                              <td className="py-3 px-4 font-medium text-gray-700 w-1/3"></td>
                              <td className="py-3 px-4 text-gray-900"></td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="py-3 px-4 font-medium text-gray-700">Country:</td>
                              <td className="py-3 px-4 text-gray-900">{app.country || 'N/A'}</td>
                              <td className="py-3 px-4 font-medium text-gray-700">Applied on:</td>
                              <td className="py-3 px-4 text-gray-900">
                                {app.createdAt ? (typeof app.createdAt === 'string' ? app.createdAt.replace('T', ' ').slice(0, 16) : new Date(app.createdAt).toLocaleString().slice(0, 16)) : 'N/A'}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="py-3 px-4 font-medium text-gray-700">Interview Result:</td>
                              <td className="py-3 px-4">
                                <span className={`font-bold ${app.interviewResult === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                                  {app.interviewResult || 'N/A'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-gray-700">Interviewed on:</td>
                              <td className="py-3 px-4 text-gray-900">
                                {app.interviewDate ? (typeof app.interviewDate === 'string' ? app.interviewDate : app.interviewDate.toString()) : 'N/A'}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                              <td className="py-3 px-4 font-medium text-gray-700">Remarks:</td>
                              <td className="py-3 px-4 text-gray-600 col-span-3" colSpan="3">
                                {app.remarks || 'N/A'}
                              </td>
                            </tr>
                            {app.applicationForwardedDate && (
                              <tr className="border-b border-gray-200 bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-700" colSpan="4">
                                  Application Forwarded Date: <span className="font-semibold text-gray-900">{app.applicationForwardedDate}</span>
                                </td>
                              </tr>
                            )}
                            {app.visaNumber && (
                              <>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                  <td className="py-3 px-4 font-medium text-gray-700">Visa Number:</td>
                                  <td className="py-3 px-4 text-gray-900 font-semibold">{app.visaNumber}</td>
                                  <td className="py-3 px-4 font-medium text-gray-700"></td>
                                  <td className="py-3 px-4 text-gray-900"></td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                  <td className="py-3 px-4 font-medium text-gray-700">Visa Issued Date:</td>
                                  <td className="py-3 px-4 text-gray-900">{app.visaIssuedDate || 'N/A'}</td>
                                  <td className="py-3 px-4 font-medium text-gray-700">Visa Expiry Date:</td>
                                  <td className="py-3 px-4 text-gray-900">{app.visaExpiryDate || 'N/A'}</td>
                                </tr>
                              </>
                            )}
                            {app.ministryChalaniNo && (
                              <tr className="border-b border-gray-200 bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-700">Ministry Chalani No:</td>
                                <td className="py-3 px-4 text-gray-900">{app.ministryChalaniNo}</td>
                                <td className="py-3 px-4 font-medium text-gray-700">Approval Date:</td>
                                <td className="py-3 px-4 text-gray-900">{app.ministryApprovalDate || 'N/A'}</td>
                              </tr>
                            )}
                            {app.flightDate && (
                              <tr className="border-b border-gray-200 bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-700" colSpan="4">
                                  Flight Date: <span className="font-semibold text-gray-900">{app.flightDate}</span>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="bg-green-50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-2">
                        <button 
                          onClick={() => onWithdrawApplication(app)} 
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors shadow-sm"
                        >
                          Withdraw
                        </button>
                        <button 
                          onClick={() => { setSelectedApp(app); setShowVisaModal(true); }} 
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors shadow-sm"
                          disabled={app.status === 'REJECTED' || app.status === 'WITHDRAWN'}
                        >
                          Add Visa
                        </button>
                        <button 
                          onClick={() => { setSelectedApp(app); setShowForwardModal(true); }} 
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                          disabled={app.status === 'REJECTED' || app.status === 'WITHDRAWN'}
                        >
                          Forward Application
                        </button>
                        <button 
                          onClick={() => { setSelectedApp(app); setShowMinistryModal(true); }} 
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors shadow-sm"
                          disabled={app.status === 'REJECTED' || app.status === 'WITHDRAWN' || !app.visaNumber}
                        >
                          Ministry Approval
                        </button>
                        <button 
                          onClick={() => { setSelectedApp(app); setShowFlightModal(true); }} 
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors shadow-sm"
                          disabled={app.status === 'REJECTED' || app.status === 'WITHDRAWN'}
                        >
                          Flight
                        </button>
                        <button 
                          onClick={() => onUpdateAppStatus(app, 'ACCEPTED')} 
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors shadow-sm"
                          disabled={app.status === 'ACCEPTED' || app.status === 'REJECTED' || app.status === 'WITHDRAWN'}
                        >
                          Accept Application
                        </button>
                        <button 
                          onClick={() => onUpdateAppStatus(app, 'REJECTED')} 
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors shadow-sm"
                          disabled={app.status === 'REJECTED' || app.status === 'WITHDRAWN'}
                        >
                          Reject Application
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Issues */}
          {activeTab === 'issues' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">Issues - Admin can comment on issues seen for the candidate.</p>
                <button
                  onClick={async () => {
                    const comment = prompt('Enter issue comment:');
                    if (comment) {
                      try {
                        const newIssue = {
                          comment,
                          date: new Date().toISOString(),
                          admin: 'Admin'
                        };
                        const res = await adminAPI.addIssue(id, newIssue);
                        setIssues([...issues, res.data]);
                        setMessage({ type: 'success', text: 'Issue added successfully' });
                      } catch (err) {
                        console.error('Error adding issue:', err);
                        setMessage({ type: 'error', text: 'Failed to add issue' });
                      }
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <FaPlus /> Add Issue
                </button>
              </div>
              {issues.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No issues recorded.</p>
              ) : (
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <div key={issue.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{issue.admin}</span>
                        <span className="text-sm text-gray-500">{new Date(issue.date).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700">{issue.comment}</p>
                    </div>
                  ))}
      </div>
              )}
            </div>
          )}

          {/* Flight History */}
          {activeTab === 'flight-history' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">Flight History - Track flight details and status.</p>
                <button
                  onClick={() => setShowAddTicket(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <FaPlus /> Add Flight Ticket
                </button>
                </div>
              {tickets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No flight tickets found.</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">{ticket.airline}</h4>
                          <p className="text-sm text-gray-500">
                            {ticket.departureFrom} <span className="mx-2">→</span> {ticket.destination}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'DEPARTED' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'ARRIVED' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                          <button 
                            onClick={() => onDeleteTicket(ticket.id)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="block text-gray-500 text-xs uppercase">Departure Date</span>
                          <span className="font-medium">{ticket.departureDate}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 text-xs uppercase">Departure Time</span>
                          <span className="font-medium">{ticket.departureTime}</span>
                        </div>
                      </div>

                      {ticket.remarks && (
                         <div className="mb-4 bg-gray-50 p-2 rounded text-sm">
                           <span className="font-medium text-gray-600">Remarks:</span> {ticket.remarks}
                         </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button 
                          onClick={() => onUpdateTicketStatus(ticket, 'SCHEDULED')}
                          disabled={ticket.status === 'SCHEDULED'}
                          className={`flex-1 py-1 text-xs rounded border transition-colors ${
                            ticket.status === 'SCHEDULED' 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Scheduled
                        </button>
                        <button 
                          onClick={() => onUpdateTicketStatus(ticket, 'DEPARTED')}
                          disabled={ticket.status === 'DEPARTED'}
                          className={`flex-1 py-1 text-xs rounded border transition-colors ${
                            ticket.status === 'DEPARTED' 
                              ? 'bg-yellow-500 text-white border-yellow-500' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Departed
                        </button>
                        <button 
                          onClick={() => onUpdateTicketStatus(ticket, 'ARRIVED')}
                          disabled={ticket.status === 'ARRIVED'}
                          className={`flex-1 py-1 text-xs rounded border transition-colors ${
                            ticket.status === 'ARRIVED' 
                              ? 'bg-green-600 text-white border-green-600' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Arrived
                        </button>
                        <button 
                          onClick={() => onUpdateTicketStatus(ticket, 'CANCELLED')}
                          disabled={ticket.status === 'CANCELLED'}
                          className={`flex-1 py-1 text-xs rounded border transition-colors ${
                            ticket.status === 'CANCELLED' 
                              ? 'bg-red-600 text-white border-red-600' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Cancelled
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Logs */}
          {activeTab === 'logs' && (
            <div>
              <p className="text-gray-600 mb-4">Logs - Status change history for this candidate.</p>
              {statusHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No logs available.</p>
              ) : (
                <div className="space-y-3">
                  {statusHistory.map((log) => (
                    <div key={log.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800">{log.documentType?.toUpperCase()}</span>
                        <span className="text-gray-500">
                          {log.changedAt ? log.changedAt.replace('T', ' ').slice(0, 16) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {log.oldStatus} → <span className="font-semibold">{log.newStatus}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {log.changedBy || 'Admin'}{log.remarks ? ` • ${log.remarks}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files */}
          {activeTab === 'files' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">Files - All files including visa, medical reports, passport photo, and tickets.</p>
                <button
                  onClick={() => setShowAddFile(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <FaPlus /> Add File
                </button>
                </div>
              {getAllFiles().length === 0 ? (
                <p className="text-red-500 text-center py-8">No files.</p>
              ) : (
                <div className="space-y-2">
                  {getAllFiles().map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setShowFileView(file)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{file.name}</p>
                          {file.description && <p className="text-sm text-gray-500">{file.description}</p>}
                </div>
                        <FaDownload className="text-gray-400" />
                </div>
                </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
            </div>

      {/* Add Ticket Modal */}
      {showAddTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">Add Ticket</h3>
              <button onClick={() => setShowAddTicket(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
             </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Airlines:</label>
                <input
                  type="text"
                  value={ticketForm.airline}
                  onChange={(e) => setTicketForm({ ...ticketForm, airline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Airlines Name"
                />
                      </div>
                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure From:</label>
                <input
                  type="text"
                  value={ticketForm.departureFrom}
                  onChange={(e) => setTicketForm({ ...ticketForm, departureFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Departure Location"
                />
                        </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination:</label>
                <input
                  type="text"
                  value={ticketForm.destination}
                  onChange={(e) => setTicketForm({ ...ticketForm, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Destination Location"
                />
                      </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date:</label>
                <input
                  type="date"
                  value={ticketForm.departureDate}
                  onChange={(e) => setTicketForm({ ...ticketForm, departureDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Date of Departure"
                />
                    </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time:</label>
                <input
                  type="time"
                  value={ticketForm.departureTime}
                  onChange={(e) => setTicketForm({ ...ticketForm, departureTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Time of Departure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks:</label>
                <textarea
                  value={ticketForm.remarks}
                  onChange={(e) => setTicketForm({ ...ticketForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ticket Remarks"
                  rows="4"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowAddTicket(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleAddTicket}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add File Modal */}
      {showAddFile && (
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
                  placeholder="File Name"
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
            <div className="mt-6 flex gap-2">
                        <button
                onClick={() => setShowAddFile(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleAddFile}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                Save changes
                        </button>
                      </div>
                    </div>
                  </div>
      )}

      {/* File View Modal */}
      {showFileView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{showFileView.name}</h3>
              <button onClick={() => setShowFileView(null)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
                </div>
            {showFileView.description && (
              <p className="text-gray-600 mb-4">{showFileView.description}</p>
            )}
            {showFileView.path && (
              <div className="mt-4">
                <a
                  href={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${showFileView.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-flex items-center gap-2"
                >
                  <FaDownload /> View/Download File
                </a>
              </div>
            )}
            {showFileView.file && showFileView.isAdditional && (
              <div className="mt-4">
                <a
                  href={URL.createObjectURL(showFileView.file)}
                  download={showFileView.name}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-flex items-center gap-2"
                >
                  <FaDownload /> Download File
                </a>
              </div>
            )}
            <button
              onClick={() => setShowFileView(null)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
          </div>
        )}

      {/* Add Medical Record Modal */}
      {showAddMedicalRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="bg-green-500 text-white px-6 py-3 -mx-6 -mt-6 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Medical Record</h3>
              <button onClick={() => setShowAddMedicalRecord(false)} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4 mt-6">
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Center:</label>
                <input
                  type="text"
                  value={medicalRecordForm.healthCenter}
                  onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, healthCenter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Health Center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sticker No.:</label>
                <input
                  type="text"
                  value={medicalRecordForm.stickerNo}
                  onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, stickerNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Sticker Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Date:</label>
                <input
                  type="date"
                  value={medicalRecordForm.medicalDate}
                  onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, medicalDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Medical Date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Expiry:</label>
                <input
                  type="date"
                  value={medicalRecordForm.medicalExpiry}
                  onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, medicalExpiry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Date of Expiry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Result:</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="result"
                      value="Fit"
                      checked={medicalRecordForm.result === 'Fit'}
                      onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, result: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Fit</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="result"
                      value="Unfit"
                      checked={medicalRecordForm.result === 'Unfit'}
                      onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, result: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Unfit</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks:</label>
                <textarea
                  value={medicalRecordForm.remarks}
                  onChange={(e) => setMedicalRecordForm({ ...medicalRecordForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Remarks"
                  rows="4"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowAddMedicalRecord(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleAddMedicalRecord}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* Apply A Demand Modal */}
      {showApplyDemand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl flex flex-col max-h-[90vh] shadow-xl">
            <div className="bg-green-500 text-white px-6 py-4 rounded-t-lg flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold">Apply A Demand</h3>
              <button onClick={() => setShowApplyDemand(false)} className="text-white hover:text-gray-200 focus:outline-none">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country:</label>
                    <select
                      value={applicationForm.country}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        country: e.target.value,
                        company: '',
                        demand: '',
                        jobId: ''
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Country</option>
                      {uniqueCountries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company:</label>
                    <select
                      value={applicationForm.company}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        company: e.target.value,
                        demand: '',
                        jobId: ''
                      })}
                      disabled={!applicationForm.country}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Company</option>
                      {uniqueCompanies.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Demand:</label>
                    <select
                      value={applicationForm.demand}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        demand: e.target.value,
                        jobId: ''
                      })}
                      disabled={!applicationForm.company}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Demand</option>
                      {uniqueDemands.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Demand Line:</label>
                    <select
                      value={applicationForm.jobId}
                      onChange={(e) => setApplicationForm({
                        ...applicationForm,
                        jobId: e.target.value
                      })}
                      disabled={!applicationForm.demand}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Demand Line</option>
                      {availableJobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title || job.jobTitle || 'Unnamed Job'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interviewed by:</label>
                    <input
                      type="text"
                      value={applicationForm.interviewed}
                      onChange={(e) => setApplicationForm({ ...applicationForm, interviewed: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Interviewer Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date:</label>
                    <input
                      type="date"
                      value={applicationForm.interviewDate}
                      onChange={(e) => setApplicationForm({ ...applicationForm, interviewDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Result:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="interviewResult"
                        value="Pass"
                        checked={applicationForm.interviewResult === 'Pass'}
                        onChange={(e) => setApplicationForm({ ...applicationForm, interviewResult: e.target.value })}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700">Pass</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="interviewResult"
                        value="Fail"
                        checked={applicationForm.interviewResult === 'Fail'}
                        onChange={(e) => setApplicationForm({ ...applicationForm, interviewResult: e.target.value })}
                        className="mr-2 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-gray-700">Fail</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks:</label>
                  <textarea
                    value={applicationForm.remarks}
                    onChange={(e) => setApplicationForm({ ...applicationForm, remarks: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Additional remarks..."
                    rows="3"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex gap-2 justify-end shrink-0 border-t border-gray-200">
              <button
                onClick={() => setShowApplyDemand(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Close
              </button>
              <button
                onClick={handleApplyDemand}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
        )}

      {/* Add Flight Ticket Modal */}
      {showAddTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-green-500 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Flight Ticket</h3>
              <button onClick={() => setShowAddTicket(false)} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
                <input
                  type="text"
                  value={ticketForm.airline}
                  onChange={(e) => setTicketForm({ ...ticketForm, airline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g. Qatar Airways"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="text"
                    value={ticketForm.departureFrom}
                    onChange={(e) => setTicketForm({ ...ticketForm, departureFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="City/Airport"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="text"
                    value={ticketForm.destination}
                    onChange={(e) => setTicketForm({ ...ticketForm, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="City/Airport"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={ticketForm.departureDate}
                    onChange={(e) => setTicketForm({ ...ticketForm, departureDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={ticketForm.departureTime}
                    onChange={(e) => setTicketForm({ ...ticketForm, departureTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={ticketForm.status}
                  onChange={(e) => setTicketForm({ ...ticketForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="DEPARTED">Departed</option>
                  <option value="ARRIVED">Arrived</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="DELAYED">Delayed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={ticketForm.remarks}
                  onChange={(e) => setTicketForm({ ...ticketForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  rows="2"
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowAddTicket(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTicket}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showUpdateStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="bg-green-500 text-white px-6 py-3 -mx-6 -mt-6 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Update {statusUpdateForm.type?.replace('_', ' ')}</h3>
              <button onClick={() => setShowUpdateStatus(false)} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Type:</label>
                <input
                  type="text"
                  value={statusUpdateForm.type}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status:</label>
                <select
                  value={statusUpdateForm.value}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Status</option>
                  {statusUpdateForm.type === 'visa' && (
                    <>
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="ISSUED">ISSUED</option>
                    </>
                  )}
                  {statusUpdateForm.type === 'medical' && (
                    <>
                      <option value="PENDING">PENDING</option>
                      <option value="FIT">FIT</option>
                      <option value="UNFIT">UNFIT</option>
                    </>
                  )}
                  {statusUpdateForm.type === 'police' && (
                    <>
                      <option value="PENDING">PENDING</option>
                      <option value="CLEARED">CLEARED</option>
                      <option value="NOT_CLEARED">NOT_CLEARED</option>
                    </>
                  )}
                  {statusUpdateForm.type === 'insurance' && (
                    <>
                      <option value="PENDING">PENDING</option>
                      <option value="DONE">DONE</option>
                    </>
                  )}
                  {statusUpdateForm.type === 'health' && (
                    <>
                      <option value="PENDING">PENDING</option>
                      <option value="FIT">FIT</option>
                      <option value="UNFIT">UNFIT</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks:</label>
                <textarea
                  value={statusUpdateForm.remarks}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Remarks"
                  rows="3"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowUpdateStatus(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Application Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-green-500 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Forward Application</h3>
              <button onClick={() => setShowForwardModal(false)} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forward Date:</label>
                <input 
                  type="date" 
                  value={forwardDate} 
                  onChange={(e) => setForwardDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowForwardModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={onForwardApplication}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Forward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Visa Modal */}
      {showVisaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-green-500 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Visa</h3>
              <button onClick={() => setShowVisaModal(false)} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visa No.:</label>
                <input 
                  type="text" 
                  value={visaForm.visaNumber} 
                  onChange={(e) => setVisaForm({...visaForm, visaNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Visa No."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issued Date:</label>
                <input 
                  type="date" 
                  value={visaForm.visaIssuedDate} 
                  onChange={(e) => setVisaForm({...visaForm, visaIssuedDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Date of Issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date:</label>
                <input 
                  type="date" 
                  value={visaForm.visaExpiryDate} 
                  onChange={(e) => setVisaForm({...visaForm, visaExpiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Date of Expiry"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowVisaModal(false)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Close
                </button>
                <button 
                  onClick={onAddVisa}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ministry Approval Modal */}
      {showMinistryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-green-500 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ministry Approval</h3>
              <button onClick={() => setShowMinistryModal(false)} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chalani No.:</label>
                <input 
                  type="text" 
                  value={ministryForm.chalaniNo} 
                  onChange={(e) => setMinistryForm({...ministryForm, chalaniNo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Chalani No."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Date:</label>
                <input 
                  type="date" 
                  value={ministryForm.approvalDate} 
                  onChange={(e) => setMinistryForm({...ministryForm, approvalDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Approval Date"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowMinistryModal(false)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Close
                </button>
                <button 
                  onClick={onAddMinistryApproval}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight Modal */}
      {showFlightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-green-500 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Flight</h3>
              <button onClick={() => setShowFlightModal(false)} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flight Date:</label>
                <input 
                  type="date" 
                  value={flightDate} 
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowFlightModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={onAddFlight}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && candidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">Candidate QR Code</h3>
              <button onClick={() => setShowQRCode(false)} className="text-white hover:text-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Scan this QR code to check candidate status</p>
                <p className="text-xs text-gray-500">Name: {candidate.fullName}</p>
                <p className="text-xs text-gray-500">Passport: {candidate.passportNumber}</p>
              </div>
              <div className="flex justify-center mb-4 bg-white p-4 rounded-lg border-2 border-gray-200">
                {getQRCodeData() ? (
                  <div id="candidate-qr-code">
                    <QRCodeSVG
                      value={getQRCodeData()}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>QR code cannot be generated.</p>
                    <p className="text-sm mt-2">Passport number and date of birth are required.</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowQRCode(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Close
                </button>
                {getQRCodeData() && (
                  <button 
                    onClick={downloadQRCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaDownload /> Download QR Code
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminCandidateDetails;
