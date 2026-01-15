import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PlaceholderPage from './components/PlaceholderPage';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateCVPage from './pages/CreateCVPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCandidates from './pages/admin/AdminCandidates';
import AdminCandidateDetails from './pages/admin/AdminCandidateDetails';
import AdminAddCandidatePage from './pages/admin/AdminAddCandidate';
import AdminJobs from './pages/admin/AdminJobs';
import AdminJobForm from './pages/admin/AdminJobForm';
import AdminDemands from './pages/admin/AdminDemands';
import AdminAddDemand from './pages/admin/AdminAddDemand';
import AdminDemandDetails from './pages/admin/AdminDemandDetails';
import AdminAgents from './pages/admin/AdminAgents';
import AdminAgentDetails from './pages/admin/AdminAgentDetails';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminEditHomepage from './pages/admin/AdminEditHomepage';
import AdminFlightHistory from './pages/admin/AdminFlightHistory';
import QRScanPage from './pages/admin/QRScanPage';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentDemands from './pages/agent/AgentDemands';
import AgentCandidates from './pages/agent/AgentCandidates';
import AgentSettings from './pages/agent/AgentSettings';
import GenericListingPage from './pages/GenericListingPage';
import StaticPage from './pages/StaticPage';

import JobDetailsPage from './pages/JobDetailsPage';
import JobsListingPage from './pages/JobsListingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-cv" element={<CreateCVPage />} />

          {/* New Generic Pages for Directory and Manpower */}
          <Route path="/directory" element={<GenericListingPage />} />
          <Route path="/manpower" element={<GenericListingPage />} />
          <Route path="/manpower/:id" element={<GenericListingPage />} />
          <Route path="/jobs" element={<JobsListingPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/page/:slug" element={<StaticPage />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>} 
          />
          <Route 
            path="/admin/candidates" 
            element={<PrivateRoute role="ADMIN"><AdminCandidates /></PrivateRoute>} 
          />
          <Route 
            path="/admin/candidates/add" 
            element={<PrivateRoute role="ADMIN"><AdminAddCandidatePage /></PrivateRoute>} 
          />
          <Route 
            path="/admin/candidates/edit/:id" 
            element={<PrivateRoute role="ADMIN"><AdminAddCandidatePage /></PrivateRoute>} 
          />
          <Route 
            path="/admin/candidates/:id"  
            element={<PrivateRoute role="ADMIN"><AdminCandidateDetails /></PrivateRoute>} 
          />
          <Route 
            path="/admin/demands" 
            element={<PrivateRoute role="ADMIN"><AdminDemands /></PrivateRoute>} 
          />
          <Route 
            path="/admin/demands/add" 
            element={<PrivateRoute role="ADMIN"><AdminAddDemand /></PrivateRoute>} 
          />
          <Route 
            path="/admin/demands/:company" 
            element={<PrivateRoute role="ADMIN"><AdminDemandDetails /></PrivateRoute>} 
          />
          <Route 
            path="/agent/demands/:company" 
            element={<PrivateRoute role="AGENT" permission={{ module: 'demand', action: 'detail' }}><AdminDemandDetails /></PrivateRoute>} 
          />
          <Route 
            path="/admin/jobs" 
            element={<PrivateRoute role="ADMIN"><AdminJobs /></PrivateRoute>} 
          />
          <Route 
            path="/admin/jobs/add" 
            element={<PrivateRoute role="ADMIN"><AdminJobForm /></PrivateRoute>} 
          />
          <Route 
            path="/admin/jobs/edit/:id" 
            element={<PrivateRoute role="ADMIN"><AdminJobForm /></PrivateRoute>} 
          />
          <Route 
            path="/admin/agents" 
            element={<PrivateRoute role="ADMIN"><AdminAgents /></PrivateRoute>} 
          />
          <Route 
            path="/admin/agents/add" 
            element={<PrivateRoute role="ADMIN"><PlaceholderPage title="Add Agent" /></PrivateRoute>} 
          />
          <Route 
            path="/admin/agents/:id" 
            element={<PrivateRoute role="ADMIN"><AdminAgentDetails /></PrivateRoute>} 
          />
          <Route 
            path="/admin/transactions" 
            element={<PrivateRoute role="ADMIN"><AdminFlightHistory /></PrivateRoute>} 
          />
          <Route 
            path="/admin/settings" 
            element={<PrivateRoute role="ADMIN"><AdminSettings /></PrivateRoute>} 
          />
          <Route 
            path="/admin/users" 
            element={<PrivateRoute role="ADMIN"><AdminUsers /></PrivateRoute>} 
          />
          <Route 
            path="/admin/reports" 
            element={<PrivateRoute role="ADMIN"><AdminReports /></PrivateRoute>} 
          />
          <Route 
            path="/admin/homepage" 
            element={<PrivateRoute role="ADMIN"><AdminEditHomepage /></PrivateRoute>} 
          />
          <Route 
            path="/admin/qr-scan" 
            element={<PrivateRoute role="ADMIN"><QRScanPage /></PrivateRoute>} 
          />
          
          {/* Agent Routes (Read-only) */}
          <Route 
            path="/agent/dashboard" 
            element={<PrivateRoute role="AGENT"><AgentDashboard /></PrivateRoute>} 
          />
          <Route 
            path="/agent/demands" 
            element={<PrivateRoute role="AGENT" permission={{ module: 'demand', action: 'list' }}><AgentDemands /></PrivateRoute>} 
          />
          <Route 
            path="/agent/candidates" 
            element={<PrivateRoute role="AGENT" permission={{ module: 'applicant', action: 'list' }}><AgentCandidates /></PrivateRoute>} 
          />
          <Route 
            path="/agent/qr-scan" 
            element={<PrivateRoute role="AGENT"><QRScanPage /></PrivateRoute>} 
          />
          <Route 
            path="/agent/settings" 
            element={<PrivateRoute role="AGENT"><AgentSettings /></PrivateRoute>} 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

