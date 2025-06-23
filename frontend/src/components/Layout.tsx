import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme } = useTheme();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'user' | null>(null);

  // Function to get user type
  const getUserType = (): 'admin' | 'user' | null => {
    const userRole = localStorage.getItem('userRole');
    const adminToken = localStorage.getItem('adminToken');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    
    if (!isAuthenticated) return null;
    
    // Check for admin status
    if (adminToken && userRole === 'admin') return 'admin';
    if (userEmail === 'adm.railmadad@gmail.com') return 'admin';
    if (userRole === 'admin') return 'admin';
    
    // Default to user for authenticated users
    if (userRole === 'passenger' || userRole === 'user' || isAuthenticated) return 'user';
    
    return null;
  };

  // Check user type on component mount and localStorage changes
  useEffect(() => {
    const checkUserType = () => {
      const type = getUserType();
      setUserType(type);
    };

    checkUserType();

    // Listen for localStorage changes
    const handleStorageChange = () => {
      checkUserType();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when localStorage is changed programmatically
    window.addEventListener('userTypeChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userTypeChanged', handleStorageChange);
    };
  }, []);

  // Simulate page loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Determine which sidebar to render
  const renderSidebar = () => {
    if (userType === 'admin') {
      return <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />;
    } else {
      return <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} relative transition-colors duration-300`}>
      {/* Fixed navbar with higher z-index */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Conditional Sidebar rendering based on user type */}
      <div className="fixed left-0 top-0 z-40 h-full">
        {renderSidebar()}
      </div>

      {/* Main content with top padding for navbar and left margin for sidebar */}
      <main 
        className={`pt-16 transition-all duration-500 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        } ${
          isPageLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Loader overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
};

export default Layout;