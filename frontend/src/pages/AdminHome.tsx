import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  Users, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Brain,
  Zap,
  Headphones,
  TrendingUp,
  Shield,
  FileText,
  Search
} from 'lucide-react';
import axios from 'axios';

interface StatsData {
  openComplaints: number;
  closedComplaints: number;
  inProgressComplaints: number;
  staffCount: number;
  avgResponseTime: string;
  avgResolutionTime: string;
  resolutionRate: number;
}

const AdminHome = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<StatsData>({
    openComplaints: 0,
    closedComplaints: 0,
    inProgressComplaints: 0,
    staffCount: 0,
    avgResponseTime: '',
    avgResolutionTime: '',
    resolutionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    openComplaints: 0,
    closedComplaints: 0,
    inProgressComplaints: 0,
    staffCount: 0,
    resolutionRate: 0
  });

  // Animation effect for stats
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setAnimatedStats(prev => {
          const newStats = { ...prev };
          let completed = true;
          
          if (prev.openComplaints < stats.openComplaints) {
            newStats.openComplaints = prev.openComplaints + 1;
            completed = false;
          }
          
          if (prev.closedComplaints < stats.closedComplaints) {
            newStats.closedComplaints = prev.closedComplaints + 1;
            completed = false;
          }
          
          if (prev.inProgressComplaints < stats.inProgressComplaints) {
            newStats.inProgressComplaints = prev.inProgressComplaints + 1;
            completed = false;
          }
          
          if (prev.staffCount < stats.staffCount) {
            newStats.staffCount = prev.staffCount + 1;
            completed = false;
          }
          
          if (prev.resolutionRate < stats.resolutionRate) {
            newStats.resolutionRate = Math.min(prev.resolutionRate + 1, stats.resolutionRate);
            completed = false;
          }
          
          if (completed) {
            clearInterval(interval);
          }
          
          return newStats;
        });
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [loading, stats]);

  useEffect(() => {
    // Simulate data fetching with real API call
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch real data from the admin stats endpoint
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/complaints/admin/dashboard-stats/`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            const data = response.data;
            setStats({
              openComplaints: data.openComplaints || 0,
              closedComplaints: data.closedComplaints || 0,
              inProgressComplaints: data.inProgressComplaints || 0,
              staffCount: data.totalStaff || 0,
              avgResponseTime: '1h 23m',
              avgResolutionTime: data.averageResolutionTime || '0h',
              resolutionRate: data.resolutionRate || 0
            });
            
            console.log('AdminHome: Real stats loaded:', data);
          } catch (apiError) {
            console.warn('AdminHome: Failed to fetch real stats, using fallback data:', apiError);
            // Fallback to dummy data
            setStats({
              openComplaints: 23,
              closedComplaints: 45,
              inProgressComplaints: 12,
              staffCount: 18,
              avgResponseTime: '1h 23m',
              avgResolutionTime: '5h 45m',
              resolutionRate: 78
            });
          }
        } else {
          // No token, use dummy data
          setStats({
            openComplaints: 23,
            closedComplaints: 45,
            inProgressComplaints: 12,
            staffCount: 18,
            avgResponseTime: '1h 23m',
            avgResolutionTime: '5h 45m',
            resolutionRate: 78
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback data
        setStats({
          openComplaints: 23,
          closedComplaints: 45,
          inProgressComplaints: 12,
          staffCount: 18,
          avgResponseTime: '1h 23m',
          avgResolutionTime: '5h 45m',
          resolutionRate: 78
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const cardHoverClass = isDark 
    ? 'hover:bg-gray-700 border-gray-700' 
    : 'hover:bg-gray-50 border-gray-200';

  const statCardClass = `relative overflow-hidden p-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;
  
  const featureCardClass = `p-6 rounded-lg border transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl ${cardHoverClass}`;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-xl shadow-2xl mb-8 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
          </svg>
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
        </div>
        <div className="relative p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-white" />
            Rail Madad Admin Dashboard
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl mb-6">
            Manage complaints, monitor system performance, and ensure quality service across the Indian Railways network.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/admin-dashboard/dashboard" 
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-md hover:shadow-lg"
            >
              View Dashboard
            </Link>
            <Link 
              to="/admin-dashboard/staff" 
              className="px-6 py-3 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors shadow-md hover:shadow-lg"
            >
              Manage Staff
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className={statCardClass}>
          <div className="absolute -right-3 -top-3 bg-red-100 w-20 h-20 rounded-full opacity-20"></div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Open Complaints
              </h3>
              <div className="text-3xl font-bold text-red-500">{animatedStats.openComplaints}</div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Requires attention
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="text-red-500 h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className={statCardClass}>
          <div className="absolute -right-3 -top-3 bg-yellow-100 w-20 h-20 rounded-full opacity-20"></div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                In Progress
              </h3>
              <div className="text-3xl font-bold text-yellow-500">{animatedStats.inProgressComplaints}</div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Being processed
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="text-yellow-500 h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className={statCardClass}>
          <div className="absolute -right-3 -top-3 bg-green-100 w-20 h-20 rounded-full opacity-20"></div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Closed Complaints
              </h3>
              <div className="text-3xl font-bold text-green-500">{animatedStats.closedComplaints}</div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Successfully resolved
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="text-green-500 h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className={statCardClass}>
          <div className="absolute -right-3 -top-3 bg-blue-100 w-20 h-20 rounded-full opacity-20"></div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Resolution Rate
              </h3>
              <div className="text-3xl font-bold text-blue-500">{animatedStats.resolutionRate}%</div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Overall efficiency
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="text-blue-500 h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-10`}>
        <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          Quick Access
        </h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-8`}>
          Frequently used tools and features to streamline your workflow
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            to="/admin-dashboard/dashboard" 
            className={`flex flex-col items-center p-6 rounded-lg border transition-all duration-300 ${cardHoverClass} transform hover:translate-y-[-4px]`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
              <BarChart2 className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-lg">Dashboard</h3>
            <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              View all statistics and reports
            </p>
          </Link>
          
          <Link 
            to="/admin-dashboard/staff" 
            className={`flex flex-col items-center p-6 rounded-lg border transition-all duration-300 ${cardHoverClass} transform hover:translate-y-[-4px]`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="font-semibold text-lg">Staff Management</h3>
            <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage staff and assignments
            </p>
          </Link>
          
          <Link 
            to="/admin-dashboard/quick-resolution" 
            className={`flex flex-col items-center p-6 rounded-lg border transition-all duration-300 ${cardHoverClass} transform hover:translate-y-[-4px]`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="font-semibold text-lg">Quick Resolution</h3>
            <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Resolve complaints efficiently
            </p>
          </Link>
          
          <Link 
            to="/admin-dashboard/settings" 
            className={`flex flex-col items-center p-6 rounded-lg border transition-all duration-300 ${cardHoverClass} transform hover:translate-y-[-4px]`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Settings className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="font-semibold text-lg">Settings</h3>
            <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Configure system preferences
            </p>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
        <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          Key Features
        </h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-8`}>
          Powerful tools to enhance customer service and complaint management
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className={featureCardClass}>
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
              <Brain className="h-7 w-7 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Smart Classification</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              AI-powered complaint classification for faster routing and resolution of passenger issues.
            </p>
            <Link to="/admin-dashboard/smart-classification" className="flex items-center gap-2 text-indigo-500 text-sm font-medium group">
              <span>Learn more</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className={featureCardClass}>
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Headphones className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Real-time Support</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Connect with passengers in real-time through chat, voice, or video for immediate assistance.
            </p>
            <Link to="/real-time-support" className="flex items-center gap-2 text-blue-500 text-sm font-medium group">
              <span>Learn more</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className={featureCardClass}>
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <MessageSquare className="h-7 w-7 text-green-500" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Multi-lingual Support</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Support for multiple Indian languages to serve diverse passengers across the country.
            </p>
            <Link to="/admin-dashboard/multi-lingual" className="flex items-center gap-2 text-green-500 text-sm font-medium group">
              <span>Learn more</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className={featureCardClass}>
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <FileText className="h-7 w-7 text-purple-500" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Complaint Analytics</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Detailed analytics and reports to identify trends and improve service quality.
            </p>
            <Link to="/dashboard" className="flex items-center gap-2 text-purple-500 text-sm font-medium group">
              <span>Learn more</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className={featureCardClass}>
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${isDark ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
              <Clock className="h-7 w-7 text-amber-500" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Resolution Tracking</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Monitor resolution times and staff performance for better accountability.
            </p>
            <Link to="/quick-resolution" className="flex items-center gap-2 text-amber-500 text-sm font-medium group">
              <span>Learn more</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className={featureCardClass}>
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <Search className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="font-semibold text-xl mb-3">Advanced Search</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Powerful search capabilities to quickly find and retrieve complaint information.
            </p>
            <Link to="/dashboard" className="flex items-center gap-2 text-red-500 text-sm font-medium group">
              <span>Learn more</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
