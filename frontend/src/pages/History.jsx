import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/api';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  AlertCircle,
  FileCode,
  Calendar
} from 'lucide-react';

const HistoryPage = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getHistory();
      setHistoryList(data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch assignment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.repository_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.pull_request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.developer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === '' ? true : item.action === actionFilter;
    const matchesPriority = priorityFilter === '' ? true : item.priority === priorityFilter;

    return matchesSearch && matchesAction && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-surface-350/30 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide">Assignment History Log</h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Audit logs of all system routing actions and manual overrides</p>
        </div>
      </div>

      {/* Filters Search Bar */}
      <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-primary-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by developer, repository, pull request title, or ID..."
            className="w-full pl-10 pr-4 py-3 bg-darkbg/85 border border-white/10 hover:border-white/15 focus:border-brand-500 focus:bg-darkbg text-xs rounded-xl focus:outline-none text-white transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-primary-400 flex-shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-44 px-3.5 py-3 bg-darkbg border border-white/10 text-primary-200 hover:text-white rounded-xl focus:border-brand-500 focus:bg-darkbg text-xs font-bold outline-none transition-all cursor-pointer"
            >
              <option value="">All Actions</option>
              <option value="Assign">Assign (Auto-Routed)</option>
              <option value="Reassign">Reassign (Manual Override)</option>
              <option value="In Progress">Start Review</option>
              <option value="Complete">Complete Review</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-primary-400 flex-shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-40 px-3.5 py-3 bg-darkbg border border-white/10 text-primary-200 hover:text-white rounded-xl focus:border-brand-500 focus:bg-darkbg text-xs font-bold outline-none transition-all cursor-pointer"
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

      {/* History table */}
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
            {filteredHistory.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-glass bg-white/2 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Action Event</th>
                    <th className="px-6 py-4">Developer Assigned</th>
                    <th className="px-6 py-4">Review Title / Pull Request</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4">Review Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHistory.map(item => {
                    const actionStyles = {
                      Assign: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      Reassign: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                      'In Progress': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                      Complete: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20',
                    };

                    return (
                      <tr key={item.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 text-primary-400 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary-405" />
                            {new Date(item.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.75 rounded-full font-bold text-[9px] border uppercase tracking-wider inline-block ${actionStyles[item.action] || 'bg-slate-100 text-slate-800'}`}>
                            {item.action === 'Assign' ? 'Auto Assigned' : 
                             item.action === 'Reassign' ? 'Manual Override' :
                             item.action === 'In Progress' ? 'Started Work' : 'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">{item.developer_name}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm leading-snug">{item.title}</div>
                          <span className="text-primary-400 text-[10px] font-semibold block mt-0.5">
                            {item.repository_name} &bull; <span className="font-mono">{item.pull_request_id}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-brand-400 text-center text-sm">
                          {item.score > 0 ? `${item.score}%` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border inline-block uppercase tracking-wider ${
                            item.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            item.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            item.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-12 text-primary-400 font-semibold italic bg-transparent">
                🔍 No history logs match selected filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
