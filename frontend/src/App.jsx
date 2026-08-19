import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
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
  
  return (
    <div className="flex h-screen bg-primary-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-primary-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-400">Environment:</span>
            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200 uppercase">
              Production-Ready
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-semibold text-primary-500 block">Workspace Profile</span>
              <span className="text-xs font-bold text-primary-800">{user?.name}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 overflow-y-auto p-8 max-w-[1400px] w-full mx-auto">
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
