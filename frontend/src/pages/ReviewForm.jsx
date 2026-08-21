import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import { FileUp, ArrowLeft, Plus, X, AlertCircle, Cpu, ShieldCheck } from 'lucide-react';

const ReviewForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [pullRequestId, setPullRequestId] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [complexity, setComplexity] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  
  // Technologies array
  const [technologies, setTechnologies] = useState([]);
  const [techInput, setTechInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Suggestion tags for easy selecting
  const suggestedTechs = ['React', 'JavaScript', 'Node.js', 'PostgreSQL', 'Java', 'Spring Boot', 'Python', 'C++', 'Docker', 'AWS', 'MongoDB', 'Kotlin', 'Android', 'Swift', 'TypeScript', 'Tailwind CSS'];

  const handleAddTech = (techVal) => {
    const term = (techVal || techInput).trim();
    if (!term) return;

    if (technologies.some(t => t.toLowerCase() === term.toLowerCase())) {
      setTechInput('');
      return;
    }

    setTechnologies(prev => [...prev, term]);
    setTechInput('');
  };

  const handleRemoveTech = (index) => {
    setTechnologies(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !pullRequestId || !repositoryName || !description || !deadline) {
      setError('Please fill in all required fields.');
      return;
    }

    if (technologies.length === 0) {
      setError('Please specify at least one required technology/language.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title,
      pull_request_id: pullRequestId,
      repository_name: repositoryName,
      description,
      priority,
      complexity,
      deadline,
      technologies
    };

    try {
      await reviewService.create(payload);
      navigate('/reviews');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit review request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header back button */}
      <div className="flex items-center gap-4 bg-surface-200/90 border border-glass backdrop-blur-md p-5 rounded-2xl shadow-lg">
        <Link 
          to="/reviews"
          className="p-2 hover:bg-white/5 border border-white/10 text-primary-300 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-lg font-extrabold text-white">Create Code Review Request</h2>
          <p className="text-[11px] text-primary-400 font-semibold mt-0.5">Submit pull request parameters to trigger the routing engine</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-4 rounded-xl flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: REQUEST DETAILS */}
          <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-white/5 pb-2">1. Request Details</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Pull Request Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement OAuth login and user session validation"
                required
                className="w-full glass-input px-4 py-3 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Repository Name</label>
              <input 
                type="text"
                value={repositoryName}
                onChange={(e) => setRepositoryName(e.target.value)}
                placeholder="e.g. company/identity-service"
                required
                className="w-full glass-input px-4 py-3 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Pull Request ID</label>
              <input 
                type="text"
                value={pullRequestId}
                onChange={(e) => setPullRequestId(e.target.value)}
                placeholder="e.g. PR-1204"
                required
                className="w-full glass-input px-4 py-3 text-xs font-mono"
              />
            </div>
          </div>

          {/* Card 2: REVIEW REQUIREMENTS */}
          <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-white/5 pb-2">2. Review Requirements</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Code Review Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-darkbg border border-white/10 text-primary-200 hover:text-white rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-darkbg text-xs font-bold px-4 py-3 outline-none transition-all cursor-pointer"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Review Complexity</label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full bg-darkbg border border-white/10 text-primary-200 hover:text-white rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-darkbg text-xs font-bold px-4 py-3 outline-none transition-all cursor-pointer"
              >
                <option value="Low">Low Complexity (Minor changes)</option>
                <option value="Medium">Medium Complexity (Standard features)</option>
                <option value="High">High Complexity (Critical refactors/architecture)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Submission Deadline</label>
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full glass-input px-4 py-3 text-xs font-bold"
              />
            </div>
          </div>

          {/* Description Span (col-span-2) */}
          <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-4 md:col-span-2">
            <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Pull Request Description / Summary</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail changes, technical scope, and items for the reviewer..."
              required
              className="w-full glass-input px-4 py-3 text-xs resize-none"
            ></textarea>
          </div>

          {/* Card 3: TECHNOLOGY / EXPERTISE */}
          <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-white/5 pb-2">3. Technology / Expertise</h3>
            
            <div className="flex gap-2.5">
              <input 
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology e.g. React..."
                className="flex-1 glass-input px-3.5 py-3 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
              />
              <button
                type="button"
                onClick={() => handleAddTech()}
                className="btn-primary px-3.5 py-3 text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-primary-400 font-extrabold uppercase tracking-wider block">Common Tech tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTechs.slice(0, 8).map(tech => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleAddTech(tech)}
                    className="bg-white/5 hover:bg-white/10 text-primary-350 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-2 py-0.75 text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                  >
                    +{tech}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tags list */}
            <div className="bg-darkbg/50 p-4 rounded-xl border border-white/5 min-h-[70px] space-y-2">
              <span className="text-[9px] text-primary-450 font-extrabold uppercase tracking-wider block">Assigned Tech tags:</span>
              <div className="flex flex-wrap gap-2">
                {technologies.length > 0 ? (
                  technologies.map((tech, index) => (
                    <span 
                      key={index} 
                      className="bg-surface-100 border border-glass text-white pl-2.5 pr-1 py-0.75 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(index)}
                        className="p-0.5 hover:bg-white/5 hover:text-red-450 rounded transition-colors text-primary-405 cursor-pointer focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-primary-455 font-semibold italic block py-1">
                    No technologies added yet.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: ROUTING / ASSIGNMENT INFORMATION */}
          <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-white/5 pb-2">4. Assignment Information</h3>
              <div className="flex items-start gap-3 bg-brand-500/5 border border-brand-500/10 rounded-xl p-4">
                <Cpu className="h-5 w-5 text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-wider">Algorithmic Routing</h4>
                  <p className="text-[11px] text-primary-200 mt-1 leading-relaxed font-semibold">
                    Upon submission, our routing engine automatically runs matchmaking criteria. It will check availability, workloads, experience details, and expertise matches to assign the most suited developer.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <Link
                to="/reviews"
                className="btn-secondary px-4 py-2.5 rounded-xl text-xs flex items-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <FileUp className="h-4 w-4" />
                <span>Submit Request</span>
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
