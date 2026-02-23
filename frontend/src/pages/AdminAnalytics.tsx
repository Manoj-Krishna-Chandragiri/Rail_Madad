import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Clock,
  AlertTriangle,
  Target,
  Award,
  Activity,
  Calendar,
  Filter
} from 'lucide-react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface AnalyticsData {
  overview: {
    totalComplaints: number;
    resolvedComplaints: number;
    pendingComplaints: number;
    avgResolutionTime: string;
    resolutionRate: number;
    slaBreaches: number;
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
  backlogAging: {
    label: string;
    count: number;
    percentage: number;
  }[];
  avgResolutionByCategory: {
    category: string;
    avgHours: number;
    resolvedCount: number;
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
  const [authReady, setAuthReady] = useState(false);

  // Wait for Firebase auth to initialize
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('AdminAnalytics: Auth state changed, user:', user?.email);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Fetch analytics when auth is ready or timeRange changes
  useEffect(() => {
    if (authReady) {
      fetchAnalytics();
    }
  }, [timeRange, authReady]);

  const getStartDate = (range: string) => {
    const now = new Date();
    const start = new Date(now);
    switch (range) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'quarter':
        start.setDate(now.getDate() - 90);
        break;
      case 'year':
        start.setDate(now.getDate() - 365);
        break;
      case 'month':
      default:
        start.setDate(now.getDate() - 30);
        break;
    }
    return start;
  };

  const normalizeStatus = (status?: string) => (status || '').toLowerCase();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get fresh Firebase ID token
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.error('AdminAnalytics: No user logged in');
        setLoading(false);
        return;
      }

      console.log('AdminAnalytics: Getting ID token for user:', currentUser.email);
      const token = await currentUser.getIdToken(true); // Force refresh
      console.log('AdminAnalytics: Got token, length:', token.length);
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch real data from backend API
      console.log('AdminAnalytics: Fetching data from:', `${API_BASE_URL}/api/complaints/admin/complaints/`);
      const [dashboardRes, complaintsRes, staffRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/complaints/admin/dashboard-stats/`, { headers }).catch((err) => {
          console.error('Dashboard stats error:', err.response?.status, err.response?.data);
          return null;
        }),
        axios.get(`${API_BASE_URL}/api/complaints/admin/complaints/`, { headers }).catch((err) => {
          console.error('Complaints error:', err.response?.status, err.response?.data);
          return null;
        }),
        axios.get(`${API_BASE_URL}/api/complaints/admin/staff/`, { headers }).catch((err) => {
          console.error('Staff error:', err.response?.status, err.response?.data);
          return null;
        })
      ]);
      
      const dashboardData = dashboardRes?.data || {};
      const complaints = complaintsRes?.data || [];
      const staffList = staffRes?.data || [];

      const now = new Date();
      const startDate = getStartDate(timeRange);
      const filteredComplaints = complaints.filter((complaint: { created_at?: string }) => {
        if (!complaint.created_at) return true;
        const createdAt = new Date(complaint.created_at);
        return createdAt >= startDate && createdAt <= now;
      });
      
      // Calculate category stats from complaints
      const categoryMap: { [key: string]: number } = {};
      const priorityMap: { [key: string]: number } = {};
      
      filteredComplaints.forEach((complaint: { category?: string; type?: string; priority?: string }) => {
        const category = complaint.category || complaint.type || 'Other';
        const priority = complaint.priority || 'Medium';
        categoryMap[category] = (categoryMap[category] || 0) + 1;
        priorityMap[priority] = (priorityMap[priority] || 0) + 1;
      });

      const totalComplaints = dashboardData.totalComplaints || filteredComplaints.length || 0;
      
      const categoryStats = Object.entries(categoryMap).map(([category, count]) => ({
        category,
        count,
        percentage: totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0
      }));
      
      const priorityStats = Object.entries(priorityMap).map(([priority, count]) => ({
        priority,
        count,
        percentage: totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0
      }));
      
      // Process monthly trends from dashboard data (fallback to computed)
      const trends = dashboardData.complaintTrends || [];
      const monthlyTrend = trends.length > 0 ? processMonthlyTrend(trends) : buildMonthlyTrend(complaints);

      // Resolution calculations
      const resolvedComplaints = filteredComplaints.filter((c: { status?: string }) => normalizeStatus(c.status) === 'closed');
      const pendingComplaints = filteredComplaints.filter((c: { status?: string }) => {
        const s = normalizeStatus(c.status);
        return s === 'open' || s === 'in progress';
      });

      const avgResolutionTime = calculateAverageResolutionTime(resolvedComplaints);
      const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints.length / totalComplaints) * 100) : 0;

      const backlogAging = buildBacklogAging(pendingComplaints, pendingComplaints.length);
      const avgResolutionByCategory = buildAvgResolutionByCategory(resolvedComplaints);
      const slaBreaches = calculateSlaBreaches(filteredComplaints);
      
      // Get staff performance - use full_name field from the API
      const topPerformers = staffList
        .filter((staff: { status?: string }) => staff.status === 'active')
        .slice(0, 3)
        .map((staff: { full_name?: string; name?: string; resolved_complaints?: number; rating?: number }) => ({
          name: staff.full_name || staff.name || 'Staff Member',
          resolved: staff.resolved_complaints || 0,
          rating: staff.rating || 0
        }));
      
      const analyticsData: AnalyticsData = {
        overview: {
          totalComplaints: totalComplaints,
          resolvedComplaints: dashboardData.closedComplaints || resolvedComplaints.length,
          pendingComplaints: (dashboardData.openComplaints || 0) + (dashboardData.inProgressComplaints || 0) || pendingComplaints.length,
          avgResolutionTime: dashboardData.averageResolutionTime || avgResolutionTime,
          resolutionRate: dashboardData.resolutionRate || resolutionRate,
          slaBreaches
        },
        categoryStats: categoryStats.length > 0 ? categoryStats : [
          { category: 'No Data', count: 0, percentage: 0 }
        ],
        priorityStats: priorityStats.length > 0 ? priorityStats : [
          { priority: 'No Data', count: 0, percentage: 0 }
        ],
        backlogAging,
        avgResolutionByCategory,
        monthlyTrend,
        staffPerformance: {
          topPerformers: topPerformers.length > 0 ? topPerformers : [
            { name: 'No staff data', resolved: 0, rating: 0 }
          ]
        }
      };
      
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      // Set empty data on error
      setAnalytics({
        overview: {
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          avgResolutionTime: '0h',
          resolutionRate: 0,
          slaBreaches: 0
        },
        categoryStats: [{ category: 'Error loading', count: 0, percentage: 0 }],
        priorityStats: [{ priority: 'Error loading', count: 0, percentage: 0 }],
        backlogAging: [],
        avgResolutionByCategory: [],
        monthlyTrend: [],
        staffPerformance: { topPerformers: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to process monthly trends
  const processMonthlyTrend = (trends: { date: string; closed: number; open: number; in_progress: number }[]) => {
    if (!trends || trends.length === 0) {
      // Return last 6 months with 0 data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map(month => ({ month, resolved: 0, received: 0 }));
    }
    
    // Group by month
    const monthMap: { [key: string]: { resolved: number; received: number } } = {};
    
    trends.forEach(day => {
      const date = new Date(day.date);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { resolved: 0, received: 0 };
      }
      
      monthMap[monthKey].resolved += day.closed || 0;
      monthMap[monthKey].received += (day.open || 0) + (day.in_progress || 0) + (day.closed || 0);
    });
    
    return Object.entries(monthMap).map(([month, data]) => ({
      month,
      resolved: data.resolved,
      received: data.received
    }));
  };

  const calculateAverageResolutionTime = (resolvedComplaints: { created_at?: string; resolved_at?: string; updated_at?: string }[]) => {
    if (!resolvedComplaints.length) return '0h';
    let totalHours = 0;
    let count = 0;

    resolvedComplaints.forEach((c) => {
      if (!c.created_at) return;
      const createdAt = new Date(c.created_at);
      const resolvedAt = c.resolved_at ? new Date(c.resolved_at) : c.updated_at ? new Date(c.updated_at) : null;
      if (!resolvedAt) return;
      const diffHours = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      if (!Number.isNaN(diffHours) && diffHours >= 0) {
        totalHours += diffHours;
        count += 1;
      }
    });

    const avgHours = count > 0 ? totalHours / count : 0;
    return `${avgHours.toFixed(1)}h`;
  };

  const buildMonthlyTrend = (allComplaints: { created_at?: string; resolved_at?: string; updated_at?: string; status?: string }[]) => {
    const months: { key: string; label: string; received: number; resolved: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const label = date.toLocaleString('default', { month: 'short' });
      months.push({ key, label, received: 0, resolved: 0 });
    }

    const monthMap = new Map(months.map((m) => [m.key, m]));

    allComplaints.forEach((c) => {
      if (c.created_at) {
        const createdAt = new Date(c.created_at);
        const key = `${createdAt.getFullYear()}-${createdAt.getMonth() + 1}`;
        const bucket = monthMap.get(key);
        if (bucket) bucket.received += 1;
      }

      const status = normalizeStatus(c.status);
      const resolvedAt = c.resolved_at ? new Date(c.resolved_at) : c.updated_at ? new Date(c.updated_at) : null;
      if (status === 'closed' && resolvedAt) {
        const key = `${resolvedAt.getFullYear()}-${resolvedAt.getMonth() + 1}`;
        const bucket = monthMap.get(key);
        if (bucket) bucket.resolved += 1;
      }
    });

    return months.map((m) => ({ month: m.label, resolved: m.resolved, received: m.received }));
  };

  const buildBacklogAging = (pendingComplaints: { created_at?: string }[], totalPending: number) => {
    const buckets = [
      { label: '0-1 day', min: 0, max: 1, count: 0 },
      { label: '1-3 days', min: 1, max: 3, count: 0 },
      { label: '3-7 days', min: 3, max: 7, count: 0 },
      { label: '7-14 days', min: 7, max: 14, count: 0 },
      { label: '14+ days', min: 14, max: Infinity, count: 0 }
    ];

    const now = new Date();
    pendingComplaints.forEach((c) => {
      if (!c.created_at) return;
      const createdAt = new Date(c.created_at);
      const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const bucket = buckets.find((b) => ageDays >= b.min && ageDays < b.max);
      if (bucket) bucket.count += 1;
    });

    return buckets.map((b) => ({
      label: b.label,
      count: b.count,
      percentage: totalPending > 0 ? Math.round((b.count / totalPending) * 100) : 0
    }));
  };

  const buildAvgResolutionByCategory = (resolvedComplaints: { category?: string; type?: string; created_at?: string; resolved_at?: string; updated_at?: string }[]) => {
    const categoryMap: { [key: string]: { totalHours: number; count: number } } = {};

    resolvedComplaints.forEach((c) => {
      if (!c.created_at) return;
      const createdAt = new Date(c.created_at);
      const resolvedAt = c.resolved_at ? new Date(c.resolved_at) : c.updated_at ? new Date(c.updated_at) : null;
      if (!resolvedAt) return;
      const diffHours = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      if (Number.isNaN(diffHours) || diffHours < 0) return;
      const category = c.category || c.type || 'Other';

      if (!categoryMap[category]) {
        categoryMap[category] = { totalHours: 0, count: 0 };
      }
      categoryMap[category].totalHours += diffHours;
      categoryMap[category].count += 1;
    });

    return Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        avgHours: data.count > 0 ? Number((data.totalHours / data.count).toFixed(1)) : 0,
        resolvedCount: data.count
      }))
      .sort((a, b) => b.avgHours - a.avgHours)
      .slice(0, 6);
  };

  const calculateSlaBreaches = (allComplaints: { priority?: string; created_at?: string; resolved_at?: string; updated_at?: string; status?: string }[]) => {
    const slaHoursMap: { [key: string]: number } = {
      Critical: 24,
      High: 48,
      Medium: 72,
      Low: 120
    };

    const now = new Date();
    let breaches = 0;

    allComplaints.forEach((c) => {
      if (!c.created_at) return;
      const createdAt = new Date(c.created_at);
      const status = normalizeStatus(c.status);
      const resolvedAt = status === 'closed'
        ? c.resolved_at ? new Date(c.resolved_at) : c.updated_at ? new Date(c.updated_at) : now
        : now;
      const diffHours = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      const priority = c.priority || 'Medium';
      const sla = slaHoursMap[priority] || slaHoursMap.Medium;
      if (!Number.isNaN(diffHours) && diffHours > sla) {
        breaches += 1;
      }
    });

    return breaches;
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

  const maxMonthlyValue = Math.max(
    1,
    ...analytics.monthlyTrend.map((m) => Math.max(m.received, m.resolved))
  );

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Based on selected time range
            </p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-amber-900/50 to-amber-800/30' : 'bg-gradient-to-br from-amber-50 to-amber-100'} border ${isDark ? 'border-amber-800' : 'border-amber-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-amber-800/50' : 'bg-amber-200'}`}>
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <TrendingDown className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              Pending Complaints
            </h3>
            <p className="text-3xl font-bold text-amber-500">
              {analytics.overview.pendingComplaints}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Open + In Progress
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
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Avg across resolved complaints
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

        {/* Operational Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                Backlog Aging
              </h2>
              <Calendar className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="space-y-4">
              {analytics.backlogAging.length > 0 ? (
                analytics.backlogAging.map((bucket, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {bucket.label}
                      </span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {bucket.count} ({bucket.percentage}%)
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                        style={{ width: `${bucket.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No backlog data available.</p>
              )}
            </div>
          </div>

          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                Resolution Risk
              </h2>
              <Award className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-red-900/30' : 'bg-red-50'} border ${isDark ? 'border-red-800' : 'border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>SLA Breaches</p>
                  <p className="text-2xl font-bold text-red-500">{analytics.overview.slaBreaches}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Slowest Categories (Avg Resolution Time)
            </h3>
            <div className="space-y-3">
              {analytics.avgResolutionByCategory.length > 0 ? (
                analytics.avgResolutionByCategory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.category}</span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{item.avgHours}h</span>
                  </div>
                ))
              ) : (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No resolution data available.</p>
              )}
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
                      style={{ height: `${(month.received / maxMonthlyValue) * 100}%` }}
                      title={`Received: ${month.received}`}
                    />
                    <div
                      className="w-8 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                      style={{ height: `${(month.resolved / maxMonthlyValue) * 100}%` }}
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
