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
      <div className="bg-white rounded-2xl border border-primary-200/80 p-8 shadow-sm max-w-xl mx-auto space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-primary-900">Admin Account Info</h3>
          <p className="text-xs text-primary-400 font-semibold mt-1">System administrator credentials</p>
        </div>
        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-1">
            <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">Full Name</span>
            <span className="font-bold text-primary-850 text-sm">{user.name}</span>
          </div>
          <div className="space-y-1">
            <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">Email Address</span>
            <span className="font-bold text-primary-850 text-sm">{user.email}</span>
          </div>
          <div className="space-y-1">
            <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">System Role</span>
            <span className="font-extrabold text-brand-700 text-xs bg-brand-50 border border-brand-200/60 px-3 py-1 rounded-xl inline-block uppercase tracking-wider">{user.role}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!developerProfile) {
    return (
      <div className="bg-white rounded-2xl border border-primary-200 p-8 text-center text-xs text-primary-400 font-semibold max-w-xl mx-auto">
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
      <div className="bg-white p-6 rounded-2xl border border-primary-200/80 shadow-sm">
        <h2 className="text-xl font-extrabold text-primary-900">My Profile Settings</h2>
        <p className="text-xs text-primary-400 font-semibold mt-1">Configure your availability and expertise parameters</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold p-4 rounded-xl flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-xl flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-primary-200/80 shadow-sm p-6 md:p-8 space-y-8">
        {/* Core metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest border-b border-primary-100 pb-2.5">Profile Details</h3>
            
            <div className="space-y-1">
              <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">Full Name</span>
              <span className="font-bold text-primary-850 text-sm block">{user.name}</span>
            </div>

            <div className="space-y-1">
              <span className="text-primary-400 block uppercase tracking-wider text-[9px] font-black">Email Address</span>
              <span className="font-bold text-primary-850 text-sm block">{user.email}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Availability State</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-855 transition-all font-bold cursor-pointer"
              >
                <option value="Available">Available (Eligible for auto-routing)</option>
                <option value="Busy">Busy (Eligible but scores are lower)</option>
                <option value="Unavailable">Unavailable (Completely excluded)</option>
              </select>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest border-b border-primary-100 pb-2.5">Capability Settings</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Years of Experience</label>
              <input 
                type="number"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                required
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-850 transition-all font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Maximum Workload Reviews Cap</label>
              <input 
                type="number"
                min="1"
                value={maxWorkload}
                onChange={(e) => setMaxWorkload(parseInt(e.target.value) || 3)}
                required
                className="w-full px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-850 transition-all font-bold"
              />
            </div>
          </div>
        </div>

        {/* Expertise configuration */}
        <div className="space-y-5 border-t border-primary-100 pt-6">
          <div>
            <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest border-b border-primary-100 pb-2.5">Modify My Skill Grid</h3>
            <p className="text-[10px] text-primary-400 font-semibold mt-1">Add or remove technical domains to customize your review eligibility</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Add technology e.g. React..."
              className="flex-1 px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
            />

            <select
              value={skillLevelInput}
              onChange={(e) => setSkillLevelInput(e.target.value)}
              className="w-full sm:w-48 px-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-850 transition-all font-bold cursor-pointer"
            >
              <option value={1}>Level 1 (Beginner)</option>
              <option value={2}>Level 2 (Intermediate)</option>
              <option value={3}>Level 3 (Expert)</option>
            </select>

            <button
              type="button"
              onClick={() => handleAddExpertise()}
              className="px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
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
                  className="bg-primary-50/50 hover:bg-primary-100 text-primary-600 hover:text-primary-800 border border-primary-200/60 hover:border-primary-350 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                >
                  +{tech}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary-50/30 p-4 rounded-2xl border border-primary-200/60 min-h-[90px] space-y-3">
            <span className="text-[9px] text-primary-400 font-extrabold uppercase tracking-wider block">My Skill Grid Tags:</span>
            <div className="flex flex-wrap gap-2">
              {expertises.length > 0 ? (
                expertises.map((exp, index) => (
                  <span 
                    key={index} 
                    className="bg-white border border-primary-200 text-primary-800 pl-3.5 pr-1.5 py-1 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-sm"
                  >
                    <span>{exp.name}</span>
                    <span className={`text-[9px] font-black px-1.5 rounded-md ${
                      exp.skill_level === 3 ? 'bg-red-100 text-red-700' :
                      exp.skill_level === 2 ? 'bg-brand-100 text-brand-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      LVL {exp.skill_level}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(index)}
                      className="p-1 hover:bg-red-50 hover:text-red-650 rounded-lg transition-colors text-primary-405 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-primary-400 font-semibold italic block py-2">
                  No skills configured. Add expertise tags so you can match review requests.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-primary-100">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all disabled:opacity-75"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
