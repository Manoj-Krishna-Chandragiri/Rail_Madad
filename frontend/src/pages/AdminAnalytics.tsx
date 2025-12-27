import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart2,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Target,
  Award,
  Activity,
  Calendar,
  Filter
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface AnalyticsData {
  overview: {
    totalComplaints: number;
    resolvedComplaints: number;
    pendingComplaints: number;
    avgResolutionTime: string;
    resolutionRate: number;
    customerSatisfaction: number;
  };
  categoryStats: {
    category: string;
    count: number;
    percentage: number;
  }[];
  priorityStats: {
    priority: string;
    count: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    resolved: number;
    received: number;
  }[];
  staffPerformance: {
    topPerformers: {
      name: string;
      resolved: number;
      rating: number;
    }[];
  };
}

const AdminAnalytics = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // This is a mock implementation - replace with actual API call
      const mockData: AnalyticsData = {
        overview: {
          totalComplaints: 1250,
          resolvedComplaints: 980,
          pendingComplaints: 270,
          avgResolutionTime: '4.2 hours',
          resolutionRate: 78.4,
          customerSatisfaction: 86.5
        },
        categoryStats: [
          { category: 'Infrastructure', count: 450, percentage: 36 },
          { category: 'Service Quality', count: 325, percentage: 26 },
          { category: 'Cleanliness', count: 275, percentage: 22 },
          { category: 'Staff Behavior', count: 200, percentage: 16 }
        ],
        priorityStats: [
          { priority: 'Critical', count: 125, percentage: 10 },
          { priority: 'High', count: 375, percentage: 30 },
          { priority: 'Medium', count: 500, percentage: 40 },
          { priority: 'Low', count: 250, percentage: 20 }
        ],
        monthlyTrend: [
          { month: 'Jan', resolved: 85, received: 110 },
          { month: 'Feb', resolved: 92, received: 105 },
          { month: 'Mar', resolved: 88, received: 120 },
          { month: 'Apr', resolved: 95, received: 100 },
          { month: 'May', resolved: 102, received: 115 },
          { month: 'Jun', resolved: 98, received: 108 }
        ],
        staffPerformance: {
          topPerformers: [
            { name: 'Rajesh Kumar', resolved: 145, rating: 4.8 },
            { name: 'Priya Sharma', resolved: 132, rating: 4.7 },
            { name: 'Amit Patel', resolved: 128, rating: 4.6 }
          ]
        }
      };
      
      setAnalytics(mockData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const bgGradient = isDark 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50';

  if (loading || !analytics) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                Analytics Dashboard
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Comprehensive insights into complaint management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Filter className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30' : 'bg-gradient-to-br from-blue-50 to-blue-100'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-800/50' : 'bg-blue-200'}`}>
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Total Complaints
            </h3>
            <p className="text-3xl font-bold text-blue-500">
              {analytics.overview.totalComplaints}
            </p>
            <p className="text-xs text-green-500 mt-1">
              +12% from last period
            </p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-green-900/50 to-green-800/30' : 'bg-gradient-to-br from-green-50 to-green-100'} border ${isDark ? 'border-green-800' : 'border-green-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-green-800/50' : 'bg-green-200'}`}>
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Resolved
            </h3>
            <p className="text-3xl font-bold text-green-500">
              {analytics.overview.resolvedComplaints}
            </p>
            <p className="text-xs text-green-500 mt-1">
              {analytics.overview.resolutionRate}% success rate
            </p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/30' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'} border ${isDark ? 'border-yellow-800' : 'border-yellow-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-800/50' : 'bg-yellow-200'}`}>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <TrendingDown className="h-5 w-5 text-green-500" />
            </div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Avg Resolution Time
            </h3>
            <p className="text-3xl font-bold text-yellow-500">
              {analytics.overview.avgResolutionTime}
            </p>
            <p className="text-xs text-green-500 mt-1">
              -8% improvement
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Complaints by Category
            </h2>
            <div className="space-y-4">
              {analytics.categoryStats.map((cat, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {cat.category}
                    </span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Complaints by Priority
            </h2>
            <div className="space-y-4">
              {analytics.priorityStats.map((priority, index) => {
                const colors = {
                  'Critical': 'from-red-500 to-red-600',
                  'High': 'from-orange-500 to-orange-600',
                  'Medium': 'from-yellow-500 to-yellow-600',
                  'Low': 'from-green-500 to-green-600'
                };
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {priority.priority}
                      </span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {priority.count} ({priority.percentage}%)
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${colors[priority.priority as keyof typeof colors]}`}
                        style={{ width: `${priority.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Monthly Trend
          </h2>
          <div className="grid grid-cols-6 gap-4">
            {analytics.monthlyTrend.map((month, index) => (
              <div key={index} className="text-center">
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="flex items-end gap-1 h-32">
                    <div
                      className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                      style={{ height: `${(month.received / 120) * 100}%` }}
                      title={`Received: ${month.received}`}
                    />
                    <div
                      className="w-8 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                      style={{ height: `${(month.resolved / 120) * 100}%` }}
                      title={`Resolved: ${month.resolved}`}
                    />
                  </div>
                </div>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {month.month}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Received</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Resolved</span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Top Performing Staff
          </h2>
          <div className="space-y-4">
            {analytics.staffPerformance.topPerformers.map((staff, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-400'} transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-orange-600'
                  } text-white font-bold`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {staff.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {staff.resolved} complaints resolved
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-bold text-yellow-500">
                    {staff.rating} ⭐
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
