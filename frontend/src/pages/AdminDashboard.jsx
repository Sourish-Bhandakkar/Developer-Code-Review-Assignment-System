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
  FileCode
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 shadow-sm">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-primary-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-primary-900">Admin Overview</h2>
          <p className="text-xs text-primary-400 font-semibold mt-1">Automatic review routing system summary & workload analytics</p>
        </div>
        <Link 
          to="/reviews/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
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

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-primary-200/80 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-primary-850">Workload Distribution</h3>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Active reviews vs capacity cap per developer</p>
          </div>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'semibold' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'semibold' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="Workload" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={24} name="Active Reviews" />
                  <Bar dataKey="Max" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={8} name="Workload Cap" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-primary-400 font-semibold italic">No workload records found.</div>
            )}
          </div>
        </div>

        {/* Language Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-primary-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-primary-850">Technologies Overview</h3>
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
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 'bold', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-primary-400 font-semibold italic">No language data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="bg-white rounded-2xl border border-primary-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-primary-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white">
          <div>
            <h3 className="text-sm font-extrabold text-primary-850">Recent Pull Request Reviews</h3>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Latest review routes handled by assignment engine</p>
          </div>
          <Link to="/reviews" className="text-xs font-bold text-brand-600 hover:text-brand-850 hover:underline inline-flex items-center gap-1">
            <span>View All Reviews</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentReviews.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-primary-200/60 bg-primary-50/50 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                  <th className="px-6 py-4">Pull Request / Repository</th>
                  <th className="px-6 py-4">Technologies</th>
                  <th className="px-6 py-4">Reviewer</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4 text-center">Match Score</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {recentReviews.map((rev) => {
                  const statusColors = {
                    Pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
                    Assigned: 'bg-blue-50 text-blue-700 border-blue-200/60',
                    'In Progress': 'bg-purple-50 text-purple-705 border-purple-200/60',
                    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                  };

                  return (
                    <tr key={rev.id} className="hover:bg-primary-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/reviews/${rev.id}`} className="font-bold text-primary-850 hover:text-brand-600 hover:underline block text-sm transition-colors">
                          {rev.title}
                        </Link>
                        <span className="text-[10px] text-primary-400 font-semibold block mt-0.5">
                          {rev.repository_name} &bull; {rev.pull_request_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {rev.technologies.slice(0, 3).map((tech, idx) => (
                            <span key={idx} className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md text-[9px] font-bold border border-primary-200/50">
                              {tech}
                            </span>
                          ))}
                          {rev.technologies.length > 3 && (
                            <span className="text-[9px] text-primary-400 font-bold px-1.5 py-0.5 bg-primary-50 border border-primary-200/30 rounded-md">
                              +{rev.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {rev.assigned_developer_name ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-brand-50 text-brand-600 border border-brand-200/55 font-bold flex items-center justify-center text-[10px]">
                              {rev.assigned_developer_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-primary-750">{rev.assigned_developer_name}</span>
                          </div>
                        ) : (
                          <span className="text-red-500 font-bold italic bg-red-50 border border-red-100 rounded px-2 py-0.5">Unassigned</span>
                        )}
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
                      <td className="px-6 py-4 font-bold font-mono text-brand-600 text-center text-sm">
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
            <div className="text-center p-12 text-primary-400 font-semibold italic bg-white">No reviews created yet. Let's submit a pull request!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
