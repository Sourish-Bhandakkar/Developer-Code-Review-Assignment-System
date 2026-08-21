import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewService, developerService } from '../services/api';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { 
  ArrowLeft, 
  GitPullRequest, 
  User, 
  Calendar, 
  CheckCircle2, 
  Play, 
  AlertCircle,
  HelpCircle,
  History,
  CheckCircle,
  ArrowRightLeft,
  Settings,
  AlertTriangle,
  FileCode,
  X
} from 'lucide-react';

const ReviewDetail = () => {
  const { id } = useParams(); // review_id
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkAuth, developerProfile } = useAuth();
  
  const [review, setReview] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reassignment state
  const [showReassignPanel, setShowReassignPanel] = useState(false);
  const [potentialReviewers, setPotentialReviewers] = useState({ eligible: [], excluded: [] });
  const [loadingPotential, setLoadingPotential] = useState(false);
  const [reassignError, setReassignError] = useState('');

  // Success message state (for just created redirection)
  const [showSuccessAlert, setShowSuccessAlert] = useState(
    location.state?.justCreated || false
  );

  const fetchReviewDetails = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getById(id);
      setReview(data.review);
      setAssignment(data.assignment);
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
      setError('Could not load review request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewDetails();
  }, [id]);

  const loadReassignOptions = async () => {
    try {
      setLoadingPotential(true);
      setReassignError('');
      const data = await reviewService.getEligible(id);
      setPotentialReviewers(data);
      setShowReassignPanel(true);
    } catch (err) {
      console.error(err);
      setReassignError('Could not load potential reviewers.');
    } finally {
      setLoadingPotential(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await reviewService.updateStatus(id, newStatus);
      // Refresh page data and refresh session workloads
      await Promise.all([
        fetchReviewDetails(),
        checkAuth()
      ]);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleManualReassign = async (dev) => {
    const isOverloaded = dev.current_workload >= dev.max_workload;
    
    if (isOverloaded) {
      const confirmOverride = window.confirm(
        `This developer has reached their maximum workload (${dev.current_workload}/${dev.max_workload} active reviews). Continue with manual override?`
      );
      if (!confirmOverride) return;
    }

    try {
      await reviewService.reassign(id, dev.id);
      setShowReassignPanel(false);
      // Refresh data
      await Promise.all([
        fetchReviewDetails(),
        checkAuth()
      ]);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to reassign reviewer.');
    }
  };

  const handleRetryAutoAssign = async () => {
    try {
      await reviewService.autoAssign(id);
      await Promise.all([
        fetchReviewDetails(),
        checkAuth()
      ]);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to auto-assign review request.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 shadow-sm">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
        <span className="font-semibold text-xs">{error || 'Review request not found.'}</span>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';
  const isAssignedDev = developerProfile && assignment && developerProfile.developer_id === assignment.developer_id;
  const isEligibleToUpdate = isAdmin || isAssignedDev;

  return (
    <div className="space-y-6">
      {/* Header and Back Button */}
      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-primary-200/80 shadow-sm">
        <Link 
          to={isAdmin ? "/reviews" : "/my-reviews"}
          className="p-2 hover:bg-primary-50 border border-primary-200 text-primary-600 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-lg font-extrabold text-primary-900">Review Request Details</h2>
          <p className="text-[11px] text-primary-400 font-semibold mt-0.5">Evaluate engine matching metrics and trace assignment status</p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {showSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-805 p-4 rounded-xl flex items-start justify-between shadow-sm">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider">Review Request Routed Successfully</h5>
              <p className="text-xs mt-1 font-semibold leading-relaxed">The system automatically calculated reviewer scores and assigned the request.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSuccessAlert(false)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-extrabold uppercase tracking-wide cursor-pointer focus:outline-none"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Review Metadata (2 cols span) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-primary-200/80 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-extrabold text-primary-400 uppercase tracking-widest block">Repository & PR ID</span>
                <h3 className="text-sm font-extrabold text-primary-850 mt-1">{review.repository_name} &bull; <span className="font-mono">{review.pull_request_id}</span></h3>
              </div>
              <span className={`px-2.5 py-0.75 font-bold rounded-full text-[9px] border uppercase tracking-wider ${
                review.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                review.status === 'Assigned' ? 'bg-blue-50 text-blue-700 border-blue-200/60' :
                review.status === 'In Progress' ? 'bg-purple-50 text-purple-700 border-purple-200/60' :
                'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              }`}>
                {review.status}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-extrabold text-primary-400 uppercase tracking-widest block">Title</span>
              <h1 className="text-xl font-bold text-primary-900 leading-tight">{review.title}</h1>
            </div>

            {review.description && (
              <div className="space-y-2.5">
                <span className="text-[9px] font-extrabold text-primary-400 uppercase tracking-widest block">Pull Request Description</span>
                <div className="bg-primary-950 rounded-xl p-5 border border-primary-850 font-mono text-[11px] text-primary-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {review.description}
                </div>
              </div>
            )}

            {/* Tags grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-primary-100 text-xs">
              <div>
                <span className="text-primary-400 block font-extrabold uppercase tracking-widest text-[9px] mb-1">Language</span>
                <span className="font-bold text-primary-800">{review.language}</span>
              </div>
              <div>
                <span className="text-primary-400 block font-extrabold uppercase tracking-widest text-[9px] mb-1">Priority</span>
                <span className={`px-2 py-0.5 rounded-lg font-bold text-[9px] border inline-block uppercase tracking-wider ${
                  review.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                  review.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  review.priority === 'Medium' ? 'bg-yellow-55 text-yellow-750 border-yellow-255' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>{review.priority}</span>
              </div>
              <div>
                <span className="text-primary-400 block font-extrabold uppercase tracking-widest text-[9px] mb-1">Complexity</span>
                <span className="font-bold text-primary-800">{review.complexity}</span>
              </div>
              <div>
                <span className="text-primary-400 block font-extrabold uppercase tracking-widest text-[9px] mb-1">Deadline</span>
                <span className="font-bold text-primary-800 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary-405" />
                  {new Date(review.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-primary-100 pt-5">
              <span className="text-primary-400 block font-extrabold uppercase tracking-widest text-[9px]">Technologies Required</span>
              <div className="flex flex-wrap gap-1.5">
                {review.technologies?.map((tech, idx) => (
                  <span key={idx} className="bg-primary-50 text-primary-600 border border-primary-200/50 rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Assignment History Log */}
          <div className="bg-white rounded-2xl border border-primary-200/80 p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-primary-850 flex items-center gap-2">
                <History className="h-4 w-4 text-primary-400" />
                <span>Assignment History Audit Log</span>
              </h3>
              <p className="text-[10px] text-primary-400 font-semibold mt-1">Audit log of system actions and overrides</p>
            </div>
            
            <div className="relative border-l border-primary-150 pl-5 ml-2.5 space-y-5">
              {history.length > 0 ? (
                history.map((hist, idx) => {
                  const logColors = {
                    Assign: 'bg-blue-500 ring-blue-100',
                    Reassign: 'bg-purple-500 ring-purple-100',
                    Complete: 'bg-emerald-500 ring-emerald-100',
                    'In Progress': 'bg-orange-500 ring-orange-100'
                  };
                  return (
                    <div key={hist.id} className="relative text-xs">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[27px] top-0.5 h-3 w-3 rounded-full border-2 border-white ring-4 ${logColors[hist.action] || 'bg-slate-500 ring-slate-100'}`}></span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-primary-800 block text-xs">
                          {hist.action === 'Assign' && `Assigned to ${hist.developer_name}`}
                          {hist.action === 'Reassign' && `Reassigned manually to ${hist.developer_name}`}
                          {hist.action === 'Complete' && `Marked Completed by ${hist.developer_name}`}
                          {hist.action === 'In Progress' && `Started work by ${hist.developer_name}`}
                        </span>
                        <div className="text-[10px] text-primary-400 font-semibold">
                          {new Date(hist.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {hist.score > 0 && ` &bull; Routing Score: ${hist.score}%`}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-primary-400 font-semibold italic py-2">No history logged.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Active Assignment State & Scoring Breakdown */}
        <div className="space-y-6">
          {/* Main Action card */}
          <div className="bg-white rounded-2xl border border-primary-200/80 p-6 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest border-b border-primary-100 pb-2.5">Active Reviewer</h3>

            {assignment ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200/50 flex items-center justify-center font-bold text-lg shadow-sm">
                    {assignment.developer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-900 text-sm leading-tight">{assignment.developer_name}</h4>
                    <span className="text-primary-400 text-[10px] font-semibold block mt-0.5">{assignment.developer_email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-primary-100 py-3 text-[11px] font-semibold">
                  <div>
                    <span className="text-primary-400 block text-[9px] font-extrabold uppercase tracking-wider mb-0.5">Active Workload</span>
                    <span className="font-bold text-primary-800">{assignment.current_workload} / {assignment.max_workload} reviews</span>
                  </div>
                  <div>
                    <span className="text-primary-400 block text-[9px] font-extrabold uppercase tracking-wider mb-0.5">Experience</span>
                    <span className="font-bold text-primary-800">{assignment.experience_years} Years</span>
                  </div>
                </div>

                {/* Status Update / Action Buttons */}
                <div className="space-y-2 pt-1">
                  {isEligibleToUpdate && review.status === 'Assigned' && (
                    <button
                      onClick={() => handleStatusChange('In Progress')}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start Code Review</span>
                    </button>
                  )}
                  {isEligibleToUpdate && review.status === 'In Progress' && (
                    <button
                      onClick={() => handleStatusChange('Completed')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Mark Review Completed</span>
                    </button>
                  )}

                  {isAdmin && review.status !== 'Completed' && (
                    <button
                      onClick={loadReassignOptions}
                      className="w-full bg-white hover:bg-primary-50 border border-primary-200 hover:border-primary-300 text-primary-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRightLeft className="h-4 w-4 text-primary-500" />
                      <span>Manually Reassign Reviewer</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-800 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold uppercase tracking-wider text-[10px]">No Reviewer Available</h5>
                    <p className="mt-1 leading-relaxed font-semibold">
                      All active developers with matching technology expertises are either Busy/Unavailable or have reached their workload limit.
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleRetryAutoAssign}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all cursor-pointer"
                    >
                      Retry Automatic Routing
                    </button>
                    <button
                      onClick={loadReassignOptions}
                      className="w-full bg-white hover:bg-primary-50 border border-primary-200 hover:border-primary-300 text-primary-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Force Manual Assign (Override Limit)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* If assigned, show explanation component */}
          {assignment && (
            <ScoreBreakdown scoreDetails={assignment} />
          )}
        </div>
      </div>

      {/* Reassignment Modal/Panel overlay */}
      {showReassignPanel && (
        <div className="fixed inset-0 bg-primary-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-primary-200/80 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-primary-150 flex justify-between items-center bg-primary-50/50">
              <div>
                <h3 className="text-base font-extrabold text-primary-850">Manual Reviewer Override Panel</h3>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-0.5">Force re-route (bypasses capacity caps)</p>
              </div>
              <button 
                onClick={() => setShowReassignPanel(false)}
                className="p-1.5 rounded-xl bg-white hover:bg-primary-50 text-primary-400 hover:text-primary-700 border border-primary-200 transition-colors cursor-pointer focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {reassignError && (
                <div className="bg-red-50 border border-red-250 text-red-755 text-xs font-semibold p-3 rounded-xl flex items-center gap-2 shadow-sm">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
                  <span>{reassignError}</span>
                </div>
              )}

              {/* Eligible Reviewers list */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-black text-emerald-650 uppercase tracking-widest block">Eligible Reviewers (Sorted by score)</span>
                {potentialReviewers.eligible.length > 0 ? (
                  <div className="divide-y divide-primary-100 border border-primary-200/70 rounded-xl overflow-hidden shadow-sm bg-white">
                    {potentialReviewers.eligible.map(opt => {
                      const isOverloaded = opt.developer.current_workload >= opt.developer.max_workload;
                      const isCurrent = assignment && opt.developer.id === assignment.developer_id;

                      return (
                        <div key={opt.developer.id} className="p-4 flex items-center justify-between hover:bg-primary-50/30 transition-colors">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-primary-900 text-xs">{opt.developer.name}</h4>
                              <span className="text-[9px] font-bold text-primary-450">({opt.developer.availability})</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.25 rounded-md uppercase tracking-wider">Current</span>
                              )}
                              {isOverloaded && (
                                <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.25 rounded-md flex items-center gap-0.5 uppercase tracking-wider">
                                  <AlertTriangle className="h-3 w-3 flex-shrink-0" /> Overloaded
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-primary-400 font-bold">
                              Workload: {opt.developer.current_workload}/{opt.developer.max_workload} active reviews &bull; Experience: {opt.developer.experience_years} years
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-mono font-black text-brand-600 text-sm">{opt.finalScore}%</span>
                              <span className="text-[8px] text-primary-400 block font-bold uppercase tracking-wider">Engine score</span>
                            </div>
                            <button
                              disabled={isCurrent}
                              onClick={() => handleManualReassign(opt.developer)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer shadow-sm ${
                                isCurrent 
                                  ? 'bg-primary-50 text-primary-300 border-primary-200 cursor-not-allowed shadow-none' 
                                  : 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600 hover:shadow-brand-500/10'
                              }`}
                            >
                              Assign
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-primary-400 font-semibold italic bg-primary-50/50 p-4 rounded-xl border border-primary-200/40 text-center">No eligible developers meet the technology constraints.</p>
                )}
              </div>

              {/* Excluded Reviewers list */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">Excluded Reviewers (Fails Constraints)</span>
                {potentialReviewers.excluded.length > 0 ? (
                  <div className="divide-y divide-primary-100 border border-primary-200/70 rounded-xl overflow-hidden shadow-sm bg-white">
                    {potentialReviewers.excluded.map(opt => (
                      <div key={opt.developer.id} className="p-4 flex items-center justify-between hover:bg-primary-50/30 transition-colors bg-primary-50/10">
                        <div className="space-y-1">
                          <h4 className="font-bold text-primary-500 text-xs">{opt.developer.name}</h4>
                          <div className="text-[10px] text-primary-400 font-medium">{opt.developer.email}</div>
                          <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Reasons: {opt.reasons.join(', ')}</span>
                          </div>
                        </div>
                        {/* Admin can force override even for excluded developers */}
                        <button
                          onClick={() => handleManualReassign(opt.developer)}
                          className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-650 hover:text-red-700 border border-primary-250 hover:border-red-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                        >
                          Force Override
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-primary-400 font-semibold italic text-center p-2">No developers excluded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetail;
