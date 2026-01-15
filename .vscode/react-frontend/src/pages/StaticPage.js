import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StaticPage = () => {
  const { slug } = useParams();

  // Helper to format slug to Title Case
  const formatTitle = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const title = slug ? formatTitle(slug) : "Page Not Found";

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            {title}
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Welcome to our {title} page. Here you can find all the information you need.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="bg-white shadow rounded-lg p-8 prose max-w-none text-gray-700">
           {/* Lorem Ipsum Content */}
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
           <p className="mb-6">
             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
             Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
           </p>
           
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
           <p className="mb-6">
             Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
             Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
           </p>
           
           <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
           <p className="mb-6">
             Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
             totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
           </p>
           
           <blockquote className="border-l-4 border-brand-blue pl-4 italic text-gray-600 my-8">
             "Innovation distinguishes between a leader and a follower."
           </blockquote>

           <h3 className="text-xl font-bold text-gray-900 mb-3">Why Choose Us?</h3>
           <ul className="list-disc pl-5 space-y-2 mb-6">
             <li>Professional and experienced team</li>
             <li>Dedicated to customer satisfaction</li>
             <li>Innovative solutions for modern problems</li>
             <li>Reliable and trustworthy partners</li>
           </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StaticPage;
