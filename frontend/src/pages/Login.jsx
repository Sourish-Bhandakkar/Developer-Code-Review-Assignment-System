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
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4 md:p-8">
      {/* Auth Card wrapper */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-primary-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        
        {/* Left Side: Modern SaaS Branding Panel (MD only) */}
        <div className="hidden md:flex md:col-span-5 bg-primary-950 text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Accent light circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="flex items-center gap-2.5 z-10">
            <div className="p-2 bg-brand-500 rounded-xl shadow-lg shadow-brand-500/20">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold tracking-wider text-sm">REV-ASSIGN</h2>
              <p className="text-[9px] text-brand-400 font-bold uppercase tracking-wider">Engine Suite</p>
            </div>
          </div>

          <div className="z-10 space-y-4 my-auto">
            <h3 className="text-xl font-bold leading-tight text-primary-100">
              Intelligent Routing for Peer Code Reviews
            </h3>
            <p className="text-xs text-primary-400 leading-relaxed font-medium">
              Eliminate review bottlenecks. Automatically assign pull requests to developers based on expertise alignment, workload limits, and experience details.
            </p>
            
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-xs text-primary-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-455" />
                <span>Weighted Matching Engine</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-455" />
                <span>Workload Capacity Safeguards</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-455" />
                <span>Audit Timeline Logging</span>
              </div>
            </div>
          </div>

          <div className="z-10 text-[10px] text-primary-500 font-bold uppercase tracking-wider">
            Workspace v2.0 &bull; Production
          </div>
        </div>

        {/* Right Side: Tabbed Login / Register Panel */}
        <div className="col-span-1 md:col-span-7 p-6 md:p-10 flex flex-col justify-between bg-white">
          
          {/* Header Mobile Brand */}
          <div className="flex md:hidden items-center gap-2 mb-6">
            <Code2 className="h-6 w-6 text-brand-600" />
            <span className="font-bold text-sm text-primary-850">REV-ASSIGN PORTAL</span>
          </div>

          <div className="space-y-6">
            {/* Tabs Trigger */}
            <div className="flex border-b border-primary-100 pb-px">
              <button
                type="button"
                onClick={() => { setMode('login'); setFormError(''); }}
                className={`pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 px-1 cursor-pointer ${
                  mode === 'login' 
                    ? 'border-brand-500 text-primary-900' 
                    : 'border-transparent text-primary-400 hover:text-primary-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setFormError(''); }}
                className={`ml-6 pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 px-1 cursor-pointer ${
                  mode === 'register' 
                    ? 'border-brand-500 text-primary-900' 
                    : 'border-transparent text-primary-400 hover:text-primary-600'
                }`}
              >
                Create Account
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2.5 shadow-sm">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-primary-400" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rahul Sharma"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-primary-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-primary-500 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-primary-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-primary-50/50 border border-primary-200 hover:border-primary-300 focus:border-brand-500 focus:bg-white text-xs rounded-xl focus:outline-none text-primary-800 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-primary-400 hover:text-primary-650 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-6"
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

          {/* Quick logins segment (only for Demo convenience) */}
          <div className="mt-8 border-t border-primary-100 pt-5 space-y-3">
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-[10px] text-primary-400 font-extrabold uppercase tracking-widest hover:text-primary-600 transition-colors focus:outline-none cursor-pointer"
            >
              <span>Viva Demo Quick login</span>
              {showDemoAccounts ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showDemoAccounts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-200">
                <button 
                  onClick={() => handleQuickLogin('admin@company.com', 'admin123')}
                  disabled={submitting}
                  className="px-3.5 py-2 bg-brand-50/50 hover:bg-brand-50 text-brand-700 border border-brand-200/80 rounded-xl text-left flex flex-col gap-0.5 cursor-pointer hover:shadow-sm transition-all"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-650">Admin Workspace</span>
                  <span className="text-[9px] text-brand-500 font-medium">Sourish Bhandakkar</span>
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
                    className="w-full px-3.5 py-3 bg-emerald-50/30 hover:bg-emerald-50/60 text-emerald-700 border border-emerald-250/60 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer focus:outline-none"
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
