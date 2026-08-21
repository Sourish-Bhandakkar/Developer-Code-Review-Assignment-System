import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewService, developerService } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  GitPullRequest, 
  CheckCircle, 
  Settings, 
  Clock, 
  AlertCircle,
  Code,
  CheckCircle2,
  Play
} from 'lucide-react';

const DevDashboard = () => {
  const { user, developerProfile, checkAuth, updateLocalAvailability } = useAuth();
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availabilityChanging, setAvailabilityChanging] = useState(false);

  const fetchMyReviews = async () => {
    if (!developerProfile) return;
    try {
      setLoading(true);
      const data = await reviewService.getAll({ developerId: developerProfile.developer_id });
      setMyReviews(data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch your code reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (developerProfile) {
      fetchMyReviews();
    }
  }, [developerProfile]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleAvailabilityChange = async (newAvailability) => {
    if (!developerProfile || availabilityChanging) return;
    setAvailabilityChanging(true);
    try {
      await developerService.updateAvailability(developerProfile.developer_id, newAvailability);
      updateLocalAvailability(newAvailability);
      await checkAuth(); // reload session values
    } catch (err) {
      console.error(err);
      alert('Failed to update availability.');
    } finally {
      setAvailabilityChanging(false);
    }
  };

  const handleStatusUpdate = async (reviewId, newStatus) => {
    try {
      await reviewService.updateStatus(reviewId, newStatus);
      // Reload reviews and profile stats (workload changes on complete)
      await Promise.all([
        fetchMyReviews(),
        checkAuth()
      ]);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update review status.');
    }
  };

  if (!developerProfile) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-6 rounded-2xl flex items-start gap-4 shadow-lg max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-6 w-6 text-amber-550 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider">No Developer Profile Configured</h4>
          <p className="text-xs mt-1.5 font-medium leading-relaxed text-primary-300">
            Your user account is not linked to a developer profile. Please contact your Team Lead or Admin to associate your account.
          </p>
        </div>
      </div>
    );
  }

  const activeReviews = myReviews.filter(r => r.status === 'Assigned' || r.status === 'In Progress');
  const completedReviews = myReviews.filter(r => r.status === 'Completed');

  const availabilities = [
    { label: 'Available', color: 'bg-emerald-650 hover:bg-emerald-500 text-white border-emerald-700' },
    { label: 'Busy', color: 'bg-yellow-650 hover:bg-yellow-500 text-white border-yellow-700' },
    { label: 'Unavailable', color: 'bg-red-650 hover:bg-red-500 text-white border-red-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Dev Header */}
      <div className="bg-surface-350/30 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Here's what's happening across your code review pipeline</p>
        </div>
        
        {/* Availability Settings Box */}
        <div className="bg-darkbg/80 p-2.5 rounded-xl border border-white/5 flex flex-wrap items-center gap-3.5 w-full lg:w-auto shadow-inner">
          <div className="space-y-0.5 px-1">
            <span className="text-[9px] uppercase font-black text-primary-400 tracking-wider">Availability state</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${
                developerProfile.availability === 'Available' ? 'bg-emerald-500 animate-pulse' :
                developerProfile.availability === 'Busy' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className="text-xs font-extrabold text-primary-200">{developerProfile.availability}</span>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            {availabilities.map((avail) => (
              <button
                key={avail.label}
                disabled={availabilityChanging}
                onClick={() => handleAvailabilityChange(avail.label)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border cursor-pointer ${
                  developerProfile.availability === avail.label 
                    ? avail.color 
                    : 'bg-surface-300 hover:bg-surface-200 text-primary-300 border-white/5'
                }`}
              >
                {avail.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Workload" 
          value={`${developerProfile.current_workload} / ${developerProfile.max_workload}`} 
          icon={GitPullRequest} 
          description="Assigned pull requests"
          color="brand"
        />
        <StatCard 
          title="Completed Reviews" 
          value={completedReviews.length} 
          icon={CheckCircle} 
          description="Lifetime reviews finalized"
          color="green"
        />
        <StatCard 
          title="Avg Matching Score" 
          value={myReviews.length > 0 ? `${Math.round(myReviews.reduce((sum, r) => sum + (r.assignment_score || 0), 0) / myReviews.length)}%` : '0%'} 
          icon={Clock} 
          description="Suitability rating for assigned code"
          color="purple"
        />
        <StatCard 
          title="Expertise Domains" 
          value={developerProfile.expertises?.length || 0} 
          icon={Code} 
          description="Configured domain skill sets"
          color="slate"
        />
      </div>

      {/* Profile Expertise Badge List */}
      <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-white">My Technical Skill Grid</h3>
          <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Primary domains mapped into automatic routing engine</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {developerProfile.expertises && developerProfile.expertises.length > 0 ? (
            developerProfile.expertises.map((exp, idx) => (
              <span 
                key={idx} 
                className="bg-white/5 text-primary-200 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-bold flex items-center gap-2.5 shadow-sm"
              >
                <span>{exp.name}</span>
                <span className={`text-[9px] font-black px-2 py-0.25 rounded-md ${
                  exp.skill_level === 3 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  exp.skill_level === 2 ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
                  'bg-white/10 text-primary-400 border border-white/10'
                }`}>
                  LVL {exp.skill_level}
                </span>
              </span>
            ))
          ) : (
            <p className="text-xs text-primary-400 font-semibold italic">No expertise domains configured. Go to Profile & Settings to add your tech stack skills.</p>
          )}
        </div>
      </div>

      {/* Active Reviews Table */}
      <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-glass bg-transparent">
          <h3 className="text-sm font-extrabold text-white">My Assigned Code Reviews</h3>
          <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Reviews currently requiring your inspection</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeReviews.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-glass bg-white/2 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-4">Repository & Pull Request</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Complexity</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 text-center">Match Score</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/reviews/${rev.id}`} className="font-bold text-white hover:text-brand-400 hover:underline block text-sm transition-colors">
                          {rev.title}
                        </Link>
                        <span className="text-[10px] text-primary-400 font-semibold block mt-1">
                          {rev.repository_name} &bull; <span className="font-mono">{rev.pull_request_id}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 font-bold rounded-full text-[9px] border inline-block uppercase tracking-wider ${
                          rev.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          rev.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          rev.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {rev.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary-250">{rev.complexity}</td>
                      <td className="px-6 py-4 font-semibold text-primary-400">
                        {new Date(rev.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-brand-400 text-center text-sm">
                        {rev.assignment_score}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.75 font-bold rounded-full border text-[9px] uppercase tracking-wider inline-block ${
                          rev.status === 'In Progress' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          'bg-blue-500/10 text-blue-450 border-blue-500/20'
                        }`}>
                          {rev.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {rev.status === 'Assigned' && (
                            <button
                              onClick={() => handleStatusUpdate(rev.id, 'In Progress')}
                              className="px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500 border border-brand-500/20 hover:border-brand-500 text-brand-400 hover:text-white font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs"
                            >
                              <Play className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>Start</span>
                            </button>
                          )}
                          {rev.status === 'In Progress' && (
                            <button
                              onClick={() => handleStatusUpdate(rev.id, 'Completed')}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>Complete</span>
                            </button>
                          )}
                          <Link
                            to={`/reviews/${rev.id}`}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-primary-200 hover:text-white font-bold rounded-xl transition-all inline-block text-center cursor-pointer text-xs"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-primary-400 font-semibold bg-transparent flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">🎉</span>
                <span className="text-xs">No active reviews assigned to you. Enjoy your code-free queue!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevDashboard;
