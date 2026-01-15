import React from 'react';
import { FaPlay, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ExpertVideos = () => {
  const videos = [
    {
      id: 1,
      title: "श्रम नवीकरण सेवा कसरी लिने ?",
      thumbnailColor: "bg-gray-800", // Placeholder for actual image
      duration: "5:20"
    },
    {
      id: 2,
      title: "Hire Me किन र कसरी ?",
      thumbnailColor: "bg-blue-900",
      duration: "3:45"
    },
    {
      id: 3,
      title: "'वैदेशिक रोजगार' कुन विज्ञापन...",
      thumbnailColor: "bg-teal-700",
      duration: "6:10"
    },
    {
      id: 4,
      title: "Baideshik Rojgar app: प्रोफेशनल...",
      thumbnailColor: "bg-indigo-600",
      duration: "4:30"
    }
  ];

  return (
    <div className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-700">Expert Speak Videos</h2>
          <Link to="/videos" className="text-brand-blue font-semibold hover:underline flex items-center gap-1">
            View all <FaChevronRight className="text-xs" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="group cursor-pointer">
              <div className={`relative aspect-video rounded-lg overflow-hidden shadow-sm ${video.thumbnailColor} flex items-center justify-center`}>
                {/* Play Button Overlay */}
                <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/50 transition-all border-2 border-white">
                  <FaPlay className="text-white ml-1" />
                </div>
                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  {video.duration}
                </span>
              </div>
              <h3 className="mt-3 text-gray-800 font-medium group-hover:text-brand-blue line-clamp-2">
                {video.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertVideos;
