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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
        <span>{error}</span>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-primary-800">Admin Dashboard</h2>
          <p className="text-xs text-primary-400 font-medium">Automatic review routing system summary</p>
        </div>
        <Link 
          to="/reviews/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
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
        <div className="bg-white p-6 rounded-xl border border-primary-200 shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-primary-800 mb-4">Workload Distribution</h3>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="Workload" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} name="Active Reviews" />
                  <Bar dataKey="Max" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={12} name="Workload Cap" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-primary-400">No workload records found.</div>
            )}
          </div>
        </div>

        {/* Language Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-primary-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-primary-800 mb-4">Technologies Overview</h3>
          <div className="h-56 flex-1 relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-primary-400">No language data.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div className="bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-primary-200 flex justify-between items-center bg-primary-50/50">
          <div>
            <h3 className="text-base font-bold text-primary-800">Recent Pull Request Reviews</h3>
            <p className="text-xs text-primary-400">Latest review routes handled by the engine</p>
          </div>
          <Link to="/reviews" className="text-xs font-bold text-brand-600 hover:text-brand-800">
            View All Reviews &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentReviews.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-primary-250 bg-primary-50 text-primary-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Pull Request / Repository</th>
                  <th className="px-6 py-3">Technologies</th>
                  <th className="px-6 py-3">Reviewer</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Routing Score</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-150">
                {recentReviews.map((rev) => {
                  const statusColors = {
                    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
                    Assigned: 'bg-blue-100 text-blue-800 border-blue-200',
                    'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
                    Completed: 'bg-green-100 text-green-800 border-green-200',
                  };

                  return (
                    <tr key={rev.id} className="hover:bg-primary-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-primary-800">
                        <Link to={`/reviews/${rev.id}`} className="hover:underline font-bold text-primary-900 block text-sm">
                          {rev.title}
                        </Link>
                        <span className="text-[10px] text-primary-400 font-normal">
                          {rev.repository_name} &bull; {rev.pull_request_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {rev.technologies.slice(0, 3).map((tech, idx) => (
                            <span key={idx} className="bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-primary-200">
                              {tech}
                            </span>
                          ))}
                          {rev.technologies.length > 3 && (
                            <span className="text-[9px] text-primary-400 font-bold px-1.5 py-0.5 bg-primary-50 border border-primary-100 rounded">
                              +{rev.technologies.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary-700">
                        {rev.assigned_developer_name ? (
                          rev.assigned_developer_name
                        ) : (
                          <span className="text-red-500 font-bold italic">Unassigned</span>
                        )}
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
                      <td className="px-6 py-4 font-bold font-mono text-brand-600 text-sm">
                        {rev.assignment_score ? `${rev.assignment_score}%` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 font-bold rounded-full border ${statusColors[rev.status] || 'bg-slate-100 text-slate-800'}`}>
                          {rev.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-8 text-xs text-primary-400 font-semibold">No reviews created yet. Let's submit a pull request!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
