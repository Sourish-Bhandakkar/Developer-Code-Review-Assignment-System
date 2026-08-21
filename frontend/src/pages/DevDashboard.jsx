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
      <div className="bg-amber-50 border border-amber-250/70 text-amber-800 p-6 rounded-2xl flex items-start gap-4 shadow-sm max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider">No Developer Profile Configured</h4>
          <p className="text-xs mt-1.5 font-medium leading-relaxed">
            Your user account is not linked to a developer profile. Please contact your Team Lead or Admin to associate your account.
          </p>
        </div>
      </div>
    );
  }

  const activeReviews = myReviews.filter(r => r.status === 'Assigned' || r.status === 'In Progress');
  const completedReviews = myReviews.filter(r => r.status === 'Completed');

  const availabilities = [
    { label: 'Available', color: 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600' },
    { label: 'Busy', color: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600' },
    { label: 'Unavailable', color: 'bg-red-500 hover:bg-red-600 text-white border-red-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Dev Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-primary-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-primary-900">Developer Dashboard</h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Workload tracking & review queue management</p>
        </div>
        
        {/* Availability Settings Box */}
        <div className="bg-primary-50/50 p-2.5 rounded-xl border border-primary-200/60 flex flex-wrap items-center gap-3.5 w-full lg:w-auto">
          <div className="space-y-0.5 px-1">
            <span className="text-[9px] uppercase font-black text-primary-400 tracking-wider">Availability state</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${
                developerProfile.availability === 'Available' ? 'bg-emerald-500 animate-pulse' :
                developerProfile.availability === 'Busy' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className="text-xs font-bold text-primary-750">{developerProfile.availability}</span>
            </div>
          </div>
          
          <div className="flex gap-1">
            {availabilities.map((avail) => (
              <button
                key={avail.label}
                disabled={availabilityChanging}
                onClick={() => handleAvailabilityChange(avail.label)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border cursor-pointer ${
                  developerProfile.availability === avail.label 
                    ? avail.color 
                    : 'bg-white hover:bg-primary-50 text-primary-600 border-primary-200 hover:border-primary-300'
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
      <div className="bg-white p-6 rounded-2xl border border-primary-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-primary-850">My Technical Skill Grid</h3>
          <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Primary domains mapped into automatic routing engine</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {developerProfile.expertises && developerProfile.expertises.length > 0 ? (
            developerProfile.expertises.map((exp, idx) => (
              <span 
                key={idx} 
                className="bg-primary-50/50 text-primary-750 px-3.5 py-1.5 rounded-xl border border-primary-200/50 text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <span>{exp.name}</span>
                <span className={`text-[9px] font-black px-2 py-0.25 rounded-md ${
                  exp.skill_level === 3 ? 'bg-red-100 text-red-700' :
                  exp.skill_level === 2 ? 'bg-brand-100 text-brand-700' :
                  'bg-slate-100 text-slate-700'
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
      <div className="bg-white rounded-2xl border border-primary-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-primary-200/80 bg-white">
          <h3 className="text-sm font-extrabold text-primary-850">My Assigned Code Reviews</h3>
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
                  <tr className="border-b border-primary-200/60 bg-primary-50/50 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-4">Repository & Pull Request</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Complexity</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 text-center">Match Score</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {activeReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-primary-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/reviews/${rev.id}`} className="font-bold text-primary-850 hover:text-brand-650 hover:underline block text-sm transition-colors">
                          {rev.title}
                        </Link>
                        <span className="text-[10px] text-primary-400 font-semibold block mt-0.5">
                          {rev.repository_name} &bull; {rev.pull_request_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 font-bold rounded-full text-[9px] border inline-block uppercase tracking-wider ${
                          rev.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                          rev.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          rev.priority === 'Medium' ? 'bg-yellow-55 text-yellow-750 border-yellow-250' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {rev.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary-700">{rev.complexity}</td>
                      <td className="px-6 py-4 font-semibold text-primary-500">
                        {new Date(rev.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-brand-600 text-center text-sm">
                        {rev.assignment_score}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.75 font-bold rounded-full border text-[9px] uppercase tracking-wider inline-block ${
                          rev.status === 'In Progress' ? 'bg-purple-50 text-purple-700 border-purple-200/60' :
                          'bg-blue-50 text-blue-700 border-blue-200/60'
                        }`}>
                          {rev.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {rev.status === 'Assigned' && (
                            <button
                              onClick={() => handleStatusUpdate(rev.id, 'In Progress')}
                              className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs"
                            >
                              <Play className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>Start Review</span>
                            </button>
                          )}
                          {rev.status === 'In Progress' && (
                            <button
                              onClick={() => handleStatusUpdate(rev.id, 'Completed')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-705 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>Complete</span>
                            </button>
                          )}
                          <Link
                            to={`/reviews/${rev.id}`}
                            className="px-3 py-1.5 bg-primary-100 hover:bg-primary-200 border border-primary-200 text-primary-700 font-bold rounded-xl transition-all inline-block text-center cursor-pointer text-xs"
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
              <div className="text-center py-16 text-primary-400 font-semibold bg-white flex flex-col items-center justify-center gap-2">
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
