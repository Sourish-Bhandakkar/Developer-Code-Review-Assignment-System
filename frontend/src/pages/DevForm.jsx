import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { developerService } from '../services/api';
import { Save, ArrowLeft, Plus, X, AlertCircle } from 'lucide-react';

const DevForm = () => {
  const { id } = useParams(); // developer_id (undefined if new)
  const isEdit = !!id;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [availability, setAvailability] = useState('Available');
  const [maxWorkload, setMaxWorkload] = useState(4);
  const [status, setStatus] = useState('Active');
  
  // Expertises array of objects: { name: 'Java', skill_level: 3 }
  const [expertises, setExpertises] = useState([]);
  const [techInput, setTechInput] = useState('');
  const [skillLevelInput, setSkillLevelInput] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Suggestions for fast adding
  const suggestedTechs = ['Java', 'Spring Boot', 'PostgreSQL', 'JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning', 'SQL', 'C++', 'Tailwind CSS', 'Docker', 'AWS', 'MongoDB', 'REST API'];

  useEffect(() => {
    if (isEdit) {
      const fetchDev = async () => {
        try {
          setLoading(true);
          const dev = await developerService.getById(id);
          setName(dev.name);
          setEmail(dev.email);
          setExperienceYears(dev.experience_years);
          setAvailability(dev.availability);
          setMaxWorkload(dev.max_workload);
          setStatus(dev.status);
          setExpertises(dev.expertises || []);
        } catch (err) {
          console.error(err);
          setError('Could not load developer profile.');
        } finally {
          setLoading(false);
        }
      };
      fetchDev();
    }
  }, [id, isEdit]);

  const handleAddExpertise = (techName) => {
    const term = (techName || techInput).trim();
    if (!term) return;

    // Check duplicate
    if (expertises.some(e => e.name.toLowerCase() === term.toLowerCase())) {
      setTechInput('');
      return;
    }

    setExpertises(prev => [...prev, { name: term, skill_level: parseInt(skillLevelInput) }]);
    setTechInput('');
  };

  const handleRemoveExpertise = (index) => {
    setExpertises(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || (!isEdit && !password)) {
      setError('Name, email, and password are required.');
      return;
    }

    if (maxWorkload <= 0) {
      setError('Maximum workload must be at least 1.');
      return;
    }

    if (experienceYears < 0) {
      setError('Years of experience cannot be negative.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name,
      email,
      password: password.trim() !== '' ? password : null,
      experience_years: parseInt(experienceYears),
      availability,
      max_workload: parseInt(maxWorkload),
      status,
      expertises
    };

    try {
      if (isEdit) {
        await developerService.update(id, payload);
      } else {
        await developerService.create(payload);
      }
      navigate('/developers');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save developer profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Back Button */}
      <div className="flex items-center gap-4">
        <Link 
          to="/developers"
          className="p-2 hover:bg-white border border-primary-200 text-primary-600 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-primary-800">
            {isEdit ? 'Modify Developer Profile' : 'Register New Developer'}
          </h2>
          <p className="text-xs text-primary-400 font-medium">
            Configure system routing factors (experience, capacity, availability, expertise domains)
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-primary-200 shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: User Accounts details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-brand-650 uppercase tracking-widest border-b border-primary-100 pb-2">Account Details</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-700 uppercase tracking-wider block">Full Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                required
                className="w-full px-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-700 uppercase tracking-wider block">Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@company.com"
                required
                className="w-full px-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-700 uppercase tracking-wider block">
                Password {isEdit && <span className="text-[10px] text-primary-400 font-normal capitalize">(leave blank to keep current)</span>}
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required={!isEdit}
                className="w-full px-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors"
              />
            </div>

            {isEdit && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-primary-700 uppercase tracking-wider block">Profile Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors cursor-pointer"
                >
                  <option value="Active">Active Profile</option>
                  <option value="Inactive">Inactive/Deactivated Profile</option>
                </select>
              </div>
            )}
          </div>

          {/* Section 2: Engine Parameters */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-brand-650 uppercase tracking-widest border-b border-primary-100 pb-2">Routing parameters</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-700 uppercase tracking-wider block">Years of Experience</label>
              <input 
                type="number"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                required
                className="w-full px-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-700 uppercase tracking-wider block">Workload Capacity Cap</label>
              <input 
                type="number"
                min="1"
                value={maxWorkload}
                onChange={(e) => setMaxWorkload(parseInt(e.target.value) || 3)}
                required
                className="w-full px-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-700 uppercase tracking-wider block">Availability State</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors cursor-pointer"
              >
                <option value="Available">Available (Eligible - Full Score)</option>
                <option value="Busy">Busy (Eligible - Partial Score)</option>
                <option value="Unavailable">Unavailable (Excluded from auto-routing)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Interactive Expertise Grid */}
        <div className="space-y-4 border-t border-primary-100 pt-6">
          <h3 className="text-xs font-bold text-brand-650 uppercase tracking-widest border-b border-primary-100 pb-2">Technologies & Expertise Configuration</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input 
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Enter skill tag e.g. PostgreSQL..."
                className="w-full px-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={skillLevelInput}
                onChange={(e) => setSkillLevelInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-primary-50 border border-primary-200 text-xs rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors cursor-pointer"
              >
                <option value={1}>Level 1 (Beginner)</option>
                <option value={2}>Level 2 (Intermediate)</option>
                <option value={3}>Level 3 (Expert)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleAddExpertise()}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Suggested Skills Grid */}
          <div className="space-y-2">
            <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider block">Suggested Skills Quick Add:</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTechs.map(tech => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleAddExpertise(tech)}
                  className="bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 rounded px-2 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  +{tech}
                </button>
              ))}
            </div>
          </div>

          {/* Configured Expertises Tag List */}
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-200 min-h-[80px]">
            <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider block mb-2">Currently Assigned Skills:</span>
            <div className="flex flex-wrap gap-2">
              {expertises.length > 0 ? (
                expertises.map((exp, index) => (
                  <span 
                    key={index} 
                    className="bg-white border border-primary-200 text-primary-800 pl-3 pr-1 py-1 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <span>{exp.name}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 rounded-md ${
                      exp.skill_level === 3 ? 'bg-red-100 text-red-700' :
                      exp.skill_level === 2 ? 'bg-brand-100 text-brand-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      Lvl {exp.skill_level}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(index)}
                      className="p-1 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors text-primary-400 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-primary-400 font-semibold italic block py-2">No skills configured. Add at least one matching expertise tag so the routing engine can index this developer profile.</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex justify-end gap-3 border-t border-primary-100 pt-6">
          <Link
            to="/developers"
            className="px-4 py-2.5 bg-primary-100 hover:bg-primary-200 border border-primary-200 text-primary-700 font-bold rounded-lg transition-colors text-xs cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-75"
          >
            <Save className="h-4 w-4" />
            <span>{isEdit ? 'Save Profile Changes' : 'Register Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DevForm;
