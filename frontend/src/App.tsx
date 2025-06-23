import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminHome from './pages/AdminHome';
import Login from './pages/Login'; 
import SmartClassification from './pages/SmartClassification';
import QuickResolution from './pages/QuickResolution';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminCreator from './pages/AdminCreator';
import ResetPassword from './pages/ResetPassword';

// User routes components
import AIAssistance from './pages/AIAssistance';
import FileComplaint from './pages/FileComplaint';  
import MultiLingual from './pages/MultiLingual';
import TrackStatus from './pages/TrackStatus';
import Help from './pages/Help';
import FeedbackForm from './pages/FeedbackForm';
import RealTimeSupport from './pages/RealTimeSupport';

import '../../frontend/src/styles/translate.css';
import './index.css';

const getUserType = (): 'admin' | 'user' | null => {
  // Check localStorage for user role
  const userRole = localStorage.getItem('userRole');
  const adminToken = localStorage.getItem('adminToken');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) return null;
  
  // Check for admin email specifically
  const userEmail = localStorage.getItem('userEmail');
  const adminEmails = ['adm.railmadad@gmail.com', 'admin@railmadad.in'];
  
  // If adminToken exists and userRole is admin, return admin
  if (adminToken && userRole === 'admin') {
    return 'admin';
  }
  
  // Check if email is admin email
  if (userEmail && adminEmails.includes(userEmail)) {
    return 'admin';
  }
  
  // If userRole is explicitly set to admin
  if (userRole === 'admin') {
    return 'admin';
  }
  
  // If authenticated but not admin, return user
  if (userRole === 'passenger' || userRole === 'user' || isAuthenticated) {
    return 'user';
  }
  
  return null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const userType = getUserType();
  return userType ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const userType = getUserType();
  
  if (!userType) {
    return <Navigate to="/login" />;
  }
  
  if (userType !== 'admin') {
    return <Navigate to="/user-dashboard" />;
  }
  
  return <>{children}</>;
};

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const userType = getUserType();
  
  if (!userType) {
    return <Navigate to="/login" />;
  }
  
  if (userType === 'admin') {
    return <Navigate to="/admin-dashboard" />;
  }
  
  return <>{children}</>;
};

const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Check localStorage for theme preference and apply it immediately
    const theme = localStorage.getItem('theme') || localStorage.getItem('adminTheme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <>{children}</>;
};

const App = () => {
  const [userType, setUserType] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user type on app initialization
    const checkUserType = () => {
      const type = getUserType();
      setUserType(type);
      setLoading(false);
      
      // Dispatch event when user type changes
      window.dispatchEvent(new Event('userTypeChanged'));
    };

    checkUserType();

    // Listen for localStorage changes to update user type
    const handleStorageChange = () => {
      checkUserType();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userTypeChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userTypeChanged', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ThemeInitializer>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Admin creator route - only available in development */}
            {import.meta.env.DEV && (
              <Route path="/admin-creator" element={<AdminCreator />} />
            )}

            {/* Root route - redirect based on user type */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  {userType === 'admin' ? <Navigate to="/admin-dashboard" /> : <Navigate to="/user-dashboard" />}
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <Layout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminHome />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="smart-classification" element={<SmartClassification />} />
              <Route path="real-time-support" element={<RealTimeSupport />} />
              <Route path="quick-resolution" element={<QuickResolution />} />
              <Route path="multi-lingual" element={<MultiLingual />} />
              <Route path="staff" element={<Staff />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* User/Passenger Routes */}
            <Route
              path="/user-dashboard"
              element={
                <UserRoute>
                  <Layout />
                </UserRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="file-complaint" element={<FileComplaint />} />
              <Route path="track-status" element={<TrackStatus />} />
              <Route path="ai-assistance" element={<AIAssistance />} />
              <Route path="real-time-support" element={<RealTimeSupport />} />
              <Route path="quick-resolution" element={<RealTimeSupport />} />
              <Route path="multi-lingual" element={<MultiLingual />} />
              <Route path="help" element={<Help />} />
              <Route path="feedback-form" element={<FeedbackForm />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Fallback routes for backward compatibility */}

            <Route path="/dashboard" element={<Navigate to="/admin-dashboard/dashboard" />} />
            <Route path="/file-complaint" element={<Navigate to="/user-dashboard/file-complaint" />} />
            <Route path="/smart-classification" element={<Navigate to="/admin-dashboard/smart-classification" />} />
            <Route path="/track-status" element={<Navigate to="/user-dashboard/track-status" />} />
            <Route path="/ai-assistance" element={<Navigate to="/user-dashboard/ai-assistance" />} />
            <Route path="/real-time-support" element={<Navigate to={userType === 'admin' ? '/admin-dashboard/real-time-support' : '/user-dashboard/real-time-support'} />} />
            <Route path="/quick-resolution" element={<Navigate to={userType === 'admin' ? '/admin-dashboard/quick-resolution' : '/user-dashboard/quick-resolution'} />} />
            <Route path="/multi-lingual" element={<Navigate to={userType === 'admin' ? '/admin-dashboard/multi-lingual' : '/user-dashboard/multi-lingual'} />} />
            <Route path="/help" element={<Navigate to="/user-dashboard/help" />} />
            <Route path="/feedback-form" element={<Navigate to="/user-dashboard/feedback-form" />} />
            <Route path="/staff" element={<Navigate to="/admin-dashboard/staff" />} />
            <Route path="/settings" element={<Navigate to={userType === 'admin' ? '/admin-dashboard/settings' : '/user-dashboard/settings'} />} />
            <Route path="/profile" element={<Navigate to={userType === 'admin' ? '/admin-dashboard/profile' : '/user-dashboard/profile'} />} />
          </Routes>
          <Outlet />
        </div>
      </ThemeProvider>
    </ThemeInitializer>
  );
};

export default App;