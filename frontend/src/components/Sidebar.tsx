import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, HelpCircle, Bot, FileUp, Globe, Clock, MessageSquare, Headphones } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const { theme } = useTheme();
  
  // Get the base path (either /user-dashboard or /admin-dashboard)
  const basePath = location.pathname.includes('/admin-dashboard') ? '/admin-dashboard' : '/user-dashboard';
  
  const menuItems = [
    { path: '', icon: Home, label: 'Home' },
    { path: '/file-complaint', icon: FileUp, label: 'File Complaint' },
    { path: '/track-status', icon: Clock, label: 'Track Status' },
    { path: '/ai-assistance', icon: Bot, label: 'AI Assistance' },
    { path: '/real-time-support', icon: Headphones, label: 'Real-time Support' },
    { path: '/multi-lingual', icon: Globe, label: 'Multi-lingual' },
    { path: '/feedback-form', icon: MessageSquare, label: 'Feedback Form' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

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