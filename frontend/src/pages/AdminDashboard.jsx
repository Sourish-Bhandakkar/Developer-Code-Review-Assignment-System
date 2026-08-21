import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  GitPullRequest, 
  PlusCircle, 
  AlertCircle,
  TrendingUp,
  Server,
  Activity,
  Cpu
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, reviewsData] = await Promise.all([
        reviewService.getStats(),
        reviewService.getAll()
      ]);
      setStats(statsData);
      setRecentReviews(reviewsData.slice(0, 5)); // show top 5 recent reviews
    } catch (err) {
      console.error(err);
      setError('Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-900/50 text-red-300 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <span className="font-semibold text-xs">{error}</span>
      </div>
    );
  }

  const chartData = stats?.workloadDistribution.map(dev => ({
    name: dev.name,
    Workload: dev.current_workload,
    Max: dev.max_workload
  })) || [];

  const pieData = stats?.languageDistribution.map(lang => ({
    name: lang.language,
    value: parseInt(lang.count)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="bg-surface-350/30 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide">Admin Workspace Overview</h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Automatic review routing system summary & workload analytics</p>
        </div>
        <Link 
          to="/reviews/new"
          className="btn-primary py-2.5 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>New Review Request</span>
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Developers" 
          value={stats?.developers.total_devs || 0} 
          icon={Users} 
          description={`${stats?.developers.available_devs || 0} currently available`}
          color="brand"
        />
        <StatCard 
          title="Pending Queue" 
          value={stats?.reviews.pending_reviews || 0} 
          icon={Clock} 
          description="Waiting for suitable reviewer"
          color="amber"
        />
        <StatCard 
          title="Active Reviews" 
          value={
            parseInt(stats?.reviews.assigned_reviews || 0) + 
            parseInt(stats?.reviews.in_progress_reviews || 0)
          } 
          icon={GitPullRequest} 
          description="Currently in progress"
          color="purple"
        />
        <StatCard 
          title="Avg Routing Score" 
          value={`${stats?.averageScore || 0}%`} 
          icon={TrendingUp} 
          description="Routing engine match quality"
          color="green"
        />
      </div>

      {/* Visual Analytics Charts Row 1: Workload + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Bar Chart */}
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-extrabold text-white">Workload Distribution</h3>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Active reviews vs capacity cap per developer</p>
          </div>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'semibold' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'semibold' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#081226', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.12)', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="Workload" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} name="Active Reviews" />
                  <Bar dataKey="Max" fill="rgba(148, 163, 184, 0.15)" radius={[4, 4, 0, 0]} barSize={6} name="Workload Cap" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-primary-400 font-semibold italic">No workload records found.</div>
            )}
          </div>
        </div>

        {/* System Operations Status telemetry panel */}
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">System Operations Status</h3>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Live platform telemetry & service health</p>
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
              <span className="text-primary-200 font-semibold flex items-center gap-2.5">
                <Server className="h-4 w-4 text-brand-400" />
                <span>REST API Server</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Online
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
              <span className="text-primary-200 font-semibold flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 text-brand-400" />
                <span>SQLite Database</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
              <span className="text-primary-200 font-semibold flex items-center gap-2.5">
                <Cpu className="h-4 w-4 text-brand-400" />
                <span>Routing Engine</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-primary-200 font-semibold flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-brand-400" />
                <span>Environment Mode</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
                Production
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Row 2: Tech Donut Chart + Recent Reviews Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Language Pie Chart */}
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Technology Overview</h3>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Active programming language volume</p>
          </div>
          <div className="h-56 flex-1 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#081226', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.12)', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 9, fontWeight: 'bold', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-primary-400 font-semibold italic">No language data available.</div>
            )}
          </div>
        </div>

        {/* Recent Reviews Table (col-span-2) */}
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl shadow-xl overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-glass flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-transparent">
            <div>
              <h3 className="text-sm font-extrabold text-white">Recent Pull Request Reviews</h3>
              <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Latest review routes handled by assignment engine</p>
            </div>
            <Link to="/reviews" className="text-xs font-bold text-brand-400 hover:text-brand-300 hover:underline inline-flex items-center gap-1.5 transition-colors">
              <span>View All Reviews</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentReviews.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-glass bg-white/2 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                    <th className="px-6 py-4">Pull Request / Repository</th>
                    <th className="px-6 py-4">Technologies</th>
                    <th className="px-6 py-4">Reviewer</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4 text-center">Match Score</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentReviews.map((rev) => {
                    const statusColors = {
                      Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      Assigned: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
                      'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
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
                            {rev.technologies.slice(0, 2).map((tech, idx) => (
                              <span key={idx} className="bg-white/5 text-primary-200 px-2 py-0.5 rounded-md text-[9px] font-bold border border-white/10 shadow-sm">
                                {tech}
                              </span>
                            ))}
                            {rev.technologies.length > 2 && (
                              <span className="text-[9px] text-primary-400 font-bold px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md">
                                +{rev.technologies.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {rev.assigned_developer_name ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold flex items-center justify-center text-[10px]">
                                {rev.assigned_developer_name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-primary-200">{rev.assigned_developer_name}</span>
                            </div>
                          ) : (
                            <span className="text-red-400 font-bold italic bg-red-500/10 border border-red-500/20 rounded px-2 py-0.5 uppercase tracking-wide text-[9px]">Unassigned</span>
                          )}
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
                        <td className="px-6 py-4 font-bold font-mono text-brand-400 text-center text-sm">
                          {rev.assignment_score ? `${rev.assignment_score}%` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.75 font-bold rounded-full border text-[9px] uppercase tracking-wider inline-block ${statusColors[rev.status] || 'bg-slate-100 text-slate-800'}`}>
                            {rev.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-12 text-primary-400 font-semibold italic bg-transparent">No reviews created yet. Let's submit a pull request!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
