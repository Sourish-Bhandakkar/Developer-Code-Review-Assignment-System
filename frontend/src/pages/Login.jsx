import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  Loader, 
  Eye, 
  EyeOff, 
  User, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (mode === 'login') {
      if (!email || !password) {
        setFormError('Please enter both email and password.');
        return;
      }
      setSubmitting(true);
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (err) {
        setFormError(err.message || 'Login failed. Please verify your credentials.');
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!name || !email || !password) {
        setFormError('All fields (Name, Email, Password) are required.');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
      }
      setSubmitting(true);
      try {
        await register(name, email, password);
        navigate('/dashboard');
      } catch (err) {
        setFormError(err.message || 'Registration failed. User may already exist.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setSubmitting(true);
    setFormError('');
    try {
      await login(quickEmail, quickPassword);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Subtle radial glow in the center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Auth Card wrapper */}
      <div className="w-full max-w-4xl bg-primary-900 rounded-2xl shadow-2xl shadow-primary-950/60 border border-primary-850/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] relative z-10">
        
        {/* Left Side: Dark Branding Panel (MD only) */}
        <div className="hidden md:flex md:col-span-5 bg-primary-950/70 text-white p-8 flex-col justify-between relative overflow-hidden border-r border-primary-850/40">
          {/* Subtle accent light highlights */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="flex items-center gap-2.5 z-10">
            <div className="p-2 bg-brand-500/10 rounded-xl border border-brand-500/20 shadow-inner">
              <Code2 className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <h2 className="font-extrabold tracking-wider text-sm text-white">REV-ASSIGN</h2>
              <p className="text-[9px] text-brand-400 font-bold uppercase tracking-wider">Engine Suite</p>
            </div>
          </div>

          <div className="z-10 space-y-4 my-auto">
            <h3 className="text-xl font-bold leading-tight text-white">
              Intelligent Routing for Peer Code Reviews
            </h3>
            <p className="text-xs text-primary-400 leading-relaxed font-medium">
              Eliminate review bottlenecks. Automatically assign pull requests to developers based on expertise alignment, workload limits, and experience details.
            </p>
            
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-xs text-primary-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-brand-400" />
                <span>Weighted Matching Engine</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-brand-400" />
                <span>Workload Capacity Safeguards</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-brand-400" />
                <span>Audit Timeline Logging</span>
              </div>
            </div>
          </div>

          <div className="z-10 text-[10px] text-primary-500 font-bold uppercase tracking-wider">
            Workspace v2.0 &bull; Production
          </div>
        </div>

        {/* Right Side: Tabbed Forms (Fully Dark navy/blue-gray) */}
        <div className="col-span-1 md:col-span-7 p-6 md:p-10 flex flex-col justify-between bg-primary-900/90">
          
          {/* Header Mobile Brand */}
          <div className="flex md:hidden items-center gap-2 mb-6">
            <Code2 className="h-6 w-6 text-brand-400" />
            <span className="font-bold text-sm text-white tracking-wide">REV-ASSIGN PORTAL</span>
          </div>

          <div className="space-y-6">
            {/* Tabs Trigger */}
            <div className="flex border-b border-primary-800 pb-px">
              <button
                type="button"
                onClick={() => { setMode('login'); setFormError(''); }}
                className={`pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 px-1 cursor-pointer focus:outline-none ${
                  mode === 'login' 
                    ? 'border-brand-500 text-white' 
                    : 'border-transparent text-primary-400 hover:text-primary-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setFormError(''); }}
                className={`ml-6 pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 px-1 cursor-pointer focus:outline-none ${
                  mode === 'register' 
                    ? 'border-brand-500 text-white' 
                    : 'border-transparent text-primary-400 hover:text-primary-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {formError && (
              <div className="bg-red-950/20 border border-red-900/50 text-red-300 text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2.5 shadow-sm">
                <AlertCircle className="h-4.5 w-4.5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-primary-400 uppercase tracking-wider block">Full Name</label>
                  <div className="relative flex items-center bg-primary-950 border border-primary-800 hover:border-primary-750 focus-within:border-brand-500 rounded-xl transition-all">
                    <User className="absolute left-3.5 h-4 w-4 text-primary-500" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rahul Sharma"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-xs focus:outline-none placeholder-primary-600 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-primary-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative flex items-center bg-primary-950 border border-primary-800 hover:border-primary-750 focus-within:border-brand-500 rounded-xl transition-all">
                  <Mail className="absolute left-3.5 h-4 w-4 text-primary-500" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-xs focus:outline-none placeholder-primary-600 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-primary-400 uppercase tracking-wider block">Password</label>
                <div className="relative flex items-center bg-primary-950 border border-primary-800 hover:border-primary-750 focus-within:border-brand-500 rounded-xl transition-all">
                  <KeyRound className="absolute left-3.5 h-4 w-4 text-primary-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-transparent text-white text-xs focus:outline-none placeholder-primary-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-primary-500 hover:text-primary-300 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-6"
              >
                {submitting ? (
                  <>
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>
          </div>

          {/* Quick logins helper accordion */}
          <div className="mt-8 border-t border-primary-800 pt-5 space-y-3">
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-[10px] text-primary-400 font-extrabold uppercase tracking-widest hover:text-primary-200 transition-colors focus:outline-none cursor-pointer"
            >
              <span>Viva Demo Quick Login</span>
              {showDemoAccounts ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showDemoAccounts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-200">
                <button 
                  onClick={() => handleQuickLogin('admin@company.com', 'admin123')}
                  disabled={submitting}
                  className="px-3.5 py-2.5 bg-primary-950 hover:bg-primary-850 text-primary-200 border border-primary-800 hover:border-primary-700 rounded-xl text-left flex flex-col gap-0.5 cursor-pointer transition-all hover:shadow-sm"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400">Admin Workspace</span>
                  <span className="text-[9px] text-primary-400 font-bold block mt-0.5">Sourish Bhandakkar</span>
                </button>

                <div className="flex flex-col gap-1">
                  <select 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        handleQuickLogin(val, 'password123');
                      }
                    }}
                    disabled={submitting}
                    className="w-full px-3.5 py-3 bg-primary-950 hover:bg-primary-850 text-primary-200 border border-primary-800 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer focus:outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled className="normal-case">-- Developer Account --</option>
                    <option value="developer1@company.com" className="normal-case">Dev 1 (Java, Spring, Available)</option>
                    <option value="developer2@company.com" className="normal-case">Dev 2 (React, JS, Available)</option>
                    <option value="developer3@company.com" className="normal-case">Dev 3 (Python, Django, Available)</option>
                    <option value="developer4@company.com" className="normal-case">Dev 4 (C++, Algo, Busy)</option>
                    <option value="developer5@company.com" className="normal-case">Dev 5 (SQL, DB, Available)</option>
                    <option value="developer6@company.com" className="normal-case">Dev 6 (AWS, Docker, Available)</option>
                    <option value="developer7@company.com" className="normal-case">Dev 7 (Security, Linux, Available)</option>
                    <option value="developer8@company.com" className="normal-case">Dev 8 (Kotlin, Mobile, Unavailable)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
