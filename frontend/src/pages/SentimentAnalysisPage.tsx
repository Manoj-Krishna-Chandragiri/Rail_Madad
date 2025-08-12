import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PieChart, BarChart2, TrendingUp, MessageCircle, AlertTriangle } from 'lucide-react';
import { SentimentPieChart, CategoryBarChart } from '../components/admin/SentimentCharts';
import apiClient from '../utils/axios-config';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import '../config/firebase'; // Ensure Firebase is initialized

interface SentimentStats {
  total_feedback: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
    positive_percent: number;
    negative_percent: number;
    neutral_percent: number;
  };
  avg_rating: number;
  category_sentiment: Array<{
    category: string;
    total: number;
    positive_percent: number;
    avg_rating: number;
  }>;
  recent_feedback: Array<{
    id: number;
    feedback_message: string;
    rating: number;
    sentiment: string;
    sentiment_confidence: number;
    submitted_at: string;
  }>;
}

const SentimentAnalysisPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<SentimentStats | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if user is logged in as admin
    const adminToken = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');
    const auth = getAuth();
    
    if (!adminToken || userRole !== 'admin' || !auth.currentUser) {
      setIsAuthenticated(false);
      setError('You must be logged in as an admin to view this page');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        // Get a fresh token before making the request
        const token = await auth.currentUser?.getIdToken(true);
        
        // Make the request with the token
        const response = await apiClient.get('/api/complaints/feedback/sentiment-stats/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setStats(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching sentiment stats:', err);
        if (err.response?.status === 401) {
          setIsAuthenticated(false);
          setError('You must be logged in as an admin to view this page');
        } else {
          setError('Failed to load sentiment analysis data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-6 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p className="font-bold">Authentication Required</p>
          </div>
          <p>You must be logged in as an administrator to view this page.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No sentiment data available yet. Submit some feedback to see analysis.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Feedback Sentiment Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze customer feedback sentiment to improve service quality.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-500 dark:text-gray-400">Total Feedback</div>
            <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-indigo-100'}`}>
              <MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.total_feedback}</div>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-500 dark:text-gray-400">Average Rating</div>
            <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-yellow-100'}`}>
              <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.avg_rating}/5</div>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-500 dark:text-gray-400">Positive Feedback</div>
            <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-green-100'}`}>
              <PieChart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.sentiment_distribution.positive_percent}%</div>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-500 dark:text-gray-400">Negative Feedback</div>
            <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-red-100'}`}>
              <BarChart2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.sentiment_distribution.negative_percent}%</div>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`p-6 rounded-lg shadow-md col-span-1 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-4">Sentiment Distribution</h2>
          <div className="flex justify-center mb-4">
            <div className="w-56 h-56">
              <SentimentPieChart distribution={stats.sentiment_distribution} isDark={isDark} />
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-green-600 dark:text-green-400 font-medium">Positive</span>
                <span className="font-medium">{stats.sentiment_distribution.positive_percent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${stats.sentiment_distribution.positive_percent}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-red-600 dark:text-red-400 font-medium">Negative</span>
                <span className="font-medium">{stats.sentiment_distribution.negative_percent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-red-600 h-2.5 rounded-full" 
                  style={{ width: `${stats.sentiment_distribution.negative_percent}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">Neutral</span>
                <span className="font-medium">{stats.sentiment_distribution.neutral_percent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-yellow-500 h-2.5 rounded-full" 
                  style={{ width: `${stats.sentiment_distribution.neutral_percent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md col-span-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-4">Category Sentiment</h2>
          <div className="h-64">
            <CategoryBarChart categories={stats.category_sentiment} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-xl font-bold mb-4">Recent Feedback</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4">Feedback</th>
                <th className="text-left py-3 px-4">Rating</th>
                <th className="text-left py-3 px-4">Sentiment</th>
                <th className="text-left py-3 px-4">Confidence</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_feedback.map((feedback) => (
                <tr 
                  key={feedback.id} 
                  className={`border-b border-gray-200 dark:border-gray-700 ${
                    feedback.sentiment === 'POSITIVE' ? 'bg-green-50 dark:bg-green-900/20' :
                    feedback.sentiment === 'NEGATIVE' ? 'bg-red-50 dark:bg-red-900/20' :
                    'bg-yellow-50 dark:bg-yellow-900/20'
                  }`}
                >
                  <td className="py-3 px-4">
                    {feedback.feedback_message.length > 50
                      ? `${feedback.feedback_message.substring(0, 50)}...`
                      : feedback.feedback_message}
                  </td>
                  <td className="py-3 px-4">{feedback.rating}/5</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      feedback.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      feedback.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {feedback.sentiment}
                    </span>
                  </td>
                  <td className="py-3 px-4">{(feedback.sentiment_confidence * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4">
                    {new Date(feedback.submitted_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysisPage;
