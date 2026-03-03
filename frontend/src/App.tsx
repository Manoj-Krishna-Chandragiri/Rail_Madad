import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminHome from './pages/AdminHome';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/StaffLogin';
import PassengerLogin from './pages/PassengerLogin';
import LoginPortal from './pages/LoginPortal';
import LandingPage from './pages/LandingPage';
import SmartClassification from './pages/SmartClassification';
import QuickResolution from './pages/QuickResolution';
import Staff from './pages/Staff';
import StaffDashboard from './pages/StaffDashboard';
import StaffHome from './pages/StaffHome';
import StaffProfile from './pages/StaffProfile';
import StaffAnalytics from './pages/StaffAnalytics';
import StaffPerformance from './pages/StaffPerformance';
import AdminAnalytics from './pages/AdminAnalytics';
import UserManagement from './pages/UserManagement';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminCreator from './pages/AdminCreator';
import ResetPassword from './pages/ResetPassword';
import RailMadadAnimation from './pages/RailMadadAnimation';
import SimpleRailAnimation from './pages/SimpleRailAnimation';
import CustomRailAnimation from './pages/CustomRailAnimation';
import RealisticRailAnimation from './pages/RealisticRailAnimation';
import PureCSSRailAnimation from './pages/PureCSSRailAnimation';
import SentimentAnalysisPage from './pages/SentimentAnalysisPage';
import TranslationTest from './pages/TranslationTest';

import SignUpStaff from './pages/SignUpStaff';

// User routes components
import AIAssistance from './pages/AIAssistance';
import FileComplaint from './pages/FileComplaint';
// import FileComplaintWithAI from './pages/FileComplaintWithAI';
import FileComplaintMultimedia from './pages/FileComplaintMultimedia';  
import MultiLingual from './pages/MultiLingual';
import TrackStatus from './pages/TrackStatus';
import Help from './pages/Help';
import FeedbackForm from './pages/FeedbackForm';
import ContactStaff from './pages/ContactStaff';
import RealTimeSupport from './pages/RealTimeSupport';
import { initializeErrorHandling } from './utils/errorHandling';

import './styles/translate.css';
import './index.css';

