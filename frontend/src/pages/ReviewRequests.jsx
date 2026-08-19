import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import { 
  GitPullRequest, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  PlusCircle,
  Filter
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
      setError('Could not fetch reviews.');
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
                          (rev.assigned_developer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesStatus = statusFilter === '' ? true : rev.status === statusFilter;
    const matchesPriority = priorityFilter === '' ? true : rev.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-primary-800">Code Review Requests</h2>
          <p className="text-xs text-primary-400 font-medium">Automatic review routing entries and status tracking</p>
        </div>
        <Link 
          to="/reviews/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Review Request</span>
        </Link>
      </div>

      {/* Filters and search card */}
      <div className="bg-white p-4 rounded-xl border border-primary-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-primary-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reviews by repository, pull request ID, title, or assignee..."
            className="w-full pl-9 pr-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-primary-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-850 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending (Unassigned)</option>
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
              className="w-full sm:w-40 px-3 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-850 cursor-pointer"
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

      {/* List content */}
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
            {filteredReviews.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-primary-250 bg-primary-50 text-primary-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Title / Pull Request</th>
                    <th className="px-6 py-4">Repository</th>
                    <th className="px-6 py-4">Required Technologies</th>
                    <th className="px-6 py-4">Reviewer</th>
                    <th className="px-6 py-4">Priority / Complexity</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 font-mono">Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-150">
                  {filteredReviews.map(rev => {
                    const statusColors = {
                      Pending: 'bg-amber-100 text-amber-800 border-amber-200',
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
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {rev.technologies.map((tech, idx) => (
                              <span key={idx} className="bg-primary-100 text-primary-750 px-1.5 py-0.5 rounded text-[9px] font-bold border border-primary-200">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary-750">
                          {rev.assigned_developer_name ? (
                            <span>{rev.assigned_developer_name}</span>
                          ) : (
                            <span className="text-red-500 font-bold italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border inline-block ${
                            rev.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                            rev.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            rev.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {rev.priority}
                          </span>
                          <span className="text-[9px] text-primary-400 block font-semibold">
                            Complexity: {rev.complexity}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-primary-600">
                          {new Date(rev.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-brand-600 text-sm">
                          {rev.assignment_score ? `${rev.assignment_score}%` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 font-bold rounded-full border ${statusColors[rev.status] || 'bg-slate-100 text-slate-800'}`}>
                            {rev.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            to={`/reviews/${rev.id}`}
                            className="text-xs font-bold text-brand-600 hover:text-brand-800 hover:underline cursor-pointer"
                          >
                            Details &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-primary-400 font-semibold bg-white">
                🔍 No review requests found matching filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewRequests;
