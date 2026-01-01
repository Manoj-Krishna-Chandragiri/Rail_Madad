import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Trash2,
  CheckCheck,
  Filter,
  Search,
  Users,
  TrendingUp,
  FileText
} from 'lucide-react';
import apiClient from '../utils/api';

interface Notification {
  id: string;
  type: 'complaint_update' | 'assignment' | 'resolution' | 'system' | 'staff_assigned' | 'analytics' | 'user_activity';
  title: string;
  message: string;
  complaint_id?: string;
  is_read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  role_specific?: boolean;
}

const Notifications = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('passenger');

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('userRole') || 'passenger';
    setUserRole(role);
    fetchNotifications(role);
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filterType, searchTerm]);

  const fetchNotifications = async (role: string) => {
    try {
      setLoading(true);
      
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      // Try to fetch from API with real data
      try {
        const response = await apiClient.get(`/api/accounts/notifications/?role=${role}&email=${userEmail || ''}`);
        if (response.data.notifications) {
          setNotifications(response.data.notifications as Notification[]);
        } else if (Array.isArray(response.data)) {
          setNotifications(response.data);
        }
        setLoading(false);
        return;
      } catch (apiError) {
        console.log('API fetch failed, will use fallback data', apiError);
      }
      
      // Fallback: Mock data based on role if API fails
      let mockNotifications: Notification[] = [];
      
      if (role === 'admin') {
        // Admin-specific notifications
        mockNotifications = [
          {
            id: '1',
            type: 'user_activity',
            title: 'New User Registration',
            message: '5 new passengers registered in the last 24 hours.',
            is_read: false,
            created_at: new Date().toISOString(),
            priority: 'medium',
            role_specific: true
          },
          {
            id: '2',
            type: 'analytics',
            title: 'Complaint Resolution Rate Increased',
            message: 'Great news! Resolution rate improved to 85% this week, up from 78% last week.',
            is_read: false,
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            priority: 'low',
            role_specific: true
          },
          {
            id: '3',
            type: 'staff_assigned',
            title: 'Staff Performance Report Ready',
            message: 'Monthly staff performance report is now available for review.',
            is_read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            priority: 'medium',
            role_specific: true
          },
          {
            id: '4',
            type: 'complaint_update',
            title: 'High Priority Complaints',
            message: '23 complaints require immediate attention. Please assign staff members.',
            complaint_id: 'Multiple',
            is_read: true,
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            role_specific: true
          },
          {
            id: '5',
            type: 'analytics',
            title: 'Weekly Analytics Summary',
            message: 'System processed 142 complaints this week. View detailed analytics dashboard.',
            is_read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            priority: 'low',
            role_specific: true
          },
          {
            id: '6',
            type: 'system',
            title: 'System Backup Completed',
            message: 'Daily system backup completed successfully at 2:00 AM.',
            is_read: true,
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            priority: 'low'
          }
        ];
      } else if (role === 'staff') {
        // Staff-specific notifications
        mockNotifications = [
          {
            id: '1',
            type: 'assignment',
            title: 'New Complaint Assigned',
            message: 'You have been assigned complaint #12345 regarding cleanliness issues.',
            complaint_id: '12345',
            is_read: false,
            created_at: new Date().toISOString(),
            priority: 'high',
            role_specific: true
          },
          {
            id: '2',
            type: 'complaint_update',
            title: 'Complaint Deadline Approaching',
            message: 'Complaint #12340 is due for resolution in 2 hours.',
            complaint_id: '12340',
            is_read: false,
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            priority: 'high',
            role_specific: true
          },
          {
            id: '3',
            type: 'resolution',
            title: 'Resolution Approved',
            message: 'Your resolution for complaint #12338 has been approved by the admin.',
            complaint_id: '12338',
            is_read: true,
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            priority: 'medium',
            role_specific: true
          },
          {
            id: '4',
            type: 'system',
            title: 'Performance Review',
            message: 'Your monthly performance review is ready. Check your analytics dashboard.',
            is_read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            priority: 'medium',
            role_specific: true
          }
        ];
      } else {
        // Passenger-specific notifications
        mockNotifications = [
          {
            id: '1',
            type: 'complaint_update',
            title: 'Complaint Status Updated',
            message: 'Your complaint #12345 has been assigned to a staff member and is being reviewed.',
            complaint_id: '12345',
            is_read: false,
            created_at: new Date().toISOString(),
            priority: 'high'
          },
          {
            id: '2',
            type: 'resolution',
            title: 'Complaint Resolved',
            message: 'Your complaint #12340 regarding cleanliness has been marked as resolved. Please provide feedback.',
            complaint_id: '12340',
            is_read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            priority: 'medium'
          },
          {
            id: '3',
            type: 'assignment',
            title: 'Staff Assigned',
            message: 'A staff member has been assigned to handle your complaint #12342.',
            complaint_id: '12342',
            is_read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            priority: 'medium'
          },
          {
            id: '4',
            type: 'system',
            title: 'Service Update',
            message: 'New AI-powered assistance feature is now available. Try it out!',
            is_read: true,
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            priority: 'low'
          }
        ];
      }
      
      setNotifications(mockNotifications);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'unread') {
        filtered = filtered.filter(n => !n.is_read);
      } else {
        filtered = filtered.filter(n => n.type === filterType);
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'complaint_update':
        return <MessageSquare className="h-6 w-6 text-blue-500" />;
      case 'assignment':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'resolution':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'system':
        return <AlertTriangle className="h-6 w-6 text-purple-500" />;
      case 'staff_assigned':
        return <Users className="h-6 w-6 text-indigo-500" />;
      case 'analytics':
        return <TrendingUp className="h-6 w-6 text-emerald-500" />;
      case 'user_activity':
        return <FileText className="h-6 w-6 text-cyan-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const bgGradient = isDark 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userRole === 'admin' 
                  ? 'Stay updated with system activity and admin alerts' 
                  : userRole === 'staff'
                  ? 'Track your assigned complaints and deadlines'
                  : 'Stay updated with your complaint status'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <CheckCheck className="h-5 w-5" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="complaint_update">Complaint Updates</option>
                {userRole !== 'admin' && <option value="assignment">Assignments</option>}
                <option value="resolution">Resolutions</option>
                {userRole === 'admin' && <option value="analytics">Analytics</option>}
                {userRole === 'admin' && <option value="user_activity">User Activity</option>}
                {userRole === 'admin' && <option value="staff_assigned">Staff</option>}
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
              <Bell className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No notifications found
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${
                  !notification.is_read ? 'border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex-shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className={`p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 transition-colors`}
                            title="Mark as read"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 transition-colors`}
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {getTimeAgo(notification.created_at)}
                      </span>
                      {notification.complaint_id && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          #{notification.complaint_id}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
