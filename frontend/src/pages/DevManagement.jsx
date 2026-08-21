import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { developerService } from '../services/api';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertCircle,
  UserCheck,
  UserMinus,
  Briefcase
} from 'lucide-react';

const DevManagement = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const data = await developerService.getAll();
      setDevelopers(data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch developers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleDelete = async (devId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete developer ${name}?`)) {
      return;
    }

    try {
      await developerService.delete(devId);
      setDevelopers(prev => prev.filter(d => d.developer_id !== devId));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete developer.');
    }
  };

  const filteredDevs = developers.filter(dev => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = dev.name.toLowerCase().includes(term) || 
                          dev.email.toLowerCase().includes(term) ||
                          dev.expertises.some(e => e.name.toLowerCase().includes(term));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-primary-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-primary-900">Developer Profile Records</h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Configure and manage engineering personnel metrics</p>
        </div>
        <Link 
          to="/developers/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all cursor-pointer"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add Developer Profile</span>
        </Link>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-2xl border border-primary-200/80 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-primary-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search developers by name, email, or technology domain (e.g. Java)..."
            className="w-full pl-10 pr-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium"
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-755 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-650 flex-shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-primary-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {filteredDevs.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-primary-200/60 bg-primary-50/50 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-4">Developer</th>
                    <th className="px-6 py-4">Status & Experience</th>
                    <th className="px-6 py-4">Availability</th>
                    <th className="px-6 py-4">Workload Distribution</th>
                    <th className="px-6 py-4">Technologies & Expertise</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {filteredDevs.map(dev => {
                    const workloadPercent = Math.min(100, Math.round((dev.current_workload / dev.max_workload) * 100));
                    
                    return (
                      <tr key={dev.developer_id} className="hover:bg-primary-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-200/50 flex items-center justify-center font-bold text-sm shadow-sm">
                              {dev.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-primary-850 text-sm leading-tight">{dev.name}</h4>
                              <span className="text-primary-400 text-[10px] font-semibold block mt-0.5">{dev.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {dev.status === 'Active' ? (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.25 rounded border border-emerald-200/50 uppercase tracking-wide">
                                  <UserCheck className="h-3 w-3" /> Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.25 rounded border border-red-200 uppercase tracking-wide">
                                  <UserMinus className="h-3 w-3" /> Inactive
                                </span>
                              )}
                            </div>
                            <span className="text-primary-505 font-bold block text-[10px]">
                              {dev.experience_years} years experience
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border uppercase tracking-wider ${
                            dev.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                            dev.availability === 'Busy' ? 'bg-yellow-50 text-yellow-750 border-yellow-250/60' :
                            'bg-red-50 text-red-700 border-red-200/60'
                          }`}>
                            {dev.availability}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1.5 max-w-[120px]">
                            <div className="flex justify-between items-center text-[10px] text-primary-400 font-bold">
                              <span>Reviews: <strong className="text-primary-800 font-extrabold">{dev.current_workload}/{dev.max_workload}</strong></span>
                              <span>{workloadPercent}%</span>
                            </div>
                            <div className="w-full bg-primary-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  dev.current_workload >= dev.max_workload ? 'bg-red-500' :
                                  dev.current_workload > 1 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} 
                                style={{ width: `${workloadPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {dev.expertises && dev.expertises.length > 0 ? (
                              dev.expertises.map((exp, idx) => (
                                <span 
                                  key={idx} 
                                  className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md text-[9px] font-bold border border-primary-200/40 flex items-center gap-1 shadow-sm"
                                >
                                  <span>{exp.name}</span>
                                  <span className="text-[8px] font-black text-primary-400">({exp.skill_level})</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-primary-400 italic text-[10px] font-semibold">No expertise configured</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link 
                              to={`/developers/${dev.developer_id}/edit`}
                              className="p-2 bg-white hover:bg-brand-50 border border-primary-200 hover:border-brand-200/80 text-primary-650 hover:text-brand-700 rounded-xl transition-all cursor-pointer shadow-sm"
                              title="Edit Profile"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(dev.developer_id, dev.name)}
                              className="p-2 bg-white hover:bg-red-50 border border-primary-200 hover:border-red-200/80 text-primary-655 hover:text-red-700 rounded-xl transition-all cursor-pointer shadow-sm"
                              title="Delete profile"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-12 text-primary-400 font-semibold italic bg-white">
                🔍 No developers found matching your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevManagement;
