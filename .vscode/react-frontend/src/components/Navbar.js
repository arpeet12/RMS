import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaCaretDown } from 'react-icons/fa';

const manpowerList = [
  "Kathmandu Overseas Pvt. Ltd.", "Global Manpower Solutions", "Nepal Recruitment Agency", "Himalayan HR Services",
  "Everest Employment Bureau", "Gorkha Human Resources", "Lumbini Overseas", "Sunrise Manpower",
  "Blue Sky International", "Pacific Human Resources", "Atlas Overseas", "Delta Manpower",
  "Elite Recruitment", "Frontline Associates", "Golden Future Overseas", "Horizon International",
  "Imperial Manpower", "Jupiter Overseas", "Koshi HR Solutions", "Liberty Manpower",
  "Merit International", "Noble Human Resources", "Orbit Overseas", "Pioneer Recruitment",
  "Quality Manpower", "Reliable Overseas", "Summit HR Services", "Trust International",
  "United Manpower", "Vision Overseas", "World Wide Recruitment", "Xcel HR Solutions",
  "Yeti Overseas", "Zenith Manpower", "Alpha Recruitment", "Beta Overseas",
  "Gamma HR Services", "Delta International", "Epsilon Manpower", "Zeta Overseas",
  "Eta Human Resources", "Theta Recruitment", "Iota Overseas", "Kappa Manpower",
  "Lambda HR Services", "Mu International", "Nu Overseas", "Xi Manpower",
  "Omicron Recruitment", "Pi Overseas"
];

const jobsCategories = [
  "Construction", "Hospitality", "Security", "Driving", "Sales & Marketing",
  "Manufacturing", "Cleaning", "Medical & Healthcare", "Engineering", "IT & Software",
  "Accounting", "Administration", "Agriculture", "Education", "Customer Service"
];

const directoryCategories = [
  "Medical Centers", "Orientation Centers", "Training Institutes", "Insurance Companies",
  "Travel Agencies", "Consulates & Embassies", "Labor Department"
];

const moreLinks = [
  "About Us", "Contact Us", "Blog", "News", "Privacy Policy", "Terms of Service", "FAQ"
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCheckStatus = (e) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      // Already on home page, just set the hash which will trigger the modal
      window.location.hash = 'candidate-status-check';
    } else {
      // Navigate to home page first, then set hash after navigation
      navigate('/');
      setTimeout(() => {
        window.location.hash = 'candidate-status-check';
      }, 100);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center text-2xl font-bold tracking-wide">
              <span className="text-brand-blue">Humour </span>
              <span className="text-brand-red">Overseas </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {/* CREATE CV Link - Highlighted */}
        

            {/* JOBS Dropdown */}
            <div className="relative group cursor-pointer text-gray-700 font-medium hover:text-brand-blue flex items-center gap-1 h-20">
              <span className="flex items-center gap-1">JOBS <FaCaretDown className="text-gray-400" /></span>
              <div className="absolute top-full left-0 mt-0 w-64 bg-white shadow-xl rounded-b-md border-t-2 border-brand-blue opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-50">
                <div className="py-3">
                  {jobsCategories.map((category, index) => (
                    <Link key={index} to={`/jobs?category=${category}`} className="block px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-blue transition-colors">
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* MANPOWER Dropdown (Mega Menu) */}
            <div className="relative group cursor-pointer text-gray-700 font-medium hover:text-brand-blue flex items-center gap-1 h-20">
              <span className="flex items-center gap-1">MANPOWER <FaCaretDown className="text-gray-400" /></span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[900px] bg-white shadow-xl rounded-b-md border-t-2 border-brand-blue opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-50">
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Featured Manpower Agencies</h3>
                  <div className="grid grid-cols-4 gap-x-6 gap-y-2">
                    {manpowerList.map((manpower, index) => (
                      <Link key={index} to={`/manpower/${index}`} className="text-sm text-gray-600 hover:text-brand-blue truncate block py-1" title={manpower}>
                        {manpower}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t text-center">
                    <Link to="/manpower" className="text-brand-blue font-semibold hover:underline text-sm">View All Manpower Agencies &rarr;</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* DIRECTORY Dropdown */}
            <div className="relative group cursor-pointer text-gray-700 font-medium hover:text-brand-blue flex items-center gap-1 h-20">
              <span className="flex items-center gap-1">DIRECTORY <FaCaretDown className="text-gray-400" /></span>
              <div className="absolute top-full left-0 mt-0 w-64 bg-white shadow-xl rounded-b-md border-t-2 border-brand-blue opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-50">
                 <div className="py-3">
                  {directoryCategories.map((dir, index) => (
                    <Link key={index} to={`/directory?type=${dir}`} className="block px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-blue transition-colors">
                      {dir}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* MORE Dropdown */}
            <div className="relative group cursor-pointer text-gray-700 font-medium hover:text-brand-blue flex items-center gap-1 h-20">
              <span className="flex items-center gap-1">MORE <FaCaretDown className="text-gray-400" /></span>
              <div className="absolute top-full right-0 mt-0 w-48 bg-white shadow-xl rounded-b-md border-t-2 border-brand-blue opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-50">
                 <div className="py-3">
                  {moreLinks.map((link, index) => (
                    <Link key={index} to={`/page/${link.toLowerCase().replace(/\s+/g, '-')}`} className="block px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-blue transition-colors">
                      {link}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <a 
              href="/#candidate-status-check" 
              onClick={handleCheckStatus}
              className="text-brand-blue font-semibold hover:text-blue-800 transition hidden sm:block cursor-pointer"
            >
              Check Status
            </a>

            <Link 
              to="/create-cv"  
              className="bg-brand-red text-white px-6 py-2 rounded-full font-semibold hover:bg-red-600 transition shadow-md"
            >
              Create CV
            </Link>

            {user ? (
               <div className="relative group">
                 <button className="w-10 h-10 rounded-full bg-brand-orange text-white font-bold flex items-center justify-center">
                   {user.username ? user.username.substring(0, 2).toUpperCase() : 'AN'}
                 </button>
                 {/* Bridge to maintain hover state */}
                 <div className="absolute right-0 top-full w-full h-4 bg-transparent"></div>
                 {/* Dropdown for user */}
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-gray-100">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">Signed in as <strong>{user.username}</strong></div>
                    {(user.role === 'ADMIN' || user.role === 'OFFICER') && (
                        <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</Link>
                    )}
                    {user.role === 'CANDIDATE' && (
                        <Link to="/candidate/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Dashboard</Link>
                    )}
                    {user.role === 'AGENT' && (
                        <Link to="/agent/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Agent Dashboard</Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                 </div>
               </div>
            ) : (
              <Link to="/login" className="text-gray-700 font-medium hover:text-brand-blue">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
