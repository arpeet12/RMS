import React from 'react';
import { FaUser, FaBriefcase, FaBuilding, FaInfoCircle, FaNewspaper, FaVideo, FaBroadcastTower, FaGlobe, FaClipboardCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const HeroSection = ({ onCheckStatus }) => {
  const categories = [
    { icon: FaClipboardCheck, label: 'Check Status', action: true }, // New item
    { icon: FaUser, label: 'For You', link: '/dashboard' },
    { icon: FaBriefcase, label: 'Job', link: '/jobs' },
    { icon: FaBuilding, label: 'Manpower', link: '/manpower' },
    { icon: FaInfoCircle, label: 'Info / Orientation', link: '/info' },
    { icon: FaNewspaper, label: 'News', link: '/news' },
    { icon: FaVideo, label: 'Video', link: '/videos' },
    { icon: FaBroadcastTower, label: 'Radio', link: '/radio' },
    // { icon: FaGlobe, label: 'Country Info', link: '/countries' }, // Removed to make space or keep it? Let's keep 8 items for symmetry if possible. 
    // The previous list had 8 items. Adding one makes 9. 
    // Let's remove 'Country Info' or 'Radio' if needed, or just let it wrap. 
    // The design uses flex-wrap, so it should be fine.
  ];

  const countries = [
    { name: 'UAE', count: 21 },
    { name: 'MALAYSIA', count: 19 },
    { name: 'KUWAIT', count: 16 },
    { name: 'SAUDI ARABIA', count: 13 },
    { name: 'QATAR', count: 7 },
    { name: 'CYPRUS', count: 5 },
    { name: 'JAPAN', count: 3 },
    { name: 'OMAN', count: 3 },
    { name: 'BAHRAIN', count: 2 },
  ];

  return (
    <div className="bg-brand-blue text-white pt-12 pb-24 relative overflow-hidden">
      {/* Background decoration or just solid color as per screenshot */}
      
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-xl md:text-2xl font-light mb-12 max-w-4xl mx-auto leading-relaxed">
          ManpowerHub features foreign jobs and international employment opportunities for professional, skilled, unskilled, high skilled and semi skilled job seekers.
        </h2>

        {/* Circular Icons */}
        <div className="flex flex-wrap justify-center gap-8 mb-16 relative z-20">
          {categories.map((item, index) => (
            item.action ? (
              <div 
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  if (onCheckStatus) onCheckStatus();
                }} 
                className="flex flex-col items-center group cursor-pointer text-white hover:text-white"
              >
                <div className="w-16 h-16 rounded-full bg-white text-brand-blue flex items-center justify-center text-2xl mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <item.icon />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ) : (
              <Link key={index} to={item.link} className="flex flex-col items-center group cursor-pointer text-white hover:text-white">
                <div className="w-16 h-16 rounded-full bg-white text-brand-blue flex items-center justify-center text-2xl mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <item.icon />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Country Pills - Positioned at bottom overlapping or just below */}
      <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-3">
          {countries.map((country, index) => (
            <Link key={index} to={`/jobs?country=${country.name}`} className="bg-white text-gray-800 px-6 py-2 rounded-full shadow-md hover:shadow-lg transition flex items-center gap-2 border border-gray-100 hover:text-brand-blue">
              <span className="font-semibold">{country.name}</span>
              <span className="text-brand-red font-bold">{country.count}</span>
            </Link>
          ))}
          <Link to="/jobs" className="bg-white text-gray-800 px-6 py-2 rounded-full shadow-md hover:shadow-lg transition font-semibold border border-gray-100 hover:text-brand-blue">
            MORE +
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
