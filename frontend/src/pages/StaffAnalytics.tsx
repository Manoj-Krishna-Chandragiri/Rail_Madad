import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart2,
  Clock,
  Target,
  Award,
  Calendar,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import apiClient from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface MonthlyPerformance {
  month: number;
  year: number;
  tickets_resolved: number;
  avg_resolution_time: number;
  customer_satisfaction: number;
  complaints_received: number;
}

interface FeedbackStats {
  average_rating: number;
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  feedback_rate: number;
}

interface ComplaintStats {
  total_assigned: number;
  total_resolved: number;
  resolution_rate: number;
  active_tickets: number;
}

interface RecentFeedback {
  rating: number;
  sentiment: string;
  feedback_message: string;
  submitted_at: string;
  name: string;
}

interface StaffAnalyticsData {
  staff_name: string;
  staff_id: number;
  department: string;
  location: string;
  current_rating: number;
  feedback_stats: FeedbackStats;
  complaint_stats: ComplaintStats;
  recent_feedback: RecentFeedback[];
}

interface AnalyticsData {
  current_month: MonthlyPerformance;
  last_month: MonthlyPerformance;
  yearly_stats: {
    total_resolved: number;
    avg_rating: number;
    avg_satisfaction: number;
    total_complaints: number;
  };
  monthly_trend: MonthlyPerformance[];
}

