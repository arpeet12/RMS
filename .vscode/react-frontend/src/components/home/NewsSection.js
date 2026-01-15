import React from 'react';
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

const NewsSection = ({ news }) => {
  if (!Array.isArray(news) || news.length === 0) return null;

  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${photoPath}`;
  };

  return (
    <div className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
             <h2 className="text-2xl font-bold text-gray-700 uppercase mb-2">Latest News & Updates</h2>
             <p className="text-gray-500">Stay informed with the latest announcements and opportunities.</p>
          </div>
          <button className="text-brand-blue font-semibold hover:underline flex items-center gap-1">
            View All <FaArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.slice(0, 3).map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="h-48 rounded-lg overflow-hidden mb-4 relative">
                {item.photoPath ? (
                  <img src={getImageUrl(item.photoPath)} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-xs font-bold rounded-full text-brand-blue shadow-sm">
                   NEWS
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <FaCalendarAlt />
                <span>{item.date}</span>
              </div>
              
              <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-brand-blue transition line-clamp-2">
                {item.title}
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {item.content}
              </p>
              
              <span className="text-brand-blue text-sm font-semibold hover:underline">Read More</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
