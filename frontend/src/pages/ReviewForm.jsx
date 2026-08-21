import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reviewService } from '../services/api';
import { Save, ArrowLeft, Plus, X, AlertCircle } from 'lucide-react';

const ReviewForm = () => {
  const navigate = useNavigate();

  const [repositoryName, setRepositoryName] = useState('');
  const [pullRequestId, setPullRequestId] = useState('#');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Java');
  
  // Technologies tags
  const [technologies, setTechnologies] = useState([]);
  const [techInput, setTechInput] = useState('');

  const [priority, setPriority] = useState('Medium');
  const [complexity, setComplexity] = useState('Medium');
  
  // Set default deadline to 7 days from now
  const getDefaultDeadline = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  };
  const [deadline, setDeadline] = useState(getDefaultDeadline());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Suggestions for fast adding
  const suggestedTechs = ['Java', 'Spring Boot', 'PostgreSQL', 'JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning', 'SQL', 'C++', 'Tailwind CSS', 'Docker', 'AWS', 'MongoDB', 'REST API'];

  const handleAddTechnology = (tech) => {
    const term = (tech || techInput).trim();
    if (!term) return;

    if (technologies.some(t => t.toLowerCase() === term.toLowerCase())) {
      setTechInput('');
      return;
    }

    setTechnologies(prev => [...prev, term]);
    setTechInput('');
  };

  const handleRemoveTechnology = (index) => {
    setTechnologies(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repositoryName || !pullRequestId || !title || !language || technologies.length === 0 || !deadline) {
      setError('Please fill in all required fields and add at least one technology.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      repository_name: repositoryName,
      pull_request_id: pullRequestId,
      title,
      description,
      language,
      technologies,
      priority,
      complexity,
      deadline
    };

    try {
      const result = await reviewService.create(payload);
      // Redirect to the assignment result details page, passing the engine results in state
      navigate(`/reviews/${result.review.id}`, { 
        state: { 
          justCreated: true, 
          assignmentResult: result 
        } 
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit review request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header back button */}
      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-primary-200/80 shadow-sm">
        <Link 
          to="/reviews"
          className="p-2 hover:bg-primary-50 border border-primary-200 text-primary-600 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-lg font-extrabold text-primary-900">Submit Code Review Request</h2>
          <p className="text-[11px] text-primary-400 font-semibold mt-0.5">Create a review entry and trigger automatic suitability matching</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-750 text-xs font-semibold p-4 rounded-xl flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-650 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-primary-200/80 shadow-sm p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left panel: PR information */}
          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest border-b border-primary-100 pb-2.5">Pull Request Metadata</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Repository Name</label>
              <input 
                type="text"
                value={repositoryName}
                onChange={(e) => setRepositoryName(e.target.value)}
                placeholder="E-Commerce API"
                required
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Pull Request ID</label>
              <input 
                type="text"
                value={pullRequestId}
                onChange={(e) => setPullRequestId(e.target.value)}
                placeholder="#142"
                required
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Review Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Implement payment gateway"
                required
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Pull Request Description</label>
              <textarea 
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe changes made in this pull request..."
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium resize-none"
              ></textarea>
            </div>
          </div>

          {/* Right panel: Review configuration parameters */}
          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest border-b border-primary-100 pb-2.5">Routing Parameters</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Primary Programming Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-850 transition-all font-bold cursor-pointer"
              >
                <option value="Java">Java</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="SQL">SQL</option>
                <option value="TypeScript">TypeScript</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Review Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-855 transition-all font-bold cursor-pointer"
              >
                <option value="Low">Low (Standard SLA)</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Channels to available reviewers)</option>
                <option value="Critical">Critical (Immediate routing)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Complexity Level</label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-850 transition-all font-bold cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Deadline Date</label>
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-850 transition-all font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technology Tags Setup */}
        <div className="space-y-5 border-t border-primary-100 pt-6">
          <div>
            <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest border-b border-primary-100 pb-2.5">Technologies and Skill Tags Required</h3>
            <p className="text-[10px] text-primary-400 font-semibold mt-1">Select matching tags to allow routing engine to filter appropriate candidates</p>
          </div>
          
          <div className="flex gap-3">
            <input 
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Type technology (e.g. Spring Boot) and press enter..."
              className="flex-1 px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-805 transition-all font-medium"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
            />
            <button
              type="button"
              onClick={() => handleAddTechnology()}
              className="px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Tag</span>
            </button>
          </div>

          {/* Technology suggestions */}
          <div className="space-y-2">
            <span className="text-[9px] text-primary-400 font-extrabold uppercase tracking-wider block">Suggestions Grid (Click to Add):</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTechs.map(tech => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleAddTechnology(tech)}
                  className="bg-primary-50/50 hover:bg-primary-100 text-primary-600 hover:text-primary-800 border border-primary-200/60 hover:border-primary-350 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                >
                  +{tech}
                </button>
              ))}
            </div>
          </div>

          {/* Technologies active tags */}
          <div className="bg-primary-50/30 p-4 rounded-2xl border border-primary-200/60 min-h-[90px] space-y-3">
            <span className="text-[9px] text-primary-400 font-extrabold uppercase tracking-wider block">Selected Technologies (Minimum 1 Required):</span>
            <div className="flex flex-wrap gap-2">
              {technologies.length > 0 ? (
                technologies.map((tech, index) => (
                  <span 
                    key={index} 
                    className="bg-white border border-primary-200 text-primary-800 pl-3.5 pr-1.5 py-1 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnology(index)}
                      className="p-1 hover:bg-red-50 hover:text-red-650 rounded-lg transition-colors text-primary-405 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-primary-400 font-semibold italic block py-2">
                  No technologies added yet. Select tags so the matching engine can filter eligible developers.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex justify-end gap-3 border-t border-primary-100 pt-6">
          <Link
            to="/reviews"
            className="px-4 py-2.5 bg-primary-100 hover:bg-primary-200 border border-primary-200 text-primary-700 font-bold rounded-xl transition-all text-xs cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all disabled:opacity-75"
          >
            <Save className="h-4 w-4" />
            <span>Submit Review Request</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
