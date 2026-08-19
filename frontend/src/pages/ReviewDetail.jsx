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
  AlertTriangle
} from 'lucide-react';

const ReviewDetail = () => {
  const { id } = useParams(); // review_id
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkAuth } = useAuth();
  
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
        <span>{error || 'Review request not found.'}</span>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';
  const isAssignedDev = developerProfile => developerProfile && assignment && developerProfile.developer_id === assignment.developer_id;
  const isEligibleToUpdate = isAdmin || isAssignedDev(useAuth().developerProfile);

  return (
    <div className="space-y-6">
      {/* Header and Back Button */}
      <div className="flex items-center gap-4">
        <Link 
          to={isAdmin ? "/reviews" : "/my-reviews"}
          className="p-2 hover:bg-white border border-primary-200 text-primary-600 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-800">Review Request Details</h2>
          <p className="text-xs text-primary-400 font-medium">Auto-routing evaluation and pull request audit status</p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {showSuccessAlert && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start justify-between">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-bold">Review Request Routed Successfully</h5>
              <p className="text-xs mt-1 font-medium">The system automatically calculated reviewer scores and assigned the request.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSuccessAlert(false)}
            className="text-xs text-green-600 hover:text-green-800 font-bold cursor-pointer"
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
          <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Repository & PR</span>
                <h3 className="text-lg font-bold text-primary-800 mt-1">{review.repository_name} &bull; {review.pull_request_id}</h3>
              </div>
              <span className={`px-3 py-1 font-bold rounded-full text-xs border ${
                review.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                review.status === 'Assigned' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                review.status === 'In Progress' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-green-50 text-green-700 border-green-200'
              }`}>
                {review.status}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Title</span>
              <h1 className="text-xl font-bold text-primary-900 leading-tight">{review.title}</h1>
            </div>

            {review.description && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Description</span>
                <p className="text-xs text-primary-650 leading-relaxed font-medium bg-primary-50 p-4 rounded-lg border border-primary-200/50">
                  {review.description}
                </p>
              </div>
            )}

            {/* Tags grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-primary-100 text-xs">
              <div>
                <span className="text-primary-400 block font-semibold uppercase tracking-wider text-[9px] mb-1">Language</span>
                <span className="font-bold text-primary-800">{review.language}</span>
              </div>
              <div>
                <span className="text-primary-400 block font-semibold uppercase tracking-wider text-[9px] mb-1">Priority</span>
                <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] border ${
                  review.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                  review.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  review.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-green-50 text-green-700 border-green-200'
                }`}>{review.priority}</span>
              </div>
              <div>
                <span className="text-primary-400 block font-semibold uppercase tracking-wider text-[9px] mb-1">Complexity</span>
                <span className="font-bold text-primary-800">{review.complexity}</span>
              </div>
              <div>
                <span className="text-primary-400 block font-semibold uppercase tracking-wider text-[9px] mb-1">Deadline</span>
                <span className="font-bold text-primary-800 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary-400" />
                  {new Date(review.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-primary-100 pt-4">
              <span className="text-primary-400 block font-semibold uppercase tracking-wider text-[9px]">Technologies Required</span>
              <div className="flex flex-wrap gap-1.5">
                {review.technologies?.map((tech, idx) => (
                  <span key={idx} className="bg-primary-50 text-primary-700 border border-primary-200 rounded-lg px-2.5 py-1 text-[10px] font-bold">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Assignment History Log */}
          <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary-800 flex items-center gap-2">
              <History className="h-4 w-4 text-primary-500" />
              <span>Assignment History Audit Log</span>
            </h3>
            
            <div className="relative border-l border-primary-200 pl-4 ml-2 space-y-4">
              {history.length > 0 ? (
                history.map((hist, idx) => {
                  const logColors = {
                    Assign: 'bg-blue-500 ring-blue-100',
                    Reassign: 'bg-purple-500 ring-purple-100',
                    Complete: 'bg-green-500 ring-green-100',
                    'In Progress': 'bg-orange-500 ring-orange-100'
                  };
                  return (
                    <div key={hist.id} className="relative text-xs">
                      {/* Timeline dot */}
                      <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ring-4 ${logColors[hist.action] || 'bg-slate-500 ring-slate-100'}`}></span>
                      <div>
                        <span className="font-bold text-primary-800">
                          {hist.action === 'Assign' && `Assigned to ${hist.developer_name}`}
                          {hist.action === 'Reassign' && `Reassigned manually to ${hist.developer_name}`}
                          {hist.action === 'Complete' && `Marked Completed by ${hist.developer_name}`}
                          {hist.action === 'In Progress' && `Started work by ${hist.developer_name}`}
                        </span>
                        <div className="text-[10px] text-primary-400 mt-0.5">
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
          <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-brand-650 uppercase tracking-widest border-b border-primary-100 pb-2">Active Reviewer</h3>

            {assignment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
                    {assignment.developer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-900 text-sm leading-tight">{assignment.developer_name}</h4>
                    <span className="text-primary-400 text-[10px] font-medium">{assignment.developer_email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-primary-100 py-3 text-xs">
                  <div>
                    <span className="text-primary-400 block font-semibold text-[10px]">Workload Capacity</span>
                    <span className="font-bold text-primary-800">{assignment.current_workload} / {assignment.max_workload} reviews</span>
                  </div>
                  <div>
                    <span className="text-primary-400 block font-semibold text-[10px]">Experience years</span>
                    <span className="font-bold text-primary-800">{assignment.experience_years} years</span>
                  </div>
                </div>

                {/* Status Update / Action Buttons */}
                <div className="space-y-2 pt-2">
                  {isEligibleToUpdate && review.status === 'Assigned' && (
                    <button
                      onClick={() => handleStatusChange('In Progress')}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start Code Review</span>
                    </button>
                  )}
                  {isEligibleToUpdate && review.status === 'In Progress' && (
                    <button
                      onClick={() => handleStatusChange('Completed')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Mark Review Completed</span>
                    </button>
                  )}

                  {isAdmin && review.status !== 'Completed' && (
                    <button
                      onClick={loadReassignOptions}
                      className="w-full bg-white hover:bg-primary-50 border border-primary-200 text-primary-700 font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRightLeft className="h-4 w-4 text-primary-500" />
                      <span>Manually Reassign Reviewer</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">No Reviewer Available</h5>
                    <p className="mt-1 leading-relaxed">
                      All active developers with matching technology expertises are either set to Unavailable or have reached their workload limit.
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleRetryAutoAssign}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Retry Automatic Routing
                    </button>
                    <button
                      onClick={loadReassignOptions}
                      className="w-full bg-white hover:bg-primary-50 border border-primary-200 text-primary-700 font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl border border-primary-200 shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-primary-100 flex justify-between items-center bg-primary-50/50 rounded-t-xl">
              <div>
                <h3 className="text-base font-bold text-primary-800">Manual Reviewer Override Panel</h3>
                <p className="text-xs text-primary-400 font-medium">Re-route reviews (includes workload overrides)</p>
              </div>
              <button 
                onClick={() => setShowReassignPanel(false)}
                className="text-xs font-bold text-primary-500 hover:text-primary-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {reassignError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{reassignError}</span>
                </div>
              )}

              {/* Eligible Reviewers list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider block">Eligible Reviewers (Sorted by score)</span>
                {potentialReviewers.eligible.length > 0 ? (
                  <div className="divide-y divide-primary-150 border border-primary-200 rounded-lg overflow-hidden">
                    {potentialReviewers.eligible.map(opt => {
                      const isOverloaded = opt.developer.current_workload >= opt.developer.max_workload;
                      const isCurrent = assignment && opt.developer.id === assignment.developer_id;

                      return (
                        <div key={opt.developer.id} className="p-4 flex items-center justify-between hover:bg-primary-50/30 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-primary-900 text-xs">{opt.developer.name}</h4>
                              <span className="text-[10px] text-primary-400">({opt.developer.availability})</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-brand-600 bg-brand-50 border border-brand-200 px-1 rounded">Current Assignee</span>
                              )}
                              {isOverloaded && (
                                <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-250 px-1 rounded flex items-center gap-0.5">
                                  <AlertTriangle className="h-2.5 w-2.5" /> Overloaded
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-primary-400 font-semibold">
                              Workload: {opt.developer.current_workload}/{opt.developer.max_workload} reviews &bull; Experience: {opt.developer.experience_years} years
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-mono font-extrabold text-brand-600 text-sm">{opt.finalScore}%</span>
                              <span className="text-[9px] text-primary-400 block font-semibold">calculated score</span>
                            </div>
                            <button
                              disabled={isCurrent}
                              onClick={() => handleManualReassign(opt.developer)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                isCurrent 
                                  ? 'bg-primary-50 text-primary-300 border-primary-150' 
                                  : 'bg-brand-600 hover:bg-brand-700 text-white border-brand-650'
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
                  <p className="text-xs text-primary-400 font-semibold italic bg-primary-50 p-4 rounded border">No eligible developers meet the expertise constraints.</p>
                )}
              </div>

              {/* Excluded Reviewers list */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">Excluded Reviewers (Fails Constraints)</span>
                {potentialReviewers.excluded.length > 0 ? (
                  <div className="divide-y divide-primary-150 border border-primary-200 rounded-lg overflow-hidden">
                    {potentialReviewers.excluded.map(opt => (
                      <div key={opt.developer.id} className="p-4 flex items-center justify-between hover:bg-primary-50/30 transition-colors bg-primary-50/20">
                        <div className="space-y-1">
                          <h4 className="font-bold text-primary-500 text-xs">{opt.developer.name}</h4>
                          <div className="text-[10px] text-primary-400">{opt.developer.email}</div>
                          <div className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>Reasons: {opt.reasons.join(', ')}</span>
                          </div>
                        </div>
                        {/* Admin can force override even for excluded developers */}
                        <button
                          onClick={() => handleManualReassign(opt.developer)}
                          className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-650 hover:text-red-700 border border-primary-200 hover:border-red-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Force Override
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-primary-400 font-semibold italic">No developers excluded.</p>
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
