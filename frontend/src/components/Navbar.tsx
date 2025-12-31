import { useState, useEffect, useRef } from 'react';
import { Bell, User, CheckCircle, X, MessageSquare, Clock, TrendingUp, Users, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import GlobalLanguageSelector from './GlobalLanguageSelector';
import apiClient from '../utils/api';

interface NavbarProps {
  toggleSidebar: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  complaint_id?: string;
  is_read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userRole, setUserRole] = useState<string>('passenger');
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'passenger';
    setUserRole(role);
    fetchNotifications(role);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async (role: string) => {
    try {
      const response = await apiClient.get(`/api/accounts/notifications/?role=${role}`);
      setNotifications(response.data.slice(0, 5)); // Only show 5 recent notifications
    } catch (error) {
      // Use mock data if API fails
      const mockData = getMockNotifications(role);
      setNotifications(mockData.slice(0, 5));
    }
  };

  const getMockNotifications = (role: string): Notification[] => {
    if (role === 'admin') {
      return [
        {
          id: '1',
          type: 'user_activity',
          title: 'New User Registration',
          message: '5 new passengers registered today.',
          is_read: false,
          created_at: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: '2',
          type: 'analytics',
          title: 'Resolution Rate Up',
          message: 'Resolution rate improved to 85%.',
          is_read: false,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          priority: 'low'
        },
        {
          id: '3',
          type: 'complaint_update',
          title: 'High Priority Complaints',
          message: '23 complaints need attention.',
          is_read: true,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'high'
        }
      ];
    } else if (role === 'staff') {
      return [
        {
          id: '1',
          type: 'assignment',
          title: 'New Complaint Assigned',
          message: 'Complaint #12345 assigned to you.',
          complaint_id: '12345',
          is_read: false,
          created_at: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '2',
          type: 'complaint_update',
          title: 'Deadline Approaching',
          message: 'Complaint #12340 due in 2 hours.',
          complaint_id: '12340',
          is_read: false,
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          priority: 'high'
        }
      ];
    } else {
      return [
        {
          id: '1',
          type: 'complaint_update',
          title: 'Complaint Status Updated',
          message: 'Your complaint #12345 is being reviewed.',
          complaint_id: '12345',
          is_read: false,
          created_at: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '2',
          type: 'resolution',
          title: 'Complaint Resolved',
          message: 'Your complaint #12340 has been resolved.',
          complaint_id: '12340',
          is_read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'medium'
        }
      ];
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'complaint_update':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'assignment':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolution':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'analytics':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'user_activity':
        return <FileText className="h-4 w-4 text-cyan-500" />;
      case 'staff_assigned':
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login-portal');
  };

  const getUserType = (): 'admin' | 'user' | 'staff' | null => {
    const userRole = localStorage.getItem('userRole');
    const adminToken = localStorage.getItem('adminToken');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isStaff = localStorage.getItem('isStaff') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const adminEmails = ['adm.railmadad@gmail.com', 'admin@railmadad.in'];
    
    if (!isAuthenticated) return null;
    
    // Check for admin first (highest priority)
    if (adminToken && userRole === 'admin') return 'admin';
    if (userEmail && adminEmails.includes(userEmail)) return 'admin';
    if (userRole === 'admin') return 'admin';
    
    // Check for staff (must have both userRole='staff' AND isStaff=true)
    if (userRole === 'staff' && isStaff) return 'staff';
    
    // Check for passenger/user
    if (userRole === 'passenger' || userRole === 'user') return 'user';
    
    // Default to user if authenticated
    if (isAuthenticated) return 'user';
    
    return null;
  };

  const handleProfileNavigation = (path: string) => {
    setShowProfile(false);
    const userType = getUserType();
    
    // Navigate to the correct nested route based on user type
    if (userType === 'admin') {
      navigate(`/admin-dashboard${path}`);
    } else if (userType === 'staff') {
      navigate(`/staff-dashboard${path}`);
    } else {
      navigate(`/user-dashboard${path}`);
    }
    
    // Dispatch custom event to close sidebar on mobile
    window.dispatchEvent(new CustomEvent('closeSidebar'));
  };

  return (
    <nav className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md p-2 sm:p-4 w-full`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4 z-50">
          <button onClick={toggleSidebar} className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <img src="https://railmadad-dashboard.web.app/assets/logo-railmadad-B9R2Xeqc.png" alt="Rail Madad" className="h-6 sm:h-8" />
          <h1 className="text-sm sm:text-xl font-semibold hidden sm:block">Rail Madad Dashboard</h1>
          <h1 className="text-sm font-semibold sm:hidden">Rail Madad</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Global Language Selector */}
          <GlobalLanguageSelector />
          
          <div className="relative" ref={notificationsRef}>
            <button 
              className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg relative`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] text-white items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </button>
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 sm:w-96 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} z-50 max-h-[500px] overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'text-indigo-400 hover:bg-gray-700' : 'text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          const userType = getUserType();
                          const basePath = userType === 'admin' ? '/admin-dashboard' : userType === 'staff' ? '/staff-dashboard' : '/user-dashboard';
                          navigate(`${basePath}/notifications`);
                        }}
                        className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'text-indigo-400 hover:bg-gray-700' : 'text-indigo-600 hover:bg-indigo-50'}`}
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className={`h-12 w-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 transition-colors ${
                            !notification.is_read 
                              ? theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-indigo-50 hover:bg-indigo-100' 
                              : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} flex-shrink-0`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} truncate`}>
                                  {notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className={`flex-shrink-0 p-1 rounded transition-colors ${
                                      theme === 'dark' ? 'hover:bg-gray-600 text-indigo-400' : 'hover:bg-gray-200 text-indigo-600'
                                    }`}
                                    title="Mark as read"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              
                              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {getTimeAgo(notification.created_at)}
                                </span>
                                {notification.complaint_id && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                    #{notification.complaint_id}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {notification.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative" ref={profileRef}>
            <button 
              className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}
              onClick={() => setShowProfile(!showProfile)}
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            {showProfile && (
              <div className={`absolute right-0 mt-2 w-48 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border border-gray-700 p-4 z-50`}>
                <div className="space-y-2">
                  <div className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded cursor-pointer`}
                    onClick={() => handleProfileNavigation('/profile')}
                  >
                    <p className="text-sm font-medium">My Profile</p>
                  </div>
                  <div className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded cursor-pointer`}
                    onClick={() => handleProfileNavigation('/settings')}
                  >
                    <p className="text-sm font-medium">Settings</p>
                  </div>
                  <div 
                    className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded cursor-pointer`}
                    onClick={handleLogout}
                  >
                    <p className="text-sm font-medium text-red-600">Logout</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;