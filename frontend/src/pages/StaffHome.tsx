import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  MessageSquare,
  Bell,
  User,
  BarChart2,
  Settings,
  FileText,
  Zap,
  Award,
  Target,
  Activity
} from 'lucide-react';
import apiClient from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface StaffStats {
  totalAssigned: number;
  pending: number;
  inProgress: number;
  resolvedToday: number;
  avgResolutionTime: string;
  rating: number;
  customerSatisfaction: number;
}

interface RecentComplaint {
  id: string;
  complaint_id: string;
  description: string;
  category: string;
  priority_level: string;
  status: string;
  created_at: string;
  passenger_name?: string;
  passenger_email?: string;
}

const StaffHome = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [stats, setStats] = useState<StaffStats>({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    resolvedToday: 0,
    avgResolutionTime: '0 hours',
    rating: 0,
    customerSatisfaction: 0
  });
  
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/complaints/staff/dashboard/');
      
      if (response.data) {
        const data = response.data;
        setStats({
          totalAssigned: data.stats?.total_assigned || 0,
          pending: data.stats?.pending || 0,
          inProgress: data.stats?.in_progress || 0,
          resolvedToday: data.stats?.resolved_today || 0,
          avgResolutionTime: data.stats?.avg_resolution_time || '0 hours',
          rating: data.rating || 0,
          customerSatisfaction: data.customer_satisfaction || 0
        });
        
        setRecentComplaints(data.complaints?.slice(0, 5) || []);
        setNotifications(data.stats?.pending || 0);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cardHoverClass = isDark 
    ? 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-indigo-500' 
    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-indigo-400';

  const bgGradient = isDark 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50';

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Staff Dashboard
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back! Here's your performance overview
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30' : 'bg-gradient-to-br from-blue-50 to-blue-100'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-800/50' : 'bg-blue-200'}`}>
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Total Assigned
            </h3>
            <p className="text-3xl font-bold text-blue-500">
              {loading ? '...' : stats.totalAssigned}
            </p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/30' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'} border ${isDark ? 'border-yellow-800' : 'border-yellow-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-800/50' : 'bg-yellow-200'}`}>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Pending
            </h3>
            <p className="text-3xl font-bold text-yellow-500">
              {loading ? '...' : stats.pending}
            </p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30' : 'bg-gradient-to-br from-purple-50 to-purple-100'} border ${isDark ? 'border-purple-800' : 'border-purple-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-800/50' : 'bg-purple-200'}`}>
                <Activity className="h-6 w-6 text-purple-500" />
              </div>
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              In Progress
            </h3>
            <p className="text-3xl font-bold text-purple-500">
              {loading ? '...' : stats.inProgress}
            </p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-green-900/50 to-green-800/30' : 'bg-gradient-to-br from-green-50 to-green-100'} border ${isDark ? 'border-green-800' : 'border-green-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-green-800/50' : 'bg-green-200'}`}>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <Award className="h-5 w-5 text-green-500" />
            </div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Resolved Today
            </h3>
            <p className="text-3xl font-bold text-green-500">
              {loading ? '...' : stats.resolvedToday}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                <Clock className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg Resolution Time
                </h3>
                <p className="text-2xl font-bold text-indigo-500">
                  {loading ? '...' : stats.avgResolutionTime}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your Rating
                </h3>
                <p className="text-2xl font-bold text-yellow-500">
                  {loading ? '...' : `${stats.rating.toFixed(1)} ⭐`}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customer Satisfaction
                </h3>
                <p className="text-2xl font-bold text-green-500">
                  {loading ? '...' : `${stats.customerSatisfaction.toFixed(1)}%`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/staff-dashboard/assigned-complaints" 
              className={`flex flex-col items-center p-6 rounded-lg border transition-all duration-300 ${cardHoverClass} transform hover:translate-y-[-4px]`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg">My Complaints</h3>
              <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                View assigned complaints
              </p>
            </Link>

            <Link 
              to="/staff-dashboard/analytics" 
              className={`flex flex-col items-center p-6 rounded-lg border transition-all duration-300 ${cardHoverClass} transform hover:translate-y-[-4px]`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                <BarChart2 className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold text-lg">My Analytics</h3>
              <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                View performance metrics
              </p>
            </Link>

            <Link 
              to="/staff-dashboard/profile" 
              className={`flex flex-col items-center p-6 rounded-lg border transition-all duration-300 ${cardHoverClass} transform hover:translate-y-[-4px]`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <User className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg">My Profile</h3>
              <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Update profile details
              </p>
            </Link>

            <Link 
              to="/staff-dashboard/settings" 
              className={`flex flex-col items-center p-6 rounded-lg border transition-all duration-300 ${cardHoverClass} transform hover:translate-y-[-4px]`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Settings className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="font-semibold text-lg">Settings</h3>
              <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Configure preferences
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Recent Complaints
            </h2>
            <Link 
              to="/staff-dashboard/assigned-complaints" 
              className="text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-2"
            >
              View All
              <Activity className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No complaints assigned yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((complaint) => (
                <div 
                  key={complaint.id}
                  className={`p-5 rounded-xl border-2 ${
                    isDark 
                      ? 'bg-gradient-to-r from-gray-800/50 to-gray-800/30 border-gray-700 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20' 
                      : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-200'
                  } transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                          complaint.priority_level === 'Critical' 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                            : complaint.priority_level === 'High' 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                            : complaint.priority_level === 'Medium' 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' 
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        }`}>
                          {complaint.priority_level}
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                          complaint.status === 'Closed' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                            : complaint.status === 'In Progress' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                            : isDark 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {complaint.status}
                        </span>
                        {(complaint.complaint_id || complaint.id) && (
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium ${
                            isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            #{complaint.complaint_id || complaint.id}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {complaint.passenger_name || complaint.passenger_email || 'Unknown Passenger'}
                        </p>
                      </div>
                      <p className={`text-sm font-bold mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {complaint.category?.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase()}
                      </p>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                        {complaint.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Submitted
                        </p>
                        <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'} mt-1`}>
                          {new Date(complaint.created_at).toLocaleDateString('en-US', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffHome;
