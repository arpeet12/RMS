import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Global Recruit</h3>
            <p className="text-gray-400 mb-4">
              Connecting talent with opportunity worldwide. Your trusted partner in foreign employment.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaFacebook className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaTwitter className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaLinkedin className="text-2xl" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-gray-400 hover:text-white transition">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
          
          {/* For Candidates */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Candidates</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition">
                  Register Profile
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Visa Information
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  Safety Guidelines
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mr-2 mt-1 flex-shrink-0" />
                <span>Kathmandu, Nepal</span>
              </li>
              <li className="flex items-start">
                <FaPhone className="mr-2 mt-1 flex-shrink-0" />
                <span>+977-1-4XXXXXX</span>
              </li>
              <li className="flex items-start">
                <FaEnvelope className="mr-2 mt-1 flex-shrink-0" />
                <span>info@globalrecruit.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-400">
          <p>&copy; 2024 Global Recruit Manpower. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

