import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { developerService } from '../services/api';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertCircle,
  Briefcase,
  Calendar,
  Grid,
  List,
  X
} from 'lucide-react';

const DevManagement = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

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

  const getDeveloperRole = (expYears) => {
    if (expYears >= 7) return 'Principal Engineer';
    if (expYears >= 5) return 'Senior Software Engineer';
    if (expYears >= 2) return 'Software Engineer';
    return 'Junior Associate Engineer';
  };

  const filteredDevs = developers.filter(dev => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = dev.name.toLowerCase().includes(term) || 
                          dev.email.toLowerCase().includes(term) ||
                          dev.expertises.some(e => e.name.toLowerCase().includes(term));
    const matchesAvailability = availabilityFilter === '' ? true : dev.availability === availabilityFilter;
    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-surface-350/30 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide">Developer Directory</h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Configure and manage engineering personnel routing indices</p>
        </div>
        <Link 
          to="/developers/new"
          className="btn-primary py-2.5 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add Developer Profile</span>
        </Link>
      </div>

      {/* Filter and search bar */}
      <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-primary-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search developers by name, email, or technology domain (e.g. React)..."
            className="w-full pl-10 pr-4 py-3 bg-darkbg/85 border border-white/10 hover:border-white/15 focus:border-brand-500 focus:bg-darkbg text-xs rounded-xl focus:outline-none text-white transition-all font-medium"
          />
        </div>

        <div className="w-full md:w-56 flex items-center gap-1.5">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full px-3 py-3 bg-darkbg border border-white/10 text-primary-200 hover:text-white rounded-xl focus:border-brand-500 focus:bg-darkbg text-xs font-bold outline-none transition-all cursor-pointer"
          >
            <option value="">All Availabilities</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-950/20 border border-red-900/50 text-red-300 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevs.length > 0 ? (
            filteredDevs.map(dev => {
              const workloadPercent = Math.min(100, Math.round((dev.current_workload / dev.max_workload) * 100));
              const roleTitle = getDeveloperRole(dev.experience_years);
              
              return (
                <div key={dev.developer_id} className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 hover:-translate-y-0.5 transition-all duration-200">
                  {/* Top section: name + av */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-black text-base shadow-sm">
                        {dev.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm leading-snug">{dev.name}</h4>
                        <span className="text-[10px] text-brand-400 font-extrabold tracking-wider block mt-0.5 uppercase">{roleTitle}</span>
                        <span className="text-[10px] text-primary-400 block mt-0.5">{dev.email}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.75 rounded-full font-bold text-[9px] border uppercase tracking-wider ${
                      dev.availability === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(34,197,94,0.05)]' :
                      dev.availability === 'Busy' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {dev.availability}
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-black tracking-widest text-primary-450">Expertise Grid</span>
                    <div className="flex flex-wrap gap-1.5">
                      {dev.expertises && dev.expertises.length > 0 ? (
                        dev.expertises.map((exp, idx) => (
                          <span 
                            key={idx} 
                            className="bg-white/5 text-primary-200 px-2 py-0.5 rounded-md text-[9px] font-bold border border-white/10 flex items-center gap-1 shadow-sm"
                          >
                            <span>{exp.name}</span>
                            <span className="text-[8px] text-primary-400 font-black">({exp.skill_level})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-primary-400 italic text-[10px] font-semibold">No expertise domains</span>
                      )}
                    </div>
                  </div>

                  {/* Workload Indicator Progress Track */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-primary-405 font-bold">
                      <span>Workload load: <strong className="text-white font-extrabold">{dev.current_workload} / {dev.max_workload}</strong></span>
                      <span>{workloadPercent}% capacity</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          dev.current_workload >= dev.max_workload ? 'bg-red-500' :
                          dev.current_workload > 1 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${workloadPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions & experience footer */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary-500" />
                      {dev.experience_years} Years Exp
                    </span>

                    <div className="flex gap-2">
                      <Link 
                        to={`/developers/${dev.developer_id}/edit`}
                        className="p-2 bg-white/5 hover:bg-brand-500/10 border border-white/10 hover:border-brand-500/30 text-primary-300 hover:text-brand-400 rounded-xl transition-all cursor-pointer shadow-sm"
                        title="Edit Profile"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(dev.developer_id, dev.name)}
                        className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-primary-300 hover:text-red-400 rounded-xl transition-all cursor-pointer shadow-sm"
                        title="Delete Profile"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center p-12 text-primary-400 font-semibold italic bg-transparent">
              🔍 No developers found matching search or filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DevManagement;
