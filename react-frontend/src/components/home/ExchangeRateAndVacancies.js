import React from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ExchangeRateAndVacancies = () => {
  const exchangeRates = [
    { country: "India", unit: 100, buy: "160.00", sell: "160.15", flag: "🇮🇳" },
    { country: "United States", unit: 1, buy: "143.97", sell: "144.57", flag: "🇺🇸" },
    { country: "Eurozone", unit: 1, buy: "167.65", sell: "168.35", flag: "🇪🇺" },
    { country: "United Kingdom", unit: 1, buy: "193.09", sell: "193.90", flag: "🇬🇧" },
    { country: "Switzerland", unit: 1, buy: "180.02", sell: "180.77", flag: "🇨🇭" },
    { country: "Australia", unit: 1, buy: "95.50", sell: "96.20", flag: "🇦🇺" },
    { country: "Japan", unit: 10, buy: "9.80", sell: "9.95", flag: "🇯🇵" },
  ];

  const positions = [
    { name: "Security Guards", count: 7 },
    { name: "Waiter/waitress", count: 6 },
    { name: "Production Operator", count: 4 },
    { name: "Cleaner General", count: 4 },
    { name: "Waiters", count: 4 },
    { name: "Cooks", count: 7 },
    { name: "Driver", count: 5 },
    { name: "Carpenters", count: 4 },
    { name: "Helpers", count: 4 },
    { name: "Assistant Cook", count: 4 },
    { name: "Construction Worker", count: 6 },
    { name: "Butcher", count: 4 },
    { name: "Barista", count: 4 },
    { name: "Scaffolder Worker", count: 4 },
    { name: "Steel Fixers", count: 3 },
  ];

  return (
    <div className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Exchange Rate Column (Approx 4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <div className="bg-brand-blue text-white py-3 px-4 text-center">
                <h3 className="text-xl font-bold">Today's Exchange Rate</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Country</th>
                      <th className="px-2 py-3">Unit</th>
                      <th className="px-2 py-3">Buy</th>
                      <th className="px-2 py-3">Sell</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {exchangeRates.map((rate, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                          <span className="text-lg">{rate.flag}</span> {rate.country}
                        </td>
                        <td className="px-2 py-3 text-gray-600">{rate.unit}</td>
                        <td className="px-2 py-3 text-gray-600">Rs: {rate.buy}</td>
                        <td className="px-2 py-3 text-gray-600">Rs: {rate.sell}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Vacancies By Position Column (Approx 8 cols) */}
          <div className="lg:col-span-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-600 uppercase">FIND JOBS VACANCIES BY POSITION</h2>
              <div className="h-1 w-20 bg-brand-blue mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {positions.map((pos, index) => (
                <Link 
                  key={index} 
                  to={`/jobs?position=${pos.name}`}
                  className="flex items-center gap-2 text-gray-700 hover:text-brand-blue transition-colors group"
                >
                  <FaChevronRight className="text-brand-blue text-xs flex-shrink-0" />
                  <span className="font-medium group-hover:underline">{pos.name}</span>
                  <span className="text-gray-400 text-sm">({pos.count})</span>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-right border-t border-gray-100 pt-4">
               <Link to="/jobs" className="text-brand-blue font-semibold hover:underline text-sm flex items-center justify-end gap-1">
                View all positions <FaChevronRight className="text-xs" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExchangeRateAndVacancies;
