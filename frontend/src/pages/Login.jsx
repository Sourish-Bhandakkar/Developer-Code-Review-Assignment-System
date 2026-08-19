import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, KeyRound, Mail, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-primary-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-primary-200 overflow-hidden">
        {/* Banner header */}
        <div className="p-8 bg-primary-900 text-white text-center flex flex-col items-center gap-3 border-b border-primary-850">
          <div className="p-3 bg-brand-500 rounded-2xl shadow-lg shadow-brand-500/20 inline-block">
            <Code2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">RevAssign Portal</h2>
            <p className="text-xs text-primary-400 mt-1 font-medium">Developer Code Review Assignment System</p>
          </div>
        </div>

        {/* Login Body */}
        <div className="p-8 space-y-6">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-lg flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-700 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-primary-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-primary-50 border border-primary-200 text-sm rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-700 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-primary-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-primary-50 border border-primary-200 text-sm rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-primary-800 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick logins helper for viva */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-primary-200"></div>
            <span className="flex-shrink mx-4 text-[10px] text-primary-400 font-bold uppercase tracking-widest">Viva Demo Quick Login</span>
            <div className="flex-grow border-t border-primary-200"></div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => handleQuickLogin('admin@company.com', 'admin123')}
              disabled={submitting}
              className="w-full px-3 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-bold transition-all text-center flex flex-col justify-center gap-1 cursor-pointer"
            >
              <span>Admin Role</span>
              <span className="text-[9px] font-normal text-brand-500 truncate">Sourish Bhandakkar</span>
            </button>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block">Developer Demo Account</label>
              <select 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setEmail(val);
                    setPassword('password123');
                  }
                }}
                disabled={submitting}
                className="w-full px-3 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold transition-all cursor-pointer focus:outline-none focus:border-green-500 focus:bg-white"
                defaultValue=""
              >
                <option value="" disabled>-- Select Developer Profile --</option>
                <option value="developer1@company.com">Developer 1 (Java, Spring, Available)</option>
                <option value="developer2@company.com">Developer 2 (React, JS, Available)</option>
                <option value="developer3@company.com">Developer 3 (Python, Django, Available)</option>
                <option value="developer4@company.com">Developer 4 (C++, Algorithms, Busy)</option>
                <option value="developer5@company.com">Developer 5 (SQL, DB Design, Available)</option>
                <option value="developer6@company.com">Developer 6 (AWS, Docker, Available)</option>
                <option value="developer7@company.com">Developer 7 (Security, Linux, Available)</option>
                <option value="developer8@company.com">Developer 8 (Kotlin, Firebase, Unavailable)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
