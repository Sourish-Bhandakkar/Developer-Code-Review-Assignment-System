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

  const baseLinkClass = "flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-200 border-l-4";
  const activeClass = "bg-primary-800/85 text-brand-400 border-brand-500 font-bold shadow-inner";
  const inactiveClass = "text-primary-300 border-transparent hover:bg-primary-900/65 hover:text-white hover:border-primary-750";

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-primary-950 text-white flex flex-col h-full border-r border-primary-800/60 flex-shrink-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
      mobileOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand Header */}
      <div className="p-5 border-b border-primary-850 flex items-center justify-between bg-primary-950/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand-500/10 rounded-lg border border-brand-500/20">
            <Code2 className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider text-white">REV-ASSIGN</h1>
            <span className="text-[9px] text-brand-400 font-bold tracking-widest uppercase block mt-0.5">Code Routing</span>
          </div>
        </div>
        <button 
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-primary-400 hover:text-white hover:bg-primary-800 transition-colors focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Quick Info */}
      <div className="px-5 py-4 border-b border-primary-850 bg-primary-900/30 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-brand-600 shadow-md shadow-brand-500/10 text-white flex items-center justify-center font-bold text-lg border border-brand-400/20">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <h4 className="font-bold text-sm text-primary-100 truncate leading-tight">{user.name}</h4>
          <span className="text-[10px] text-primary-400 font-semibold tracking-wide block mt-0.5 uppercase">{user.role}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-0.5 overflow-y-auto">
        {isAdmin ? (
          <>
            <NavLink 
              to="/dashboard" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/developers" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <Users className="h-4 w-4" />
              <span>Developers CRUD</span>
            </NavLink>
            
            <NavLink 
              to="/reviews" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <GitPullRequest className="h-4 w-4" />
              <span>Review Requests</span>
            </NavLink>
            
            <NavLink 
              to="/history" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <History className="h-4 w-4" />
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
              <LayoutDashboard className="h-4 w-4" />
              <span>My Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/my-reviews" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <GitPullRequest className="h-4 w-4" />
              <span>My Assigned Reviews</span>
            </NavLink>

            <NavLink 
              to="/profile" 
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <User className="h-4 w-4" />
              <span>Profile & Settings</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-primary-900 bg-primary-950">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all duration-150 cursor-pointer border border-transparent hover:border-red-950/60"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