const getUserType = (): 'admin' | 'user' | 'staff' | null => {
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
  
  if (userRole === 'staff') {
    return 'staff';
  }

  // If authenticated but not admin, return user
  if (userRole === 'passenger' || userRole === 'user' || isAuthenticated) {
    return 'user';
  }
  
  return null;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const userType = getUserType();
  
  if (!userType) {
    return <Navigate to="/login-portal" />;
  }
  
  if (userType !== 'admin') {
    return <Navigate to="/user-dashboard" />;
  }
  
  return <>{children}</>;
};

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const userType = getUserType();
  
  if (!userType) {
    return <Navigate to="/login-portal" />;
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
  const [userType, setUserType] = useState<'admin' | 'user' | 'staff' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize error handling for browser extensions
    initializeErrorHandling();
    
    // Check user type on app initialization
    const checkUserType = () => {
      const type = getUserType();
      setUserType(type);
      setLoading(false);
    };

    checkUserType();

    // Listen for localStorage changes to update user type
    const handleStorageChange = (event?: StorageEvent | Event) => {
      // Only respond to actual storage changes, not our own dispatched events
      if (event && event.type === 'storage') {
        const type = getUserType();
        setUserType(type);
      } else if (event && event.type === 'userTypeChanged') {
        const type = getUserType();
        setUserType(type);
      }
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
            {/* Public Routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login-portal" element={<LoginPortal />} />
            <Route path="/animation" element={<RailMadadAnimation />} />
            <Route path="/simple-animation" element={<SimpleRailAnimation />} />
            <Route path="/custom-animation" element={<CustomRailAnimation />} />
            <Route path="/realistic-animation" element={<RealisticRailAnimation />} />
            <Route path="/pure-css-animation" element={<PureCSSRailAnimation />} />
            <Route path="/track-status" element={<TrackStatus />} />
            <Route path="/login" element={<Navigate to="/login-portal" replace />} />
            <Route path="/register" element={<Navigate to="/login-portal" replace />} />
            <Route path="/staff-signup" element={<SignUpStaff />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/passenger-login" element={<PassengerLogin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/translation-test" element={<TranslationTest />} />
            
            {/* Admin creator route - only available in development */}
            {import.meta.env.DEV && (
              <Route path="/admin-creator" element={<AdminCreator />} />
            )}

            {/* Root route - show landing page for everyone */}
            <Route 
              path="/" 
              element={<LandingPage />} 
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
              <Route path="multi-lingual" element={<MultiLingual />} />
              <Route path="staff" element={<Staff />} />
              <Route path="staff-management" element={<Staff />} />
              <Route path="staff-dashboard" element={<StaffDashboard />} />
              <Route path="staff-performance" element={<StaffPerformance />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="sentiment-analysis" element={<SentimentAnalysisPage />} />
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
              {/* <Route path="file-complaint" element={<FileComplaintWithAI />} /> */}
              <Route path="file-complaint" element={<FileComplaintMultimedia/>}></Route>
              <Route path="file-complaint-basic" element={<FileComplaint />} />
              <Route path="track-status" element={<TrackStatus />} />
              <Route path="ai-assistance" element={<AIAssistance />} />
              <Route path="real-time-support" element={<RealTimeSupport />} />
              <Route path="quick-resolution" element={<ContactStaff />} />
              <Route path="multi-lingual" element={<MultiLingual />} />
              <Route path="help" element={<Help />} />
              <Route path="feedback-form" element={<FeedbackForm />} />
              <Route path="feedback-form/:complaintId" element={<FeedbackForm />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Staff Routes */}
            <Route
              path="/staff-dashboard"
              element={
                <Layout />
              }
            >
              <Route index element={<StaffHome />} />
              <Route path="assigned-complaints" element={<StaffDashboard />} />
              <Route path="quick-resolution" element={<QuickResolution />} />
              <Route path="analytics" element={<StaffAnalytics />} />
              <Route path="profile" element={<StaffProfile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback routes for backward compatibility */}

            <Route path="/dashboard" element={<Navigate to="/admin-dashboard/dashboard" />} />
            <Route path="/file-complaint" element={<Navigate to="/user-dashboard/file-complaint" />} />
            <Route path="/smart-classification" element={<Navigate to="/admin-dashboard/smart-classification" />} />
            <Route path="/track-status" element={<Navigate to="/user-dashboard/track-status" />} />
            <Route path="/ai-assistance" element={<Navigate to="/user-dashboard/ai-assistance" />} />
            <Route path="/real-time-support" element={<Navigate to="/user-dashboard/real-time-support" />} />
            <Route path="/quick-resolution" element={<Navigate to={
              userType === 'staff'
                ? '/staff-dashboard/quick-resolution'
                : userType === 'admin'
                ? '/admin-dashboard/dashboard'
                : '/user-dashboard/quick-resolution'
            } />} />
            <Route path="/multi-lingual" element={<Navigate to={userType === 'admin' ? '/admin-dashboard/multi-lingual' : '/user-dashboard/multi-lingual'} />} />
            <Route path="/help" element={<Navigate to="/user-dashboard/help" />} />
            <Route path="/feedback-form" element={<Navigate to="/user-dashboard/feedback-form" />} />
            <Route path="/staff" element={<Navigate to="/admin-dashboard/staff" />} />
            <Route path="/settings" element={<Navigate to={userType === 'admin' ? '/admin-dashboard/settings' : '/user-dashboard/settings'} />} />
            <Route path="/profile" element={<Navigate to={userType === 'admin' ? '/admin-dashboard/profile' : '/user-dashboard/profile'} />} />
            <Route path="/sentiment-analysis" element={<Navigate to="/admin-dashboard/sentiment-analysis" />} />
            
            {/* Additional missing routes that are referenced */}
            <Route path="/tutorials" element={<Navigate to="/user-dashboard/help" />} />
            <Route path="/quick-tips" element={<Navigate to="/user-dashboard/help" />} />
            <Route path="/complaints" element={<Navigate to="/user-dashboard/file-complaint" />} />
            <Route path="/track-complaint" element={<Navigate to="/user-dashboard/track-status" />} />
            <Route path="/feedback" element={<Navigate to="/user-dashboard/feedback-form" />} />
            <Route path="/notifications" element={<Navigate to="/user-dashboard/settings" />} />
            <Route path="/faqs" element={<Navigate to="/user-dashboard/help" />} />
            <Route path="/routes" element={<Navigate to="/user-dashboard" />} />
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">You don't have permission to access this page</p>
                  <Link 
                    to="/login-portal" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            } />
            
            {/* 404 Catch-all route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
                  <div className="space-x-4">
                    <Link 
                      to="/" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Go Home
                    </Link>
                    <Link 
                      to="/login-portal" 
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            } />
          </Routes>
          <Outlet />
        </div>
      </ThemeProvider>
    </ThemeInitializer>
  );
};

export default App;