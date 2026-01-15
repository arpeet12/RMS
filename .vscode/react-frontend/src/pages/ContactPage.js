import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl">We are here to help. Get in touch with us for any inquiries.</p>
        </div>
      </div>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your Name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your Email"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Inquiry Subject"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your Message"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center"
                >
                  <FaPaperPlane className="mr-2" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
              <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                <div className="flex gap-4">
                  <FaMapMarkerAlt className="text-2xl text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Our Office</h4>
                    <p className="text-gray-600">
                      123 Recruitment Plaza, New Baneshwor<br />
                      Kathmandu, Nepal
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <FaPhone className="text-2xl text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Phone</h4>
                    <p className="text-gray-600">
                      +977-1-4XXXXXX<br />
                      +977-98XXXXXXXX
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <FaEnvelope className="text-2xl text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Email</h4>
                    <p className="text-gray-600">
                      info@globalrecruit.com<br />
                      support@globalrecruit.com
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <FaClock className="text-2xl text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Opening Hours</h4>
                    <p className="text-gray-600">
                      Sunday - Friday: 9:00 AM - 5:00 PM<br />
                      Saturday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Placeholder */}
          <div className="mt-12 w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FaMapMarkerAlt className="text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-semibold">Google Map Placeholder</h2>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;

