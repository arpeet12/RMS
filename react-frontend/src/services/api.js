import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDev ? '' : (process.env.REACT_APP_API_URL || 'http://localhost:8080');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  getCurrentUser: () => api.get('/api/auth/current-user'),
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (data) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout'),
  updateProfile: (formData) => api.put('/api/auth/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Candidate API
export const candidateAPI = {
  getProfile: () => api.get('/api/candidate/profile'),
  updateProfile: (data) => api.put('/api/candidate/profile', data),
  getDashboard: () => api.get('/api/candidate/dashboard'),
  getDocuments: () => api.get('/api/candidate/documents'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getCandidates: (params = {}) => api.get('/api/admin/candidates', { params }),
  createCandidate: (formData) => api.post('/api/admin/candidates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCandidate: (id, formData) => api.put(`/api/admin/candidates/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCandidate: (id) => api.get(`/api/admin/candidates/${id}`),
  deleteCandidate: (id) => api.delete(`/api/admin/candidates/${id}`),
  updateStatus: (id, statusType, statusValue, remarks = '') =>  
    api.post(`/api/admin/candidates/${id}/status`, {
      statusType,
      statusValue,
      remarks
    }),
  uploadDocument: (id, documentType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/admin/candidates/${id}/documents/${documentType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadAllDocuments: (id) => api.get(`/api/admin/candidates/${id}/download-all-documents`, {
    responseType: 'blob'
  }),
  addMedicalRecord: (candidateId, data) =>
    api.post(`/api/admin/candidates/${candidateId}/medical-records`, data),
  deleteMedicalRecord: (recordId) =>
    api.delete(`/api/admin/medical-records/${recordId}`),
  addApplication: (candidateId, formData) => api.post(`/api/admin/candidates/${candidateId}/applications`, formData),
  updateApplication: (appId, formData) => api.put(`/api/admin/applications/${appId}`, formData),
  deleteApplication: (appId) => api.delete(`/api/admin/applications/${appId}`),
  addIssue: (candidateId, data) =>
    api.post(`/api/admin/candidates/${candidateId}/issues`, data),
  getIssues: (candidateId) =>
    api.get(`/api/admin/candidates/${candidateId}/issues`),
  
  // Flight Tickets
  getFlightTickets: (candidateId) => api.get(`/api/admin/candidates/${candidateId}/flight-tickets`),
  addFlightTicket: (candidateId, data) => api.post(`/api/admin/candidates/${candidateId}/flight-tickets`, data),
  updateFlightTicket: (ticketId, data) => api.put(`/api/admin/flight-tickets/${ticketId}`, data),
  deleteFlightTicket: (ticketId) => api.delete(`/api/admin/flight-tickets/${ticketId}`),
  getAllFlightTickets: (params = {}) => api.get('/api/admin/flight-tickets', { params }),

  // Users
  getUsers: () => api.get('/api/admin/users'),
  getOfficerApprovalRequests: () => api.get('/api/admin/officer-approval-codes'),
  approveUser: (id) => api.put(`/api/admin/users/${id}/approve`),
  createUser: (data) => api.post('/api/admin/users', data),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  // Agents
  getAgents: () => api.get('/api/admin/agents'),
  getAgent: (id) => api.get(`/api/admin/agents/${id}`),
  updateAgentPermissions: async (id, permissions) => {
    try {
      return await api.put(`/api/admin/agents/${id}/permissions`, { permissions });
    } catch (err) {
      console.error('Error updating agent permissions:', err);
      throw err;
    }
  },
};

// Jobs API
export const jobsAPI = {
  getAll: () => api.get('/api/jobs'),
  getById: (id) => api.get(`/api/jobs/${id}`),
  getGrouped: (filters = {}) => api.get('/api/jobs/grouped', { params: filters }),
  create: (formData) => api.post('/api/jobs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/jobs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateFlags: (id, flags) => api.patch(`/api/jobs/${id}/flags`, flags),
  updatePreApproval: (id, data) => api.put(`/api/jobs/${id}/pre-approval`, data),
  delete: (id) => api.delete(`/api/jobs/${id}`),
};

// News API
export const newsAPI = {
  getAll: () => api.get('/api/news'),
  getById: (id) => api.get(`/api/news/${id}`),
  create: (formData) => api.post('/api/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/news/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/news/${id}`),
};

// Agent API (read-only)
export const agentAPI = {
  getProfile: () => api.get('/api/agent/profile'),
  getDashboard: () => api.get('/api/agent/dashboard'),
  getCandidates: () => api.get('/api/agent/candidates'),
};

// Demand Details API
export const demandDetailsAPI = {
  getByCompany: (company) => api.get(`/api/demand-details/company/${encodeURIComponent(company)}`),
    createAdvertisement: (formData) => api.post('/api/demand-details/advertisements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAdvertisement: (id) => api.delete(`/api/demand-details/advertisements/${id}`),
  uploadFile: (formData) => api.post('/api/demand-details/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFile: (id) => api.delete(`/api/demand-details/files/${id}`),
  createIssue: (formData) => api.post('/api/demand-details/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateIssueStatus: (id, status) => api.put(`/api/demand-details/issues/${id}/status`, null, {
    params: { status }
  }),
};

// Public API
export const publicAPI = {
  checkCandidateStatus: (data) => api.post('/api/public/candidate/status', data),
};

export default api;
