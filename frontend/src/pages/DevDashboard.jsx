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
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold">No Developer Profile Configured</h4>
          <p className="text-xs mt-1 font-medium leading-relaxed">
            Your user account is not linked to a developer profile. Please contact your Team Lead or Admin to associate your account.
          </p>
        </div>
      </div>
    );
  }

  const activeReviews = myReviews.filter(r => r.status === 'Assigned' || r.status === 'In Progress');
  const completedReviews = myReviews.filter(r => r.status === 'Completed');

  const availabilities = [
    { label: 'Available', color: 'bg-green-500 hover:bg-green-600 text-white border-green-600' },
    { label: 'Busy', color: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600' },
    { label: 'Unavailable', color: 'bg-red-500 hover:bg-red-600 text-white border-red-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Dev Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-primary-800">My Dashboard</h2>
          <p className="text-xs text-primary-400 font-medium">Workload tracking & review management</p>
        </div>
        
        {/* Availability Settings Box */}
        <div className="bg-white px-4 py-3 rounded-xl border border-primary-200 shadow-sm flex items-center gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-primary-400">Availability State</span>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                developerProfile.availability === 'Available' ? 'bg-green-500' :
                developerProfile.availability === 'Busy' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className="text-xs font-bold text-primary-700">{developerProfile.availability}</span>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            {availabilities.map((avail) => (
              <button
                key={avail.label}
                disabled={availabilityChanging}
                onClick={() => handleAvailabilityChange(avail.label)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border cursor-pointer ${
                  developerProfile.availability === avail.label 
                    ? avail.color 
                    : 'bg-primary-50 hover:bg-primary-100 text-primary-600 border-primary-200'
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
      <div className="bg-white p-6 rounded-xl border border-primary-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wider">My Technical Skill Grid</h3>
        <div className="flex flex-wrap gap-2">
          {developerProfile.expertises && developerProfile.expertises.length > 0 ? (
            developerProfile.expertises.map((exp, idx) => (
              <span 
                key={idx} 
                className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg border border-primary-200 text-xs font-bold flex items-center gap-1.5"
              >
                <span>{exp.name}</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.25 rounded-md ${
                  exp.skill_level === 3 ? 'bg-red-100 text-red-700' :
                  exp.skill_level === 2 ? 'bg-brand-100 text-brand-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  Lvl {exp.skill_level}
                </span>
              </span>
            ))
          ) : (
            <p className="text-xs text-primary-400 font-semibold italic">No expertise added yet. Edit profile configuration to add your skills.</p>
          )}
        </div>
      </div>

      {/* Active Reviews Table */}
      <div className="bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-200 bg-primary-50/50">
          <h3 className="text-base font-bold text-primary-800">My Assigned Code Reviews</h3>
          <p className="text-xs text-primary-400">Reviews currently requiring your inspection</p>
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
                  <tr className="border-b border-primary-250 bg-primary-50 text-primary-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Repository & Pull Request</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Complexity</th>
                    <th className="px-6 py-3">Deadline</th>
                    <th className="px-6 py-3">Routing Score</th>
                    <th className="px-6 py-3">Current Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-150">
                  {activeReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-primary-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary-800">
                        <Link to={`/reviews/${rev.id}`} className="hover:underline font-bold text-primary-900 block text-sm">
                          {rev.title}
                        </Link>
                        <span className="text-[10px] text-primary-400 font-normal">
                          {rev.repository_name} &bull; {rev.pull_request_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 font-bold rounded-full text-[10px] border ${
                          rev.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                          rev.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          rev.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {rev.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-primary-700">{rev.complexity}</td>
                      <td className="px-6 py-4 font-medium text-primary-600">
                        {new Date(rev.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-brand-600 text-sm">
                        {rev.assignment_score}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 font-bold rounded-full border ${
                          rev.status === 'In Progress' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {rev.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {rev.status === 'Assigned' && (
                            <button
                              onClick={() => handleStatusUpdate(rev.id, 'In Progress')}
                              className="px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="h-3 w-3 stroke-[3]" />
                              <span>Start Review</span>
                            </button>
                          )}
                          {rev.status === 'In Progress' && (
                            <button
                              onClick={() => handleStatusUpdate(rev.id, 'Completed')}
                              className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3 w-3 stroke-[3]" />
                              <span>Complete</span>
                            </button>
                          )}
                          <Link
                            to={`/reviews/${rev.id}`}
                            className="px-2.5 py-1.5 bg-primary-100 hover:bg-primary-200 border border-primary-200 text-primary-700 font-bold rounded-lg transition-colors inline-block text-center cursor-pointer"
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
              <div className="text-center py-12 text-primary-400 font-semibold bg-white">
                🎉 No active reviews assigned to you. Enjoy your code-free queue!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevDashboard;
