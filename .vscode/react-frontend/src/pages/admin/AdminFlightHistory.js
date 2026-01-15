import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import { FaPlaneDeparture, FaSearch, FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const statusBadge = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'SCHEDULED') return 'bg-blue-100 text-blue-800';
  if (s === 'DEPARTED') return 'bg-yellow-100 text-yellow-800';
  if (s === 'ARRIVED') return 'bg-green-100 text-green-800';
  if (s === 'CANCELLED') return 'bg-red-100 text-red-800';
  if (s === 'DELAYED') return 'bg-gray-100 text-gray-800';
  return 'bg-gray-100 text-gray-800';
};

const AdminFlightHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const fetchTickets = async () => {
    try {
      const params = {};
      if (status !== 'All') params.status = status;
      const res = await adminAPI.getAllFlightTickets(params);
      setTickets(res.data || []);
      setError('');
    } catch (e) {
      console.error('Failed to load flight tickets', e);
      setError('Failed to load flight tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = tickets.filter(t => {
    const hay = [
      t.airline,
      t.departureFrom,
      t.destination,
      t.candidateName
    ].join(' ').toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaPlaneDeparture /> Flight History
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search airline, route, candidate"
                className="pl-10 pr-3 py-2 border rounded-md w-64"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option>All</option>
              <option>SCHEDULED</option>
              <option>DEPARTED</option>
              <option>ARRIVED</option>
              <option>CANCELLED</option>
              <option>DELAYED</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading flight tickets...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No flight tickets found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Airline</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{t.departureDate || '-'}</td>
                    <td className="px-6 py-4 text-sm">{t.airline || '-'}</td>
                    <td className="px-6 py-4 text-sm">{t.departureFrom} → {t.destination}</td>
                    <td className="px-6 py-4 text-sm">{t.departureTime || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(t.status)}`}>
                        {t.status || 'SCHEDULED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {t.candidateName ? (
                        <div className="flex items-center gap-2">
                          <FaHistory className="text-gray-400" />
                          {t.candidateName}
                        </div>
                      ) : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {t.candidateId ? (
                        <Link
                          to={`/admin/candidates/${t.candidateId}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          View Profile
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFlightHistory;
