import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  Cpu,
  Workflow
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
  const { user } = useAuth();
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

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderWorkloadDots = (current, max) => {
    const dots = [];
    for (let i = 0; i < max; i++) {
      if (i < current) {
        dots.push(<span key={i} className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_8px_#0ea5e9] inline-block flex-shrink-0"></span>);
      } else {
        dots.push(<span key={i} className="h-2 w-2 rounded-full bg-white/10 inline-block border border-white/5 flex-shrink-0"></span>);
      }
    }
    return <div className="flex gap-1 items-center">{dots}</div>;
  };

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

  const totalLanguages = stats?.languageDistribution?.length || 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header Greeting */}
      <div className="bg-surface-350/30 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Here's what's happening across your code review routing system</p>
        </div>
        <Link 
          to="/reviews/new"
          className="btn-primary py-2.5 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>New Review Request</span>
        </Link>
      </div>

      {/* Hero Algorithmic Routing Pipeline Flow */}
      <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Background glow highlights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="space-y-1 pb-4 flex items-center gap-2">
          <Workflow className="h-4 w-4 text-brand-400" />
          <h3 className="text-sm font-extrabold text-white">Intelligent Routing Pipeline</h3>
        </div>

        {/* Visual node flowchart */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center text-xs relative z-10 py-1">
          <div className="bg-darkbg border border-white/5 p-4 rounded-xl text-center space-y-1 hover:border-brand-500/20 transition-all duration-300">
            <span className="text-[9px] uppercase font-black text-primary-450">Step 1</span>
            <div className="font-extrabold text-white">Review Request</div>
            <p className="text-[9px] text-primary-400 font-semibold mt-1">PR filed with technology requirements</p>
          </div>

          <div className="hidden md:flex justify-center text-brand-400 font-extrabold animate-pulse text-lg">&rarr;</div>

          <div className="bg-darkbg border border-brand-500/20 p-4 rounded-xl text-center space-y-1 relative shadow-[0_0_15px_rgba(14,165,233,0.05)]">
            <span className="text-[9px] uppercase font-black text-brand-400">Step 2</span>
            <div className="font-extrabold text-brand-400">Matching Engine</div>
            <p className="text-[9px] text-primary-400 font-semibold mt-1">Evaluates skills, workloads, experience</p>
          </div>

          <div className="hidden md:flex justify-center text-brand-400 font-extrabold animate-pulse text-lg">&rarr;</div>

          <div className="bg-darkbg border border-white/5 p-4 rounded-xl text-center space-y-1 hover:border-brand-500/20 transition-all duration-300">
            <span className="text-[9px] uppercase font-black text-primary-450">Step 3</span>
            <div className="font-extrabold text-white">Developer Pool</div>
            <p className="text-[9px] text-primary-400 font-semibold mt-1">Scoring all candidates mathematically</p>
          </div>

          <div className="hidden md:flex justify-center text-brand-400 font-extrabold animate-pulse text-lg">&rarr;</div>

          <div className="bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl text-center space-y-1 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
            <span className="text-[9px] uppercase font-black text-emerald-400">Step 4</span>
            <div className="font-extrabold text-emerald-400">Optimal Match</div>
            <p className="text-[9px] text-emerald-450 font-semibold mt-1">PR automatically routed to top scorer</p>
          </div>
        </div>
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

      {/* Visual Analytics Charts Row 1: Workload capacity + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Bar Chart */}
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-extrabold text-white">Workload Capacity Observability</h3>
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

        {/* Developer Capacity Checklist Panel */}
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Developer Capacity Index</h3>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Active load tracks and remaining slots</p>
          </div>
          
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            {stats?.workloadDistribution.slice(0, 5).map((dev, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <div>
                  <span className="font-bold text-white block">{dev.name}</span>
                  <span className="text-[9px] text-primary-400 block font-semibold">Active: {dev.current_workload} / {dev.max_workload}</span>
                </div>
                <div>
                  {renderWorkloadDots(dev.current_workload, dev.max_workload)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Row 2: Tech Donut Chart + System Observability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Language Pie/Donut Chart */}
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Technology Intelligence</h3>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Active language volume breakdown</p>
          </div>
          <div className="h-56 flex-1 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <>
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
                
                {/* Donut Center Label */}
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-2xl font-black text-white block leading-none">{totalLanguages}</span>
                  <span className="text-[9px] uppercase font-black tracking-widest text-primary-450 mt-1 block">Languages</span>
                </div>
              </>
            ) : (
              <div className="text-xs text-primary-400 font-semibold italic">No language data available.</div>
            )}
          </div>
        </div>

        {/* System Observability Health Card (col-span-2) */}
        <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-extrabold text-white">System Operations Status</h3>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Observability monitoring & live environment signals</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 items-center">
            <div className="bg-darkbg/50 border border-white/5 p-4 rounded-xl text-center space-y-1.5 shadow-inner">
              <Server className="h-4.5 w-4.5 text-brand-400 mx-auto" />
              <span className="text-[9px] text-primary-400 uppercase tracking-widest block font-bold">API Status</span>
              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">Operational</span>
            </div>

            <div className="bg-darkbg/50 border border-white/5 p-4 rounded-xl text-center space-y-1.5 shadow-inner">
              <TrendingUp className="h-4.5 w-4.5 text-brand-400 mx-auto" />
              <span className="text-[9px] text-primary-400 uppercase tracking-widest block font-bold">SQLite DB</span>
              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">Connected</span>
            </div>

            <div className="bg-darkbg/50 border border-white/5 p-4 rounded-xl text-center space-y-1.5 shadow-inner">
              <Cpu className="h-4.5 w-4.5 text-brand-400 mx-auto" />
              <span className="text-[9px] text-primary-400 uppercase tracking-widest block font-bold">Router</span>
              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">Operational</span>
            </div>

            <div className="bg-darkbg/50 border border-white/5 p-4 rounded-xl text-center space-y-1.5 shadow-inner">
              <Activity className="h-4.5 w-4.5 text-brand-400 mx-auto" />
              <span className="text-[9px] text-primary-400 uppercase tracking-widest block font-bold">Environment</span>
              <span className="text-[9px] font-black uppercase text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1">Production</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
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
  );
};

export default AdminDashboard;
