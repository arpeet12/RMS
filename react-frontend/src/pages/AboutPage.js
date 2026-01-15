import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaBullseye, FaEye, FaHandshake, FaCheckCircle, FaUserTie, FaGlobe } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">About Global Recruit</h1>
          <p className="text-xl">Your trusted partner in ethical and professional foreign employment services.</p>
        </div>
      </div>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Who We Are Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Who We Are</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Global Recruit is a leading manpower recruitment agency dedicated to connecting skilled professionals 
                with prestigious international employers. Established with a vision to provide transparent and reliable 
                recruitment services, we have successfully placed thousands of candidates in countries across the Middle 
                East, Southeast Asia, and Europe.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our team consists of industry experts who understand the nuances of international labor laws, visa 
                processing, and candidate welfare, ensuring a smooth transition for every job seeker.
              </p>
            </div>
            <div>
              <img 
                src="https://via.placeholder.com/600x400?text=About+Us+Image" 
                alt="About Us" 
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-primary-600">
              <FaBullseye className="text-4xl text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To empower individuals by providing them with life-changing career opportunities abroad while ensuring 
                their safety, dignity, and professional growth.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-purple-600">
              <FaEye className="text-4xl text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be the most trusted and ethical global recruitment partner, recognized for excellence in service 
                and commitment to human values.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-green-600">
              <FaHandshake className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-4">Our Values</h3>
              <p className="text-gray-600">
                Integrity, Transparency, Excellence, and Respect for every individual we serve.
              </p>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-2xl text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Government Licensed</h4>
                <p className="text-gray-600 text-sm">Fully licensed by the Department of Foreign Employment.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserTie className="text-2xl text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Expert Team</h4>
                <p className="text-gray-600 text-sm">Decades of combined experience in recruitment.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaGlobe className="text-2xl text-primary-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Global Network</h4>
                <p className="text-gray-600 text-sm">Strong partnerships in UAE, Qatar, Malaysia, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;

