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
  Code2
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'Admin';

  const baseLinkClass = "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150";
  const activeClass = "bg-brand-600 text-white shadow-sm";
  const inactiveClass = "text-primary-300 hover:bg-primary-800 hover:text-white";

  return (
    <aside className="w-64 bg-primary-900 text-white flex flex-col h-full border-r border-primary-800 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-primary-800 flex items-center gap-3 bg-primary-950">
        <Code2 className="h-8 w-8 text-brand-400" />
        <div>
          <h1 className="font-bold text-base leading-tight tracking-wider">REV-ASSIGN</h1>
          <span className="text-[10px] text-brand-300 font-semibold tracking-widest uppercase">Code Routing</span>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="px-6 py-4 border-b border-primary-850 flex items-center gap-3 bg-primary-900/50">
        <div className="h-10 w-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-inner">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <h4 className="font-semibold text-sm truncate">{user.name}</h4>
          <p className="text-xs text-primary-400 truncate">{user.role}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {isAdmin ? (
          <>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Overview Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/developers" 
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <Users className="h-5 w-5" />
              <span>Developers CRUD</span>
            </NavLink>
            
            <NavLink 
              to="/reviews" 
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <GitPullRequest className="h-5 w-5" />
              <span>Review Requests</span>
            </NavLink>
            
            <NavLink 
              to="/history" 
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <History className="h-5 w-5" />
              <span>Assignment History</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>My Dashboard</span>
            </NavLink>
            
            <NavLink 
              to="/my-reviews" 
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <GitPullRequest className="h-5 w-5" />
              <span>My Assigned Reviews</span>
            </NavLink>

            <NavLink 
              to="/profile" 
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <User className="h-5 w-5" />
              <span>Profile & Settings</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-primary-800 bg-primary-950">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-300 hover:bg-red-950/30 hover:text-red-200 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
