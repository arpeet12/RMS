import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Fake Data Generators
const generateFakeData = (type, count = 20) => {
  const data = [];
  const locations = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Biratnagar", "Chitwan", "Butwal", "Dharan"];
  
  for (let i = 0; i < count; i++) {
    let item = { id: i + 1, location: locations[Math.floor(Math.random() * locations.length)] };
    
    if (type === 'manpower') {
      const names = [
        "Kathmandu Overseas", "Global Manpower", "Nepal Recruitment", "Himalayan HR", "Everest Bureau",
        "Gorkha Resources", "Lumbini Overseas", "Sunrise Manpower", "Blue Sky Int.", "Pacific HR",
        "Atlas Overseas", "Delta Manpower", "Elite Recruitment", "Frontline Associates", "Golden Future",
        "Horizon Int.", "Imperial Manpower", "Jupiter Overseas", "Koshi HR", "Liberty Manpower"
      ];
      item.title = `${names[i % names.length]} Pvt. Ltd.`;
      item.subtitle = `Lic. No: ${1000 + i}/079/080`;
      item.description = "Leading recruitment agency in Nepal specializing in Gulf countries and Malaysia.";
      item.phone = `+977-01-4${Math.floor(Math.random() * 900000 + 100000)}`;
      item.tag = "Recruitment Agency";
    } else if (type === 'medical') {
      const prefixes = ["National", "City", "Star", "Green", "Nepal", "Advanced", "Care", "Life", "Hope", "Trust"];
      const suffixes = ["Medical Center", "Clinic", "Health Home", "Diagnostic Center", "Polyclinic"];
      item.title = `${prefixes[i % prefixes.length]} ${suffixes[i % suffixes.length]}`;
      item.subtitle = "Approved by GCC Health Council";
      item.description = "Providing comprehensive medical check-ups for foreign employment candidates.";
      item.phone = `+977-01-5${Math.floor(Math.random() * 900000 + 100000)}`;
      item.tag = "Medical Center";
    } else if (type === 'orientation') {
      item.title = `${["Alpha", "Beta", "Gamma", "Delta", "Sigma"][i % 5]} Orientation Center`;
      item.subtitle = "DoFE Approved";
      item.description = "Pre-departure orientation training for foreign employment aspirants.";
      item.phone = `+977-98${Math.floor(Math.random() * 90000000 + 10000000)}`;
      item.tag = "Training Institute";
    } else if (type === 'insurance') {
      item.title = `${["Prudential", "Sagarmatha", "Shikhar", "Neco", "Premier"][i % 5]} Insurance`;
      item.subtitle = "Life & Non-Life";
      item.description = "Special insurance packages for foreign employment workers.";
      item.phone = `+977-01-4${Math.floor(Math.random() * 900000 + 100000)}`;
      item.tag = "Insurance";
    } else {
       // Default / Generic
       item.title = `Sample Entity ${i + 1}`;
       item.subtitle = "Generic Subtitle";
       item.description = "This is a placeholder description for the directory listing.";
       item.phone = "+977-123456789";
       item.tag = "Listing";
    }
    data.push(item);
  }
  return data;
};

const GenericListingPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Determine type from URL path or query param
  let pageTitle = "Directory";
  let type = "generic";
  
  if (location.pathname.includes("/manpower")) {
    pageTitle = "Manpower Agencies";
    type = "manpower";
  } else if (location.pathname.includes("/directory")) {
    const dirType = queryParams.get("type");
    if (dirType) {
      pageTitle = dirType;
      if (dirType.toLowerCase().includes("medical")) type = "medical";
      else if (dirType.toLowerCase().includes("orientation")) type = "orientation";
      else if (dirType.toLowerCase().includes("insurance")) type = "insurance";
    }
  } else if (location.pathname.includes("/jobs")) {
     pageTitle = "Jobs Listing";
     // We might want to fetch real jobs here, but for now we'll fake it if needed or reuse this page
     // If this page is strictly for "directory" style listings, we might want a separate component for Jobs.
     // But user asked for "random pages", so let's stick to directory entities for now.
  }

  const items = useMemo(() => generateFakeData(type, 30), [type]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      
      <div className="bg-brand-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-blue-100 text-lg">Browse through our comprehensive list of {pageTitle.toLowerCase()}.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <span className="inline-block bg-blue-50 text-brand-blue text-xs px-2 py-1 rounded-full font-semibold mb-2">
                     {item.tag}
                   </span>
                   <h3 className="text-xl font-bold text-gray-800 leading-tight">{item.title}</h3>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  {/* Placeholder Icon */}
                  <span className="text-lg font-bold">{item.title.charAt(0)}</span>
                </div>
              </div>
              
              <p className="text-sm text-brand-red font-medium mb-2">{item.subtitle}</p>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
              
              <div className="border-t border-gray-100 pt-4 mt-auto">
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <span className="font-medium mr-2">📍 Location:</span> {item.location}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="font-medium mr-2">📞 Phone:</span> {item.phone}
                </div>
              </div>
              
              <button className="mt-4 w-full bg-white border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-semibold py-2 rounded transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GenericListingPage;
