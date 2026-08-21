import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DevDashboard from './pages/DevDashboard';
import DevManagement from './pages/DevManagement';
import DevForm from './pages/DevForm';
import ReviewRequests from './pages/ReviewRequests';
import ReviewForm from './pages/ReviewForm';
import ReviewDetail from './pages/ReviewDetail';
import History from './pages/History';
import Profile from './pages/Profile';
import MyReviews from './pages/MyReviews';

// Route guards to protect pages based on authentication & roles
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Main Dashboard layout incorporating sidebar
const MainLayout = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-transparent overflow-hidden relative">
      {/* Sidebar overlay backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-surface-300/40 backdrop-blur-md border-b border-glass flex items-center justify-between px-4 md:px-8 shadow-lg z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-primary-300 hover:bg-white/5 hover:text-white transition-colors focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] md:text-xs font-bold text-primary-400">Environment:</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                Production-Ready
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-extrabold text-primary-400 uppercase tracking-wider block">Workspace Profile</span>
              <span className="text-xs font-bold text-white">{user?.name}</span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 shadow shadow-brand-500/20 text-white flex items-center justify-center font-extrabold text-sm border border-white/10 hover:brightness-110 transition-all cursor-pointer">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-[1450px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Determine layout dynamically for role dashboards
const RoleDashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }
  return <DevDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth routes */}
          <Route path="/login" element={<Login />} />

          {/* Secure layouts */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Common dashboard entry */}
              <Route path="/dashboard" element={<RoleDashboardRedirect />} />
              <Route path="/reviews/:id" element={<ReviewDetail />} />
              <Route path="/reviews/new" element={<ReviewForm />} />
              
              {/* Admin specific pages */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/developers" element={<DevManagement />} />
                <Route path="/developers/new" element={<DevForm />} />
                <Route path="/developers/:id/edit" element={<DevForm />} />
                <Route path="/reviews" element={<ReviewRequests />} />
                <Route path="/history" element={<History />} />
              </Route>

              {/* Developer specific pages */}
              <Route element={<ProtectedRoute allowedRoles={['Developer']} />}>
                <Route path="/my-reviews" element={<MyReviews />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
          </Route>

          {/* Root Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
