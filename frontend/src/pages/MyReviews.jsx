import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/api';
import { GitPullRequest, Clock, CheckCircle2, AlertCircle, Play } from 'lucide-react';

const MyReviews = () => {
  const { developerProfile, checkAuth } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    if (!developerProfile) return;
    try {
      setLoading(true);
      const data = await reviewService.getAll({ developerId: developerProfile.developer_id });
      setReviews(data);
    } catch (err) {
      console.error(err);
      setError('Could not load assigned reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [developerProfile]);

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await reviewService.updateStatus(reviewId, newStatus);
      await Promise.all([
        fetchReviews(),
        checkAuth()
      ]);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update review status.');
    }
  };

  if (!developerProfile) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-6 rounded-2xl flex items-center gap-3 shadow-lg max-w-xl mx-auto mt-8">
        <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
        <span className="font-semibold text-xs">No developer profile linked to user account.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface-350/30 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-extrabold text-white">My Assigned Code Reviews</h2>
        <p className="text-xs text-primary-400 font-semibold mt-1">Review pipeline and history for pull requests assigned to you</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      ) : (
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            {reviews.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-glass bg-white/2 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-4">Title / Pull Request</th>
                    <th className="px-6 py-4">Repository</th>
                    <th className="px-6 py-4">Priority & Complexity</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reviews.map(rev => {
                    const statusColors = {
                      Assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      'In Progress': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                      Completed: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20',
                    };

                    return (
                      <tr key={rev.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <Link to={`/reviews/${rev.id}`} className="font-bold text-white hover:text-brand-400 hover:underline block text-sm transition-colors">
                            {rev.title}
                          </Link>
                          <span className="text-[10px] text-primary-400 font-semibold block mt-1">{rev.pull_request_id}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-brand-400">{rev.repository_name}</td>
                        <td className="px-6 py-4 space-y-1">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border inline-block uppercase tracking-wider ${
                            rev.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            rev.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            rev.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                          }`}>
                            {rev.priority}
                          </span>
                          <span className="text-[9px] text-primary-450 block font-bold uppercase tracking-wider">Complexity: {rev.complexity}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary-400">
                          {new Date(rev.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-brand-400 text-center text-sm">
                          {rev.assignment_score}%
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.75 rounded-full font-bold border text-[9px] uppercase tracking-wider inline-block ${statusColors[rev.status] || 'bg-slate-100 text-slate-800'}`}>
                            {rev.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {rev.status === 'Assigned' && (
                              <button
                                onClick={() => handleStatusChange(rev.id, 'In Progress')}
                                className="px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500 border border-brand-500/20 hover:border-brand-500 text-brand-400 hover:text-white font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs"
                              >
                                <Play className="h-3.5 w-3.5 stroke-[2.5]" />
                                <span>Start</span>
                              </button>
                            )}
                            {rev.status === 'In Progress' && (
                              <button
                                onClick={() => handleStatusChange(rev.id, 'Completed')}
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
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-primary-400 font-semibold bg-transparent flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">🎉</span>
                <span className="text-xs">No assigned reviews found.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;
