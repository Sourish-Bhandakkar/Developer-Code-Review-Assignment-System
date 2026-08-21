import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GitPullRequest, 
  History, 
  User, 
  LogOut, 
  Code2,
  X
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'Admin';

  const baseLinkClass = "flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all duration-200 border-l-4";
  const activeClass = "bg-brand-500/10 text-white border-brand-500 font-bold shadow-[inset_1px_0_15px_rgba(14,165,233,0.05)]";
  const inactiveClass = "text-primary-400 border-transparent hover:bg-white/5 hover:text-primary-100 hover:border-white/5";

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-[#050B1A]/90 backdrop-blur-xl text-white flex flex-col h-full border-r border-glass flex-shrink-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
      mobileOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand Header */}
      <div className="p-6 border-b border-glass flex items-center justify-between bg-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500/10 rounded-xl border border-brand-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
            <Code2 className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-wider text-white">REV-ASSIGN</h1>
            <span className="text-[9px] text-brand-400 font-black tracking-widest uppercase block mt-0.5">Code Routing</span>
          </div>
        </div>
        <button 
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-xl text-primary-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Quick Info */}
      <div className="px-6 py-5 border-b border-glass bg-[#081226]/40 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 shadow shadow-brand-500/10 text-white flex items-center justify-center font-black text-lg border border-white/10">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <h4 className="font-bold text-sm text-white truncate leading-tight">{user.name}</h4>
          <span className="text-[9px] text-brand-400 font-extrabold tracking-widest block mt-1 uppercase bg-brand-500/10 border border-brand-500/20 rounded-md px-1.5 py-0.5 w-max">
            {user.role}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
        {isAdmin ? (
          <>
            <NavLink 
              to="/dashboard" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Overview Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/developers" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Developers CRUD</span>
            </NavLink>
            
            <NavLink 
              to="/reviews" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <GitPullRequest className="h-4.5 w-4.5" />
              <span>Review Requests</span>
            </NavLink>
            
            <NavLink 
              to="/history" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <History className="h-4.5 w-4.5" />
              <span>Assignment History</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink 
              to="/dashboard" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>My Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/my-reviews" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <GitPullRequest className="h-4.5 w-4.5" />
              <span>My Assigned Reviews</span>
            </NavLink>

            <NavLink 
              to="/profile" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <User className="h-4.5 w-4.5" />
              <span>Profile & Settings</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-glass bg-[#050B1A]/40">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-red-400 hover:bg-red-950/20 hover:text-red-300 border border-transparent hover:border-red-900/30 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
