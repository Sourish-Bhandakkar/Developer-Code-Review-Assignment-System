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
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl flex items-center gap-3">
        <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
        <span>No developer profile linked to user account.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-primary-800">My Assigned Code Reviews</h2>
        <p className="text-xs text-primary-400 font-medium">History and action queue for pull request audits assigned to you</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {reviews.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-primary-250 bg-primary-50 text-primary-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Title / Pull Request</th>
                    <th className="px-6 py-4">Repository</th>
                    <th className="px-6 py-4">Priority / Complexity</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 font-mono">Routing Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-150">
                  {reviews.map(rev => {
                    const statusColors = {
                      Assigned: 'bg-blue-100 text-blue-800 border-blue-200',
                      'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
                      Completed: 'bg-green-100 text-green-800 border-green-200',
                    };

                    return (
                      <tr key={rev.id} className="hover:bg-primary-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-primary-800">
                          <Link to={`/reviews/${rev.id}`} className="hover:underline font-bold text-primary-900 block text-sm">
                            {rev.title}
                          </Link>
                          <span className="text-[10px] text-primary-400 font-normal">{rev.pull_request_id}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary-650">{rev.repository_name}</td>
                        <td className="px-6 py-4 space-y-1">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border inline-block ${
                            rev.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                            rev.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            rev.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {rev.priority}
                          </span>
                          <span className="text-[9px] text-primary-400 block font-semibold">Complexity: {rev.complexity}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-primary-600">
                          {new Date(rev.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-brand-650 text-sm">
                          {rev.assignment_score}%
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold border ${statusColors[rev.status] || 'bg-slate-100 text-slate-800'}`}>
                            {rev.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {rev.status === 'Assigned' && (
                              <button
                                onClick={() => handleStatusChange(rev.id, 'In Progress')}
                                className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="h-3 w-3 stroke-[3]" />
                                <span>Start</span>
                              </button>
                            )}
                            {rev.status === 'In Progress' && (
                              <button
                                onClick={() => handleStatusChange(rev.id, 'Completed')}
                                className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3 w-3 stroke-[3]" />
                                <span>Complete</span>
                              </button>
                            )}
                            <Link 
                              to={`/reviews/${rev.id}`}
                              className="px-2.5 py-1.5 bg-primary-100 hover:bg-primary-200 border border-primary-200 text-primary-755 font-bold rounded-lg transition-colors inline-block text-center cursor-pointer"
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
              <div className="text-center p-12 text-primary-400 font-semibold bg-white">
                🔍 No assigned reviews found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;
