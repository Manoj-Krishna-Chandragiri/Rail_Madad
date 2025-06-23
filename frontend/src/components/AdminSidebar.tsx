import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, Brain, Headphones, Zap, Globe, BarChart2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AdminSidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const { theme } = useTheme();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: BarChart2, label: 'Dashboard' },
    { path: '/smart-classification', icon: Brain, label: 'Smart Classification' },
    { path: '/real-time-support', icon: Headphones, label: 'Real-time Support' },
    { path: '/quick-resolution', icon: Zap, label: 'Quick Resolution' },
    { path: '/multi-lingual', icon: Globe, label: 'Multi-lingual' },
    { path: '/staff', icon: Users, label: 'Staff Management' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <aside className={`fixed left-0 h-full w-64 pt-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-700'} text-white transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="flex-grow overflow-y-auto">
          <div className="space-y-6 p-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-800'
                      : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-indigo-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
