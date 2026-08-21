import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { 
  GitPullRequest, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  Clock, 
  ShieldAlert,
  Terminal,
  Activity,
  UserCheck
} from 'lucide-react';

const ReviewDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [review, setReview] = useState(null);
  const [eligibleDevs, setEligibleDevs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchReviewDetail = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getById(id);
      setReview(data);

      if (user?.role === 'Admin') {
        const eligible = await reviewService.getEligibleDevelopers(id);
        // sort eligible reviewers by score desc
        eligible.sort((a, b) => b.finalScore - a.finalScore);
        setEligibleDevs(eligible);
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch code review detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewDetail();
  }, [id, user]);

  const handleAutoRoute = async () => {
    setAssigning(true);
    setError('');
    try {
      await reviewService.autoAssign(id);
      await fetchReviewDetail();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Auto-routing engine failed to find a matching candidate.');
    } finally {
      setAssigning(false);
    }
  };

  const handleManualReassign = async (devId) => {
    if (!window.confirm("Are you sure you want to force this manual reviewer assignment?")) {
      return;
    }
    setAssigning(true);
    setError('');
    try {
      await reviewService.manualReassign(id, devId);
      await fetchReviewDetail();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Manual assignment override failed.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 max-w-xl mx-auto mt-8">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <span className="font-semibold text-xs">{error}</span>
      </div>
    );
  }

  const priorityStyles = {
    Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const statusStyles = {
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Assigned: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex items-center gap-4 bg-surface-200/90 border border-glass backdrop-blur-md p-5 rounded-2xl shadow-lg">
        <Link 
          to={isAdmin ? "/reviews" : "/my-reviews"}
          className="p-2 hover:bg-white/5 border border-white/10 text-primary-300 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[9px] text-brand-400 font-extrabold uppercase tracking-widest block">Review Request ID: {review.pull_request_id}</span>
          <h2 className="text-lg font-extrabold text-white mt-0.5">{review.title}</h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-4 rounded-xl flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Detail elements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-extrabold text-white">Repository Details</h3>
              <span className={`px-2.5 py-0.5 font-bold rounded-full border text-[9px] uppercase tracking-wider ${priorityStyles[review.priority]}`}>
                {review.priority} Priority
              </span>
            </div>

            {/* Meta statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/2 border border-white/5 p-3 rounded-xl">
                <span className="text-[9px] text-primary-400 uppercase tracking-wider block font-bold">Review Status</span>
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider mt-1.5 inline-block ${statusStyles[review.status]}`}>
                  {review.status}
                </span>
              </div>
              
              <div className="bg-white/2 border border-white/5 p-3 rounded-xl">
                <span className="text-[9px] text-primary-400 uppercase tracking-wider block font-bold">Complexity</span>
                <span className="text-xs font-bold text-white block mt-1.5">{review.complexity}</span>
              </div>

              <div className="bg-white/2 border border-white/5 p-3 rounded-xl">
                <span className="text-[9px] text-primary-400 uppercase tracking-wider block font-bold">Deadline</span>
                <span className="text-xs font-bold text-white block mt-1.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary-400" />
                  {new Date(review.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
              </div>

              <div className="bg-white/2 border border-white/5 p-3 rounded-xl">
                <span className="text-[9px] text-primary-400 uppercase tracking-wider block font-bold">Routing Match</span>
                <span className="text-xs font-bold text-brand-400 block mt-1.5 font-mono">
                  {review.assignment_score ? `${review.assignment_score}%` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Monospace Code Editor description block */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-primary-350 uppercase tracking-wider block">Repository Description & Scope</span>
              <div className="bg-surface-300 border border-glass rounded-xl overflow-hidden shadow-inner">
                <div className="bg-[#050B1A] px-4 py-2 border-b border-glass flex items-center justify-between text-[10px] text-primary-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-brand-400" />
                    {review.repository_name}
                  </span>
                  <span>Markdown</span>
                </div>
                <div className="p-4 font-mono text-xs text-primary-200 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto bg-[#081226]/50">
                  {review.description}
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-extrabold text-primary-350 uppercase tracking-wider block">Required Technology Expertise Tags</span>
              <div className="flex flex-wrap gap-2">
                {review.technologies.map((tech, idx) => (
                  <span key={idx} className="bg-white/5 text-primary-200 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-bold shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Manual Reassignment Section (Admin Only) */}
          {isAdmin && (
            <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white">Manual Assignment Override</h3>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Admin capabilities to bypass automatic matching score allocation</p>
              </div>

              {error && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-550 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-start">
                <button
                  onClick={handleAutoRoute}
                  disabled={assigning}
                  className="btn-primary py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Activity className="h-4 w-4" />
                  <span>Run Auto-Routing Engine</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-white/5 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2 text-primary-400 font-extrabold uppercase tracking-widest text-[9px]">
                      <th className="px-4 py-3">Eligible Developer</th>
                      <th className="px-4 py-3">Workload</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Score</th>
                      <th className="px-4 py-3 text-right">Override Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {eligibleDevs.map(candidate => (
                      <tr key={candidate.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">{candidate.name}</td>
                        <td className="px-4 py-3 font-semibold text-primary-300">
                          {candidate.workload} / {candidate.max_workload} Active
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold border text-[9px] uppercase tracking-wider ${
                            candidate.availability === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {candidate.availability}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold font-mono text-brand-400 text-center text-sm">
                          {candidate.finalScore}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleManualReassign(candidate.id)}
                            disabled={assigning}
                            className="px-2.5 py-1 bg-white/5 hover:bg-brand-500/15 hover:text-brand-400 border border-white/10 hover:border-brand-500/30 text-primary-200 font-bold rounded-xl transition-all cursor-pointer text-[10px]"
                          >
                            Assign Override
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Columns - Details indicators */}
        <div className="space-y-6">
          
          {/* Active Reviewer card */}
          <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold text-white">Assigned Reviewer</h3>
            
            {review.assigned_developer_name ? (
              <div className="flex items-center gap-3.5 bg-white/2 border border-white/5 p-4 rounded-xl">
                <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold text-lg shadow-sm">
                  {review.assigned_developer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm leading-snug">{review.assigned_developer_name}</h4>
                  <span className="text-[9px] text-brand-400 font-bold uppercase tracking-wider block mt-0.5">Primary Code Auditor</span>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <span className="font-bold block uppercase tracking-wider text-[9px]">Unallocated Pipeline</span>
                  <p className="text-[11px] mt-1 text-primary-300 font-medium leading-relaxed">
                    This pull request currently has no assigned reviewer. If you are an Admin, trigger auto-routing above or assign manually.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Suitability score breakdown */}
          {review.assignment_score_details && (
            <ScoreBreakdown scoreDetails={review.assignment_score_details} />
          )}

          {/* Vertical Audit timeline */}
          <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-white">Assignment Activity Timeline</h3>
              <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Audit log trace for code review routing events</p>
            </div>

            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
              {review.history && review.history.length > 0 ? (
                review.history.map((log, index) => (
                  <div key={index} className="flex items-start gap-4 relative z-10">
                    <div className="h-6 w-6 rounded-full bg-surface-300 border border-glass flex items-center justify-center text-primary-300 flex-shrink-0 shadow-sm">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-primary-250 block">
                        {log.action === 'Assign' ? 'Auto-routing engine routed PR' :
                         log.action === 'Reassign' ? 'Manual override triggered' :
                         log.action === 'In Progress' ? 'Review started by developer' : 
                         'Review completed by developer'}
                      </span>
                      <p className="text-[10px] text-primary-400 font-medium leading-relaxed mt-0.5">
                        Handled by <strong className="text-primary-300 font-bold">{log.developer_name}</strong>
                      </p>
                      <span className="text-[9px] text-primary-500 font-bold block mt-1">
                        {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-primary-450 italic font-semibold pl-4">No routing history logged.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReviewDetail;
