import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import { 
  GitPullRequest, 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ReviewRequests = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAll();
      setReviews(data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch review requests queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = rev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rev.repository_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rev.pull_request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (rev.assigned_developer_name && rev.assigned_developer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '' ? true : rev.status === statusFilter;
    const matchesPriority = priorityFilter === '' ? true : rev.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-surface-350/30 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide">Review Requests Queue</h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Pending and allocated pull requests code-review tracks</p>
        </div>
        <Link 
          to="/reviews/new"
          className="btn-primary py-2.5 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>New Review Request</span>
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
            placeholder="Search reviews by repository, developer, pull request title or ID..."
            className="w-full pl-10 pr-4 py-3 bg-darkbg/85 border border-white/10 hover:border-white/15 focus:border-brand-500 focus:bg-darkbg text-xs rounded-xl focus:outline-none text-white transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-primary-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-3 bg-darkbg border border-white/10 text-primary-200 hover:text-white rounded-xl focus:border-brand-500 focus:bg-darkbg text-xs font-bold outline-none transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-primary-400 flex-shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-3 bg-darkbg border border-white/10 text-primary-200 hover:text-white rounded-xl focus:border-brand-500 focus:bg-darkbg text-xs font-bold outline-none transition-all cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
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
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            {filteredReviews.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-glass bg-white/2 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-4">Pull Request / Repository</th>
                    <th className="px-6 py-4">Technologies</th>
                    <th className="px-6 py-4">Assigned Developer</th>
                    <th className="px-6 py-4">Priority & Complexity</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredReviews.map((rev) => {
                    const statusColors = {
                      Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      Assigned: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
                      'In Progress': 'bg-blue-500/10 text-blue-450 border-blue-500/20',
                      Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    };

                    return (
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
                          <div className="flex flex-wrap gap-1">
                            {rev.technologies.slice(0, 3).map((tech, idx) => (
                              <span key={idx} className="bg-white/5 text-primary-200 px-2 py-0.5 rounded-md text-[9px] font-bold border border-white/10 shadow-sm">
                                {tech}
                              </span>
                            ))}
                            {rev.technologies.length > 3 && (
                              <span className="text-[9px] text-primary-400 font-bold px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md">
                                +{rev.technologies.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary-200">
                          {rev.assigned_developer_name ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold flex items-center justify-center text-[10px]">
                                {rev.assigned_developer_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold">{rev.assigned_developer_name}</span>
                            </div>
                          ) : (
                            <span className="text-red-400 font-bold italic bg-red-500/10 border border-red-500/20 rounded px-2 py-0.5 uppercase tracking-wide text-[9px]">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border inline-block uppercase tracking-wider ${
                            rev.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            rev.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            rev.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {rev.priority}
                          </span>
                          <span className="text-[9px] text-primary-450 block font-bold uppercase tracking-wider">Complexity: {rev.complexity}</span>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-brand-400 text-center text-sm">
                          {rev.assignment_score ? `${rev.assignment_score}%` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.75 rounded-full border text-[9px] font-bold uppercase tracking-wider inline-block ${statusColors[rev.status] || 'bg-slate-100 text-slate-800'}`}>
                            {rev.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/reviews/${rev.id}`}
                            className="btn-secondary px-3.5 py-2 rounded-xl text-xs inline-block text-center cursor-pointer shadow-sm"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-primary-400 font-semibold bg-transparent flex flex-col items-center justify-center gap-2">
                <GitPullRequest className="h-8 w-8 text-primary-500" />
                <span className="text-xs">No review requests found matching selected filters.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewRequests;