const StaffAnalytics = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [staffAnalytics, setStaffAnalytics] = useState<StaffAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [staffId, setStaffId] = useState<number | null>(null);

  useEffect(() => {
    // Get staff ID from profile or localStorage
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      // Fetch staff profile to get ID
      fetchStaffId(userEmail);
    }
  }, []);

  useEffect(() => {
    if (staffId) {
      fetchStaffAnalytics();
    }
  }, [staffId]);
  
  useEffect(() => {
    if (staffAnalytics) {
      fetchAnalytics();
    }
  }, [staffAnalytics]);

  const fetchStaffId = async (email: string) => {
    try {
      // Get staff ID from the staff list based on email
      const response = await apiClient.get('/api/complaints/staff/');
      const staffMember = response.data.find((s: any) => s.email === email);
      if (staffMember) {
        setStaffId(staffMember.id);
      }
    } catch (err) {
      console.error('Failed to fetch staff ID:', err);
    }
  };

  const fetchStaffAnalytics = async () => {
    if (!staffId) return;
    
    try {
      const response = await apiClient.get(`/api/complaints/staff/${staffId}/analytics/`);
      setStaffAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch staff analytics:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Use staffAnalytics data that we already have
      if (staffAnalytics) {
        const complaintStats = staffAnalytics.complaint_stats;
        const feedbackStats = staffAnalytics.feedback_stats;
        
        // Create mock monthly data from current stats
        const currentMonthData = {
          tickets_resolved: complaintStats.total_resolved || 0,
          avg_resolution_time: staffAnalytics.avg_resolution_time_hours || 0,
          customer_satisfaction: complaintStats.customer_satisfaction || 0,
          complaints_received: complaintStats.total_assigned || 0
        };
        
        setAnalytics({
          current_month: currentMonthData,
          last_month: {}, // No historical data yet
          yearly_stats: {
            total_resolved: complaintStats.total_resolved || 0,
            avg_rating: feedbackStats.average_rating || 0,
            avg_satisfaction: complaintStats.customer_satisfaction || 0,
            total_complaints: complaintStats.total_assigned || 0
          },
          monthly_trend: [currentMonthData]
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

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

  const currentMonth = analytics?.current_month;
  const lastMonth = analytics?.last_month;
  const yearlyStats = analytics?.yearly_stats;

  const resolvedChange = currentMonth && lastMonth 
    ? calculateChange(currentMonth.tickets_resolved, lastMonth.tickets_resolved)
    : { value: 0, isPositive: true };

  const satisfactionChange = currentMonth && lastMonth 
    ? calculateChange(currentMonth.customer_satisfaction, lastMonth.customer_satisfaction)
    : { value: 0, isPositive: true };

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Performance Analytics
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your performance and improvement over time
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedPeriod('current_month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'current_month'
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Current Month
          </button>
          <button
            onClick={() => setSelectedPeriod('yearly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'yearly'
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Yearly Overview
          </button>
        </div>

        {/* Current Month Stats */}
        {selectedPeriod === 'current_month' && currentMonth && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  </div>
                  {resolvedChange.isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Tickets Resolved
                </h3>
                <p className="text-3xl font-bold text-blue-500 mb-1">
                  {currentMonth.tickets_resolved}
                </p>
                <p className={`text-xs ${resolvedChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {resolvedChange.isPositive ? '+' : '-'}{resolvedChange?.value?.toFixed(1) || '0.0'}% from last month
                </p>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                    <Clock className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Avg Resolution Time
                </h3>
                <p className="text-3xl font-bold text-purple-500 mb-1">
                  {currentMonth?.avg_resolution_time?.toFixed(1) || '0.0'}h
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Per ticket
                </p>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
                    <Target className="h-6 w-6 text-green-500" />
                  </div>
                  {satisfactionChange.isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Customer Satisfaction
                </h3>
                <p className="text-3xl font-bold text-green-500 mb-1">
                  {currentMonth?.customer_satisfaction?.toFixed(1) || '0.0'}%
                </p>
                <p className={`text-xs ${satisfactionChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {satisfactionChange.isPositive ? '+' : '-'}{satisfactionChange?.value?.toFixed(1) || '0.0'}% from last month
                </p>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Complaints Received
                </h3>
                <p className="text-3xl font-bold text-yellow-500 mb-1">
                  {currentMonth.complaints_received}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  This month
                </p>
              </div>
            </div>

            {/* Feedback & Ratings Section */}
            {staffAnalytics && (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
                <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Customer Feedback & Ratings
                </h2>
                
                {/* Feedback Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Average Rating
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-500">
                      {staffAnalytics.feedback_stats.average_rating.toFixed(1)}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      out of 5.0
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Feedback
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-blue-500">
                      {staffAnalytics.feedback_stats.total_feedback}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {staffAnalytics.feedback_stats.feedback_rate.toFixed(1)}% of resolved
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp className="h-5 w-5 text-green-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Positive
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-green-500">
                      {staffAnalytics.feedback_stats.positive_feedback}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {((staffAnalytics.feedback_stats.positive_feedback / staffAnalytics.feedback_stats.total_feedback) * 100).toFixed(0)}% positive
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsDown className="h-5 w-5 text-red-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Negative
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-red-500">
                      {staffAnalytics.feedback_stats.negative_feedback}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {((staffAnalytics.feedback_stats.negative_feedback / staffAnalytics.feedback_stats.total_feedback) * 100).toFixed(0)}% negative
                    </p>
                  </div>
                </div>

                {/* Recent Feedback */}
                {staffAnalytics.recent_feedback.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      Recent Feedback
                    </h3>
                    <div className="space-y-4">
                      {staffAnalytics.recent_feedback.map((feedback, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < feedback.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  feedback.sentiment === 'POSITIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : feedback.sentiment === 'NEGATIVE'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {feedback.sentiment}
                              </span>
                            </div>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {new Date(feedback.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {feedback.feedback_message.slice(0, 200)}
                            {feedback.feedback_message.length > 200 && '...'}
                          </p>
                          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            - {feedback.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Monthly Comparison */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                Month-over-Month Comparison
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      Current Month
                    </h3>
                    <Calendar className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Resolved:</span>
                      <span className="font-semibold text-blue-500">{currentMonth.tickets_resolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Time:</span>
                      <span className="font-semibold text-purple-500">{currentMonth?.avg_resolution_time?.toFixed(1) || '0.0'}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Satisfaction:</span>
                      <span className="font-semibold text-green-500">{currentMonth?.customer_satisfaction?.toFixed(1) || '0.0'}%</span>
                    </div>
                  </div>
                </div>

                {lastMonth && (
                  <div className={`p-6 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        Last Month
                      </h3>
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Resolved:</span>
                        <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{lastMonth.tickets_resolved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Time:</span>
                        <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{lastMonth?.avg_resolution_time?.toFixed(1) || '0.0'}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Satisfaction:</span>
                        <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{lastMonth?.customer_satisfaction?.toFixed(1) || '0.0'}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Yearly Overview */}
        {selectedPeriod === 'yearly' && yearlyStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30' : 'bg-gradient-to-br from-blue-50 to-blue-100'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-800/50' : 'bg-blue-200'}`}>
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Total Resolved
                </h3>
                <p className="text-3xl font-bold text-blue-500">
                  {yearlyStats.total_resolved}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  This year
                </p>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/30' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'} border ${isDark ? 'border-yellow-800' : 'border-yellow-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-800/50' : 'bg-yellow-200'}`}>
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Average Rating
                </h3>
                <p className="text-3xl font-bold text-yellow-500">
                  {yearlyStats?.avg_rating?.toFixed(1) || '0.0'} ⭐
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  Overall performance
                </p>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-green-900/50 to-green-800/30' : 'bg-gradient-to-br from-green-50 to-green-100'} border ${isDark ? 'border-green-800' : 'border-green-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-green-800/50' : 'bg-green-200'}`}>
                    <Target className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Avg Satisfaction
                </h3>
                <p className="text-3xl font-bold text-green-500">
                  {yearlyStats?.avg_satisfaction?.toFixed(1) || '0.0'}%
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  Customer feedback
                </p>
              </div>

              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30' : 'bg-gradient-to-br from-purple-50 to-purple-100'} border ${isDark ? 'border-purple-800' : 'border-purple-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-800/50' : 'bg-purple-200'}`}>
                    <Activity className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Total Complaints
                </h3>
                <p className="text-3xl font-bold text-purple-500">
                  {yearlyStats.total_complaints}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  Handled this year
                </p>
              </div>
            </div>

            {/* Monthly Trend */}
            {analytics?.monthly_trend && analytics.monthly_trend.length > 0 && (
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
                <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                  Monthly Performance Trend
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Month</th>
                        <th className={`text-right py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Resolved</th>
                        <th className={`text-right py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Avg Time</th>
                        <th className={`text-right py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Satisfaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.monthly_trend.slice(0, 6).map((month, index) => (
                        <tr 
                          key={index}
                          className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}
                        >
                          <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {new Date(month.year, month.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-blue-500">
                            {month.tickets_resolved}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-purple-500">
                            {month?.avg_resolution_time?.toFixed(1) || '0.0'}h
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-green-500">
                            {month?.customer_satisfaction?.toFixed(1) || '0.0'}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffAnalytics;
