import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, HelpCircle, Bot, FileUp, Globe, Clock, MessageSquare, Headphones, Users, BarChart2, Bell, UserCog, TrendingUp, ClipboardList, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const { theme } = useTheme();
  const [userRole, setUserRole] = useState<string>('passenger');
  
  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'passenger';
    setUserRole(role);
  }, [location]);
  
  // Get the base path (either /user-dashboard, /admin-dashboard, or /staff-dashboard)
  const basePath = location.pathname.includes('/admin-dashboard') 
    ? '/admin-dashboard' 
    : location.pathname.includes('/staff-dashboard')
    ? '/staff-dashboard'
    : '/user-dashboard';
  
  // Admin menu items
  const adminMenuItems = [
    { path: '', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: BarChart2, label: 'Dashboard' },
    { path: '/smart-classification', icon: MessageSquare, label: 'Smart Classification' },
    { path: '/staff-management', icon: UserCog, label: 'Staff Management' },
    { path: '/staff-performance', icon: ClipboardList, label: 'Staff Performance' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/user-management', icon: Users, label: 'User Management' },
    { path: '/sentiment-analysis', icon: MessageSquare, label: 'Sentiment Analysis' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Staff menu items
  const staffMenuItems = [
    { path: '', icon: Home, label: 'Home' },
    { path: '/assigned-complaints', icon: ClipboardList, label: 'My Complaints' },
    { path: '/quick-resolution', icon: TrendingUp, label: 'Quick Resolution' },
    { path: '/analytics', icon: BarChart2, label: 'My Analytics' },
    { path: '/profile', icon: User, label: 'My Profile' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Passenger menu items
  const passengerMenuItems = [
    { path: '', icon: Home, label: 'Home' },
    { path: '/file-complaint', icon: FileUp, label: 'File Complaint' },
    { path: '/track-status', icon: Clock, label: 'Track Status' },
    { path: '/ai-assistance', icon: Bot, label: 'AI Assistance' },
    { path: '/real-time-support', icon: Headphones, label: 'Real-time Support' },
    { path: '/multi-lingual', icon: Globe, label: 'Multi-lingual' },
    { path: '/feedback-form', icon: MessageSquare, label: 'Feedback Form' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  // Select appropriate menu items based on user role
  const menuItems = userRole === 'admin' 
    ? adminMenuItems 
    : userRole === 'staff'
    ? staffMenuItems
    : passengerMenuItems;

  const handleMenuItemClick = () => {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  // Listen for custom close sidebar event
  React.useEffect(() => {
    const handleCloseSidebar = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('closeSidebar', handleCloseSidebar);
    
    return () => {
      window.removeEventListener('closeSidebar', handleCloseSidebar);
    };
  }, [setIsOpen]);

  return (
    <aside className={`fixed left-0 h-full w-64 pt-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-700'} text-white transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="flex-grow overflow-y-auto">
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const fullPath = basePath + item.path;
              const isActive = location.pathname === fullPath;
              
              return (
                <Link
                  key={item.path}
                  to={fullPath}
                  onClick={handleMenuItemClick}
                  className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg transition-colors ${
                    isActive 
                      ? theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-800'
                      : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-600'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;