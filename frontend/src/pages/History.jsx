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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-primary-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-primary-900">Assignment History Log</h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Audit logs of all system routing actions and manual overrides</p>
        </div>
      </div>

      {/* Filters Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-primary-200/80 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-primary-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by developer, repository, pull request title, or ID..."
            className="w-full pl-10 pr-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-primary-400 flex-shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-44 px-3.5 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-850 transition-all font-bold cursor-pointer"
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
              className="w-full sm:w-40 px-3.5 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-850 transition-all font-bold cursor-pointer"
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
            {filteredHistory.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-primary-200/60 bg-primary-50/50 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Action Event</th>
                    <th className="px-6 py-4">Developer Assigned</th>
                    <th className="px-6 py-4">Review Title / Pull Request</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4">Review Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {filteredHistory.map(item => {
                    const actionStyles = {
                      Assign: 'bg-blue-50 text-blue-700 border-blue-200/60',
                      Reassign: 'bg-purple-50 text-purple-705 border-purple-200/60',
                      'In Progress': 'bg-orange-50 text-orange-700 border-orange-200/60',
                      Complete: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                    };

                    return (
                      <tr key={item.id} className="hover:bg-primary-50/30 transition-colors">
                        <td className="px-6 py-4 text-primary-500 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary-400" />
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
                        <td className="px-6 py-4 font-bold text-primary-750">{item.developer_name}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-primary-850 text-sm leading-snug">{item.title}</div>
                          <span className="text-primary-400 text-[10px] font-semibold block mt-0.5">
                            {item.repository_name} &bull; <span className="font-mono">{item.pull_request_id}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-brand-650 text-center text-sm">
                          {item.score > 0 ? `${item.score}%` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border inline-block uppercase tracking-wider ${
                            item.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                            item.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            item.priority === 'Medium' ? 'bg-yellow-55 text-yellow-750 border-yellow-250' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
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
              <div className="text-center p-12 text-primary-400 font-semibold italic bg-white">
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
