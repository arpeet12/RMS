import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Navbar from '../components/Navbar';
import { 
  FaUser, FaBriefcase, FaGraduationCap, FaLanguage, 
  FaCar, FaAddressBook, FaCertificate, FaDownload, FaPlus, FaTrash 
} from 'react-icons/fa';

const CreateCVPage = () => {
  const [activeSection, setActiveSection] = useState('basic');
  
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    nationality: 'Nepali',
    passportNumber: '',
    passportExpiryDate: '',
    gender: 'Male',
    maritalStatus: 'Single',
    height: '',
    weight: '',
    religion: 'Hindu',

    // Arrays for multi-entry sections
    workExperience: [],
    education: [],
    trainings: [],
    languages: [],
    references: [],
    
    // Others
    drivingLicense: {
      hasLicense: false,
      type: ''
    },
    profileSummary: ''
  });

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generic handler for array fields (Education, Work, etc.)
  const handleArrayChange = (index, field, value, arrayName) => {
    const newArray = [...formData[arrayName]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const addItem = (arrayName, initialItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], initialItem]
    }));
  };

  const removeItem = (index, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Helper to check space and add page if needed
    const checkPageBreak = (height) => {
      if (yPos + height > 280) {
        doc.addPage();
        yPos = 20;
      }
    };

    // --- Header ---
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80); // Dark blue
    doc.text(formData.fullName || 'Your Name', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    const contactInfo = [
      formData.email,
      formData.phone,
      formData.address
    ].filter(Boolean).join(' | ');
    doc.text(contactInfo, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setDrawColor(200);
    doc.line(10, yPos, pageWidth - 10, yPos);
    yPos += 10;

    // --- Profile Summary ---
    if (formData.profileSummary) {
      checkPageBreak(30);
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Profile Summary', 14, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setTextColor(0);
      const splitText = doc.splitTextToSize(formData.profileSummary, pageWidth - 28);
      doc.text(splitText, 14, yPos);
      yPos += splitText.length * 5 + 5;
    }

    // --- Personal Details ---
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Personal Details', 14, yPos);
    yPos += 7;
    
    const personalData = [
      ['Date of Birth', formData.dateOfBirth],
      ['Nationality', formData.nationality],
      ['Gender', formData.gender],
      ['Marital Status', formData.maritalStatus],
      ['Passport No.', formData.passportNumber],
      ['Passport Expiry', formData.passportExpiryDate],
      ['Religion', formData.religion],
      ['Height/Weight', `${formData.height} / ${formData.weight}`],
    ].filter(row => row[1]);

    doc.autoTable({
      startY: yPos,
      head: [],
      body: personalData,
      theme: 'plain',
      styles: { cellPadding: 1, fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', width: 40 } },
      margin: { left: 14 }
    });
    yPos = doc.lastAutoTable.finalY + 10;

    // --- Work Experience ---
    if (formData.workExperience.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Work Experience', 14, yPos);
      yPos += 5;

      formData.workExperience.forEach(work => {
        checkPageBreak(25);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(work.position || 'Position', 14, yPos);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`${work.company || 'Company'} | ${work.duration || 'Duration'}`, 14, yPos + 5);
        
        if (work.description) {
            const descLines = doc.splitTextToSize(work.description, pageWidth - 30);
            doc.text(descLines, 14, yPos + 10);
            yPos += 10 + (descLines.length * 4);
        } else {
            yPos += 12;
        }
        yPos += 5;
      });
      yPos += 5;
    }

    // --- Education ---
    if (formData.education.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Education', 14, yPos);
      yPos += 5;

      formData.education.forEach(edu => {
        checkPageBreak(20);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(edu.degree || 'Degree', 14, yPos);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`${edu.institute || 'Institute'} | ${edu.year || 'Year'}`, 14, yPos + 5);
        yPos += 12;
      });
      yPos += 5;
    }

    // --- Trainings ---
    if (formData.trainings.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Trainings & Certifications', 14, yPos);
      yPos += 5;

      formData.trainings.forEach(train => {
        checkPageBreak(20);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(train.title || 'Course Title', 14, yPos);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`${train.institute || 'Institute'} | ${train.duration || 'Duration'}`, 14, yPos + 5);
        yPos += 12;
      });
      yPos += 5;
    }

    // --- Languages ---
    if (formData.languages.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Languages', 14, yPos);
        yPos += 7;
        
        const langData = formData.languages.map(l => [l.language, l.proficiency]);
        doc.autoTable({
            startY: yPos,
            head: [['Language', 'Proficiency']],
            body: langData,
            theme: 'striped',
            headStyles: { fillColor: [44, 62, 80] },
            margin: { left: 14, right: 100 }
        });
        yPos = doc.lastAutoTable.finalY + 10;
    }

    // --- References ---
    if (formData.references.length > 0) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('References', 14, yPos);
        yPos += 7;

        formData.references.forEach(ref => {
            checkPageBreak(20);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(ref.name || 'Reference Name', 14, yPos);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`${ref.company || ''} ${ref.company ? '|' : ''} ${ref.phone || ''}`, 14, yPos + 5);
            yPos += 12;
        });
    }

    doc.save('My_CV.pdf');
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: <FaUser /> },
    { id: 'experience', label: 'Work Experience', icon: <FaBriefcase /> },
    { id: 'education', label: 'Education', icon: <FaGraduationCap /> },
    { id: 'training', label: 'Training', icon: <FaCertificate /> },
    { id: 'language', label: 'Language', icon: <FaLanguage /> },
    { id: 'license', label: 'Driving License', icon: <FaCar /> },
    { id: 'reference', label: 'Reference', icon: <FaAddressBook /> },
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'basic':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nationality</label>
                <input type="text" name="nationality" value={formData.nationality} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Passport Expiry</label>
                <input type="date" name="passportExpiryDate" value={formData.passportExpiryDate} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Religion</label>
                <input type="text" name="religion" value={formData.religion} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
              </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Height (ft)</label>
                    <input type="text" name="height" value={formData.height} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input type="text" name="weight" value={formData.weight} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                 </div>
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700">Profile Summary</label>
                <textarea name="profileSummary" rows="4" value={formData.profileSummary} onChange={handleBasicChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" placeholder="Brief summary about yourself..."></textarea>
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-2xl font-bold text-gray-800">Work Experience</h2>
              <button onClick={() => addItem('workExperience', { company: '', position: '', duration: '', description: '' })} className="flex items-center text-blue-600 hover:text-blue-800">
                <FaPlus className="mr-1" /> Add Experience
              </button>
            </div>
            {formData.workExperience.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg relative border">
                <button onClick={() => removeItem(index, 'workExperience')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><FaTrash /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" value={item.company} onChange={(e) => handleArrayChange(index, 'company', e.target.value, 'workExperience')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input type="text" value={item.position} onChange={(e) => handleArrayChange(index, 'position', e.target.value, 'workExperience')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <input type="text" value={item.duration} onChange={(e) => handleArrayChange(index, 'duration', e.target.value, 'workExperience')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. 2020 - 2022" />
                  </div>
                   <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={item.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'workExperience')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" rows="3"></textarea>
                  </div>
                </div>
              </div>
            ))}
            {formData.workExperience.length === 0 && <p className="text-gray-500 italic">No work experience added yet.</p>}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-2xl font-bold text-gray-800">Education</h2>
              <button onClick={() => addItem('education', { degree: '', institute: '', year: '' })} className="flex items-center text-blue-600 hover:text-blue-800">
                <FaPlus className="mr-1" /> Add Education
              </button>
            </div>
            {formData.education.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg relative border">
                <button onClick={() => removeItem(index, 'education')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><FaTrash /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Degree/Level</label>
                    <input type="text" value={item.degree} onChange={(e) => handleArrayChange(index, 'degree', e.target.value, 'education')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institute/School</label>
                    <input type="text" value={item.institute} onChange={(e) => handleArrayChange(index, 'institute', e.target.value, 'education')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Completion Year</label>
                    <input type="text" value={item.year} onChange={(e) => handleArrayChange(index, 'year', e.target.value, 'education')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                </div>
              </div>
            ))}
            {formData.education.length === 0 && <p className="text-gray-500 italic">No education details added yet.</p>}
          </div>
        );

      case 'training':
         return (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-2xl font-bold text-gray-800">Training & Certifications</h2>
              <button onClick={() => addItem('trainings', { title: '', institute: '', duration: '' })} className="flex items-center text-blue-600 hover:text-blue-800">
                <FaPlus className="mr-1" /> Add Training
              </button>
            </div>
            {formData.trainings.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg relative border">
                <button onClick={() => removeItem(index, 'trainings')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><FaTrash /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course/Title</label>
                    <input type="text" value={item.title} onChange={(e) => handleArrayChange(index, 'title', e.target.value, 'trainings')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institute</label>
                    <input type="text" value={item.institute} onChange={(e) => handleArrayChange(index, 'institute', e.target.value, 'trainings')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <input type="text" value={item.duration} onChange={(e) => handleArrayChange(index, 'duration', e.target.value, 'trainings')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                </div>
              </div>
            ))}
             {formData.trainings.length === 0 && <p className="text-gray-500 italic">No training added yet.</p>}
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-2xl font-bold text-gray-800">Languages</h2>
              <button onClick={() => addItem('languages', { language: '', proficiency: 'Good' })} className="flex items-center text-blue-600 hover:text-blue-800">
                <FaPlus className="mr-1" /> Add Language
              </button>
            </div>
             {formData.languages.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg relative border">
                <button onClick={() => removeItem(index, 'languages')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><FaTrash /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <input type="text" value={item.language} onChange={(e) => handleArrayChange(index, 'language', e.target.value, 'languages')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="e.g. English" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Proficiency</label>
                    <select value={item.proficiency} onChange={(e) => handleArrayChange(index, 'proficiency', e.target.value, 'languages')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Good">Good</option>
                        <option value="Basic">Basic</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {formData.languages.length === 0 && <p className="text-gray-500 italic">No languages added yet.</p>}
          </div>
        );

      case 'license':
          return (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Driving License</h2>
                <div className="flex items-center space-x-4">
                    <input 
                        type="checkbox" 
                        id="hasLicense"
                        checked={formData.drivingLicense.hasLicense} 
                        onChange={(e) => setFormData(prev => ({...prev, drivingLicense: {...prev.drivingLicense, hasLicense: e.target.checked}}))}
                        className="h-5 w-5 text-blue-600"
                    />
                    <label htmlFor="hasLicense" className="text-gray-700 font-medium">I have a driving license</label>
                </div>
                
                {formData.drivingLicense.hasLicense && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">License Type / Category</label>
                        <input 
                            type="text" 
                            value={formData.drivingLicense.type} 
                            onChange={(e) => setFormData(prev => ({...prev, drivingLicense: {...prev.drivingLicense, type: e.target.value}}))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
                            placeholder="e.g. Two Wheeler, Four Wheeler, Heavy..."
                        />
                    </div>
                )}
             </div>
          );

      case 'reference':
          return (
            <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-2xl font-bold text-gray-800">References</h2>
              <button onClick={() => addItem('references', { name: '', company: '', phone: '' })} className="flex items-center text-blue-600 hover:text-blue-800">
                <FaPlus className="mr-1" /> Add Reference
              </button>
            </div>
            {formData.references.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg relative border">
                <button onClick={() => removeItem(index, 'references')} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><FaTrash /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" value={item.name} onChange={(e) => handleArrayChange(index, 'name', e.target.value, 'references')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company/Relation</label>
                    <input type="text" value={item.company} onChange={(e) => handleArrayChange(index, 'company', e.target.value, 'references')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="text" value={item.phone} onChange={(e) => handleArrayChange(index, 'phone', e.target.value, 'references')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                </div>
              </div>
            ))}
             {formData.references.length === 0 && <p className="text-gray-500 italic">No references added yet.</p>}
          </div>
          );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 px-2">CV Sections</h3>
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t px-2">
                <button
                  onClick={generatePDF}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaDownload className="mr-2" />
                  Download CV PDF
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 min-h-[600px]">
              {renderContent()}
              
              <div className="mt-8 flex justify-between pt-6 border-t">
                 {/* Navigation Buttons for convenience */}
                 <button 
                    onClick={() => {
                        const idx = sections.findIndex(s => s.id === activeSection);
                        if (idx > 0) setActiveSection(sections[idx - 1].id);
                    }}
                    disabled={activeSection === sections[0].id}
                    className={`px-4 py-2 border rounded-md ${activeSection === sections[0].id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                 >
                    Previous
                 </button>
                 
                 <button 
                    onClick={() => {
                        const idx = sections.findIndex(s => s.id === activeSection);
                        if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
                    }}
                    disabled={activeSection === sections[sections.length - 1].id}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${activeSection === sections[sections.length - 1].id ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                    Next Section
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCVPage;
