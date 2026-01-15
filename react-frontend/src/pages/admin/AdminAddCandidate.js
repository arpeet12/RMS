import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import { FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa';

const AdminAddCandidate = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const districts = [
    "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara", "Bardiya", "Bhaktapur", 
    "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh", "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusa", "Dolakha", 
    "Dolpa", "Doti", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla", "Kailali", "Kalikot", 
    "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu", "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung", "Mahottari", 
    "Makwanpur", "Manang", "Morang", "Mugu", "Mustang", "Myagdi", "Nawalparasi", "Nuwakot", "Okhaldhunga", "Palpa", 
    "Panchthar", "Parbat", "Parsa", "Pyuthan", "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rukum", "Rupandehi", 
    "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli", "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari", 
    "Surkhet", "Syangja", "Tanahu", "Taplejung", "Terhathum", "Udayapur"
  ];

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await adminAPI.getAgents();
        if (response.data && Array.isArray(response.data)) {
          setAgents(response.data);
        } else if (response.data && response.data.agents) {
          setAgents(response.data.agents);
        }
      } catch (err) {
        console.error('Failed to load agents', err);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchCandidate = async () => {
        try {
          setLoading(true);
          const response = await adminAPI.getCandidate(id);
          const candidate = response.data.candidate || response.data;
          
          setFormData({
            fullName: candidate.fullName || '',
            photo: null, // File input cannot be pre-filled securely
            gender: candidate.gender || 'Male',
            passportNumber: candidate.passportNumber || '',
            passportExpiryDate: candidate.passportExpiryDate || '',
            passportIssuedDistrict: candidate.passportIssuedDistrict || '',
            dateOfBirth: candidate.dateOfBirth || '',
            nationality: candidate.nationality || 'Nepali',
            religion: candidate.religion || 'Hindu',
            fatherName: candidate.fatherName || '',
            motherName: candidate.motherName || '',
            spouseName: candidate.spouseName || '',
            noOfSons: candidate.noOfSons || '',
            noOfDaughters: candidate.noOfDaughters || '',
            permanentCountry: candidate.permanentCountry || 'Nepal',
            permanentDistrict: candidate.permanentDistrict || '',
            permanentCityStreet: candidate.permanentCityStreet || '',
            phone: candidate.phone || '',
            email: candidate.email || '',
            agentName: candidate.agentName || '',
            height: candidate.height || '',
            weight: candidate.weight || '',
            experience: candidate.experience || '',
            qualification: candidate.qualification || '',
            technicalCourse: candidate.technicalCourse || '',
            jobInterest: candidate.jobInterest || '',
            countryOfInterest: candidate.countryOfInterest 
              ? candidate.countryOfInterest.split(',').map(s => s.trim()) 
              : []
          });
        } catch (err) {
          console.error('Failed to load candidate details', err);
          setError('Failed to load candidate details');
        } finally {
          setLoading(false);
        }
      };
      fetchCandidate();
    }
  }, [id, isEditMode]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    photo: null,
    gender: 'Male',
    passportNumber: '',
    passportExpiryDate: '',
    passportIssuedDistrict: '',
    dateOfBirth: '',
    nationality: 'Nepali',
    religion: 'Hindu',
    fatherName: '',
    motherName: '',
    spouseName: '',
    noOfSons: '',
    noOfDaughters: '',
    permanentCountry: 'Nepal',
    permanentDistrict: '',
    permanentCityStreet: '',
    phone: '',
    email: '',
    agentName: '',
    height: '',
    weight: '',
    experience: '',
    qualification: '',
    technicalCourse: '',
    jobInterest: '',
    countryOfInterest: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      photo: e.target.files[0]
    }));
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this applicant? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.deleteCandidate(id);
      navigate('/admin/candidates');
    } catch (err) {
      console.error('Error deleting candidate:', err);
      setError(err.response?.data?.error || 'Failed to delete applicant');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'countryOfInterest' && Array.isArray(formData[key])) {
            // Convert array to comma-separated string
            if (formData[key].length > 0) {
              data.append('countryOfInterest', formData[key].join(', '));
            }
          } else {
            data.append(key, formData[key]);
          }
        }
      });

      if (isEditMode) {
        await adminAPI.updateCandidate(id, data);
      } else {
        await adminAPI.createCandidate(data);
      }
      navigate('/admin/candidates');
    } catch (err) {
      console.error('Error saving candidate:', err);
      setError(err.response?.data?.error || 'Failed to save candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header matching the screenshot */}
        <div className="bg-brand-blue px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">{isEditMode ? 'Edit Applicant' : 'Add Applicant'}</h1>
          <button
            onClick={() => navigate('/admin/candidates')}
            className="text-white hover:text-gray-100 flex items-center text-sm"
          >
            <FaArrowLeft className="mr-1" /> Back
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            {error}
          </div>
        )}

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Name:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue focus:outline-none bg-gray-50"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Picture:</label>
                  <div className="col-span-2">
                    <label className="inline-block px-4 py-2 bg-brand-blue text-white rounded cursor-pointer hover:bg-blue-600 transition-colors text-sm font-medium">
                      Add a picture
                      <input
                        type="file"
                        name="photo"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    {formData.photo && <span className="ml-2 text-sm text-gray-600">{formData.photo.name}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Gender:</label>
                  <div className="col-span-2 flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === 'Male'}
                        onChange={handleChange}
                        className="mr-2 text-blue-500 focus:ring-blue-500"
                      /> <span className="text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === 'Female'}
                        onChange={handleChange}
                        className="mr-2 text-blue-500 focus:ring-blue-500"
                      /> <span className="text-gray-700">Female</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Passport Number:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue focus:outline-none bg-gray-50"
                      placeholder="Passport Number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Date Of Expiry:</label>
                  <div className="col-span-2">
                    <input
                      type="date" // keeping date type for functionality, though screenshot looks like text input placeholder
                      name="passportExpiryDate"
                      value={formData.passportExpiryDate}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Issued District:</label>
                  <div className="col-span-2">
                    <select
                      name="passportIssuedDistrict"
                      value={formData.passportIssuedDistrict}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50 text-gray-700"
                    >
                      <option value="">Choose a district..</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Date Of Birth:</label>
                  <div className="col-span-2">
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Nationality:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue focus:outline-none bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-start">
                  <label className="text-gray-600 font-semibold pt-1">Religion:</label>
                  <div className="col-span-2 grid grid-cols-2 gap-y-2">
                    {['Hindu', 'Buddhist', 'Christian', 'Muslim', 'Other'].map(r => (
                      <label key={r} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="religion"
                          value={r}
                          checked={formData.religion === r}
                          onChange={handleChange}
                          className="mr-2 text-blue-500 focus:ring-blue-500"
                        /> <span className="text-gray-700">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Father:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue focus:outline-none bg-gray-50"
                      placeholder="Name of Father"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Mother:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue focus:outline-none bg-gray-50"
                      placeholder="Name of Mother"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Spouse:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="spouseName"
                      value={formData.spouseName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue focus:outline-none bg-gray-50"
                      placeholder="Name of Husband/Wife"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">No Of Sons:</label>
                  <div className="col-span-2">
                    <input
                      type="number"
                      name="noOfSons"
                      value={formData.noOfSons}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue focus:outline-none bg-gray-50"
                      placeholder="Number of Sons"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">No Of Daughters:</label>
                  <div className="col-span-2">
                    <input
                      type="number"
                      name="noOfDaughters"
                      value={formData.noOfDaughters}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue focus:outline-none bg-gray-50"
                      placeholder="Number of Daughters"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h3 className="text-brand-blue font-bold uppercase text-sm mb-4">PERMANENT ADDRESS:</h3>
                
                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Country:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="permanentCountry"
                      value={formData.permanentCountry}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue focus:outline-none bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">District:</label>
                  <div className="col-span-2">
                     <select
                      name="permanentDistrict"
                      value={formData.permanentDistrict}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50 text-gray-700"
                    >
                      <option value="">Choose a district..</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">City/Street:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="permanentCityStreet"
                      value={formData.permanentCityStreet}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50"
                      placeholder="City or Street"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center mt-8">
                  <label className="text-gray-600 font-semibold">Phone:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">EMail:</label>
                  <div className="col-span-2">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50"
                      placeholder="E-mail Address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Agent:</label>
                  <div className="col-span-2">
                    <select
                      name="agentName"
                      value={formData.agentName}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50 text-gray-700"
                    >
                      <option value="">No Agent</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.fullName || agent.user?.username}>
                          {agent.fullName || agent.user?.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Height:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50"
                      placeholder="Height in CM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Weight:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50"
                      placeholder="Weight in KG"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-start">
                  <label className="text-gray-600 font-semibold pt-2">Experience:</label>
                  <div className="col-span-2">
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      rows="4"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50"
                      placeholder="past Experience"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Qualification:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50"
                      placeholder="Qualifications"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Technical Course:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="technicalCourse"
                      value={formData.technicalCourse}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50"
                      placeholder="Tehnical Courses done"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-gray-600 font-semibold">Job Interest:</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="jobInterest"
                      value={formData.jobInterest}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-gray-50"
                      placeholder="Interested Job Post"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-start">
                  <label className="text-gray-600 font-semibold pt-2">Country Of Interest:</label>
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-300 rounded bg-gray-50 min-h-[42px]">
                      {formData.countryOfInterest.map((country, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
                          {country}
                          <button
                            type="button"
                            onClick={() => {
                              const newCountries = formData.countryOfInterest.filter((_, i) => i !== index);
                              setFormData({ ...formData, countryOfInterest: newCountries });
                            }}
                            className="ml-2 text-green-600 hover:text-green-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {formData.countryOfInterest.length === 0 && (
                        <span className="text-gray-400 text-sm">No countries selected</span>
                      )}
                    </div>
                    <input
                      type="text"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          e.preventDefault();
                          const newCountry = e.target.value.trim();
                          if (!formData.countryOfInterest.includes(newCountry)) {
                            setFormData({
                              ...formData,
                              countryOfInterest: [...formData.countryOfInterest, newCountry]
                            });
                            e.target.value = '';
                          }
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:outline-none bg-white"
                      placeholder="Type country and press Enter"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              {isEditMode ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center shadow-md"
                >
                  <FaTrash className="mr-2" />
                  Delete Applicant
                </button>
              ) : <div></div>}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#8cc63f] text-white font-semibold rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center shadow-md"
              >
                <FaSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Applicant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAddCandidate;
