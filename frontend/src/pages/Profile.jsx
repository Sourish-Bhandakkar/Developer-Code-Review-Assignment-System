import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { developerService } from '../services/api';
import { Save, User, Briefcase, Mail, CheckCircle2, Play, AlertCircle, Plus, X } from 'lucide-react';

const Profile = () => {
  const { user, developerProfile, checkAuth } = useAuth();
  
  const [experienceYears, setExperienceYears] = useState(0);
  const [availability, setAvailability] = useState('Available');
  const [maxWorkload, setMaxWorkload] = useState(3);
  const [expertises, setExpertises] = useState([]);
  
  const [techInput, setTechInput] = useState('');
  const [skillLevelInput, setSkillLevelInput] = useState(2);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const suggestedTechs = ['Java', 'Spring Boot', 'PostgreSQL', 'JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning', 'SQL', 'C++', 'Tailwind CSS', 'Docker', 'AWS', 'MongoDB', 'REST API'];

  useEffect(() => {
    if (developerProfile) {
      setExperienceYears(developerProfile.experience_years);
      setAvailability(developerProfile.availability);
      setMaxWorkload(developerProfile.max_workload);
      setExpertises(developerProfile.expertises || []);
    }
  }, [developerProfile]);

  if (user?.role === 'Admin') {
    return (
      <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-8 shadow-xl max-w-xl mx-auto space-y-6 rounded-2xl">
        <div>
          <h3 className="text-lg font-extrabold text-white">Admin Account Info</h3>
          <p className="text-xs text-primary-400 font-semibold mt-1">System administrator credentials</p>
        </div>
        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-1">
            <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">Full Name</span>
            <span className="font-bold text-white text-sm">{user.name}</span>
          </div>
          <div className="space-y-1">
            <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">Email Address</span>
            <span className="font-bold text-white text-sm">{user.email}</span>
          </div>
          <div className="space-y-1">
            <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">System Role</span>
            <span className="font-extrabold text-brand-400 text-xs bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-xl inline-block uppercase tracking-wider">{user.role}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!developerProfile) {
    return (
      <div className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl p-8 text-center text-xs text-primary-400 font-semibold max-w-xl mx-auto">
        No developer profile matches your user account.
      </div>
    );
  }

  const handleAddExpertise = (tech) => {
    const term = (tech || techInput).trim();
    if (!term) return;

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
    if (maxWorkload <= 0) {
      setErrorMsg('Max workload must be at least 1.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      experience_years: parseInt(experienceYears),
      availability,
      max_workload: parseInt(maxWorkload),
      expertises
    };

    try {
      await developerService.update(developerProfile.developer_id, payload);
      setSuccessMsg('Profile updated successfully.');
      await checkAuth(); // Reload context values
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-surface-200/90 border border-glass backdrop-blur-md p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-extrabold text-white">My Profile Settings</h2>
        <p className="text-xs text-primary-400 font-semibold mt-1">Configure your availability and expertise parameters</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold p-4 rounded-xl flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-4 rounded-xl flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-650 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-200/90 border border-glass backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
        {/* Core metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-white/5 pb-2.5">Profile Details</h3>
            
            <div className="space-y-1">
              <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">Full Name</span>
              <span className="font-bold text-white text-sm block">{user.name}</span>
            </div>

            <div className="space-y-1">
              <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">Email Address</span>
              <span className="font-bold text-white text-sm block">{user.email}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Availability State</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full bg-darkbg border border-white/10 text-primary-200 hover:text-white rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-darkbg text-xs font-bold px-4 py-3 outline-none transition-all cursor-pointer"
              >
                <option value="Available">Available (Eligible for auto-routing)</option>
                <option value="Busy">Busy (Eligible but scores are lower)</option>
                <option value="Unavailable">Unavailable (Completely excluded)</option>
              </select>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-white/5 pb-2.5">Capability Settings</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Years of Experience</label>
              <input 
                type="number"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                required
                className="w-full glass-input px-4 py-3 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-300 uppercase tracking-wider block">Maximum Workload Reviews Cap</label>
              <input 
                type="number"
                min="1"
                value={maxWorkload}
                onChange={(e) => setMaxWorkload(parseInt(e.target.value) || 3)}
                required
                className="w-full glass-input px-4 py-3 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Expertise configuration */}
        <div className="space-y-5 border-t border-white/5 pt-6">
          <div>
            <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-white/5 pb-2.5">Modify My Skill Grid</h3>
            <p className="text-[10px] text-primary-400 font-semibold mt-1">Add or remove technical domains to customize your review eligibility</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Add technology e.g. React..."
              className="flex-1 glass-input px-4 py-3.5 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
            />

            <select
              value={skillLevelInput}
              onChange={(e) => setSkillLevelInput(e.target.value)}
              className="w-full sm:w-48 bg-darkbg border border-white/10 text-primary-200 hover:text-white rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-darkbg text-xs font-bold px-4 py-3.5 outline-none transition-all cursor-pointer"
            >
              <option value={1}>Level 1 (Beginner)</option>
              <option value={2}>Level 2 (Intermediate)</option>
              <option value={3}>Level 3 (Expert)</option>
            </select>

            <button
              type="button"
              onClick={() => handleAddExpertise()}
              className="btn-primary px-4 py-3.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] text-primary-400 font-extrabold uppercase tracking-wider block">Suggested Skills Quick Add:</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTechs.map(tech => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleAddExpertise(tech)}
                  className="bg-white/5 hover:bg-white/10 text-primary-350 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                >
                  +{tech}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-darkbg/50 p-4 rounded-2xl border border-white/5 min-h-[90px] space-y-3 shadow-inner">
            <span className="text-[9px] text-primary-450 font-extrabold uppercase tracking-wider block">My Skill Grid Tags:</span>
            <div className="flex flex-wrap gap-2.5">
              {expertises.length > 0 ? (
                expertises.map((exp, index) => (
                  <span 
                    key={index} 
                    className="bg-surface-100 border border-glass text-white pl-3.5 pr-1.5 py-1 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-sm"
                  >
                    <span>{exp.name}</span>
                    <span className={`text-[9px] font-black px-1.5 rounded-md ${
                      exp.skill_level === 3 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      exp.skill_level === 2 ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
                      'bg-white/10 text-primary-400 border border-white/10'
                    }`}>
                      LVL {exp.skill_level}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(index)}
                      className="p-1 hover:bg-white/5 hover:text-red-450 rounded-lg transition-colors text-primary-405 cursor-pointer focus:outline-none"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-primary-450 font-semibold italic block py-2">
                  No skills configured. Add expertise tags so you can match review requests.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-white/5">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
