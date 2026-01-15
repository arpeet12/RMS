import React from 'react';
import { FaStar, FaBuilding } from 'react-icons/fa';

const mockManpower = [
  { id: 1, name: 'Bridge Sky International Pvt. Ltd.', location: 'Tokha 7, Kathmandu, Nepal', views: 807, rating: 4 },
  { id: 2, name: 'AAYUSH OVERSEAS PVT. LTD.', location: 'Sinamangal-9, Kathmandu, Nepal', views: 283, rating: 3 },
  { id: 3, name: 'The River Overseas Pvt. Ltd', location: 'Kathmandu', views: 6178, rating: 5, activeJobs: 1 },
  { id: 4, name: 'International Manpower Recruitment Pvt. Ltd', location: 'Kathmandu', views: 421424, rating: 4, activeJobs: 1 },
];

const ManpowerList = () => {
  return (
    <div className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Trending Manpower */}
          <div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-700 uppercase">Trending Manpower</h3>
              <p className="text-sm text-gray-500">View the list of Manpower with the most profile visits in the last one week.</p>
            </div>
            
            <div className="space-y-6">
              {mockManpower.slice(0, 2).map((mp, index) => (
                <div key={mp.id} className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition rounded-lg">
                   <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}.</div>
                   <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                     <FaBuilding size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-800 flex items-center gap-2">
                       {mp.name} <FaStar className="text-yellow-400 text-sm" />
                     </h4>
                     <p className="text-sm text-gray-500">{mp.location}</p>
                     <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                       <span>{mp.views} views</span>
                       <div className="flex text-yellow-400">
                         {[...Array(5)].map((_, i) => (
                           <FaStar key={i} className={i < mp.rating ? '' : 'text-gray-200'} />
                         ))}
                       </div>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Manpower */}
          <div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-700 uppercase">Popular Manpower</h3>
              <p className="text-sm text-gray-500">View the list of Manpower with the most visited profiles so far.</p>
            </div>

            <div className="space-y-6">
              {mockManpower.slice(2, 4).map((mp, index) => (
                <div key={mp.id} className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition rounded-lg">
                   <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}.</div>
                   <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                     <FaBuilding size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-800 flex items-center gap-2">
                       {mp.name} <FaStar className="text-yellow-400 text-sm" />
                     </h4>
                     <div className="text-xs text-gray-500 mb-1">
                       {mp.views} views | {mp.activeJobs && <span className="bg-green-600 text-white px-1 rounded text-[10px]">{mp.activeJobs} Active Jobs</span>}
                     </div>
                     <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                       <span>{mp.views} views</span>
                       <div className="flex text-yellow-400">
                         {[...Array(5)].map((_, i) => (
                           <FaStar key={i} className={i < mp.rating ? '' : 'text-gray-200'} />
                         ))}
                       </div>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManpowerList;
