import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  FaHome, 
  FaGlobe, 
  FaPlusCircle, 
  FaUsers, 
  FaUserPlus, 
  FaUserTie, 
  FaPlaneDeparture, 
  FaCog, 
  FaUserShield, 
  FaChartBar,
  FaSignOutAlt,
  FaQrcode
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { logout, user, hasPermission } = useAuth();

  // Admin/Officer menu items
  const adminMenuItems = [
    { path: '/admin/dashboard', name: 'HOME', icon: <FaHome /> },
    { path: '/admin/demands', name: 'DEMAND', icon: <FaGlobe /> },
    { path: '/admin/demands/add', name: 'ADD DEMAND', icon: <FaPlusCircle /> },
    { path: '/admin/candidates', name: 'APPLICANTS', icon: <FaUsers /> },
    { path: '/admin/candidates/add', name: 'ADD APPLICANT', icon: <FaUserPlus /> },
    { path: '/admin/qr-scan', name: 'QR SCAN', icon: <FaQrcode /> },
    { path: '/admin/agents', name: 'AGENTS', icon: <FaUserTie /> },
    { path: '/admin/transactions', name: 'FLIGHT HISTORY', icon: <FaPlaneDeparture /> },
    { path: '/admin/settings', name: 'SETTINGS', icon: <FaCog /> },
    { path: '/admin/users', name: 'USERS', icon: <FaUserShield /> },
    { path: '/admin/reports', name: 'REPORTS', icon: <FaChartBar /> },
    { path: '/admin/homepage', name: 'EDIT HOMEPAGE', icon: <FaGlobe /> },
  ];

  // Determine which menu items to show based on user role
  const menuItems = (() => {
    if (user?.role === 'AGENT') {
      const canDemand = hasPermission('demand', 'list');
      const canApplicant = hasPermission('applicant', 'list');
      const items = [{ path: '/agent/dashboard', name: 'HOME', icon: <FaHome /> }];
      if (canDemand) items.push({ path: '/agent/demands', name: 'DEMANDS', icon: <FaGlobe /> });
      if (canApplicant) items.push({ path: '/agent/candidates', name: 'CANDIDATES', icon: <FaUsers /> });
      items.push({ path: '/agent/qr-scan', name: 'QR SCAN', icon: <FaQrcode /> });
      items.push({ path: '/agent/settings', name: 'SETTINGS', icon: <FaCog /> });
      return items;
    }
    return adminMenuItems;
  })();

  return (
    <div className="w-64 bg-white shadow-xl h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b flex items-center justify-center">
        <Link to="/" className="text-xl font-bold tracking-wide hover:opacity-80 transition-opacity">
          <span className="text-brand-blue">Humour</span>
          <span className="text-brand-red">Overseas</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-brand-blue border-l-4 border-brand-blue'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-blue'
              }`
            }
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
        
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors mt-8"
        >
          <span className="mr-3 text-lg"><FaSignOutAlt /></span>
          LOGOUT
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
