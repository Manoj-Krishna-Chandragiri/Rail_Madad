import { Zap, Search, CheckCircle, Clock, AlertTriangle, MessageSquare, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

interface Solution {
  id: string;
  problem: string;
  solution: string;
  category: string;
  resolution_time: string;
  success_rate: number;
}

interface QuickResolutionStats {
  success_rate: number;
  avg_resolution_time: string;
  pending_issues: number;
  total_resolved: number;
}

const QuickResolution = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [stats, setStats] = useState<QuickResolutionStats>({
    success_rate: 0,
    avg_resolution_time: '0h',
    pending_issues: 0,
    total_resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats and solutions in parallel
      const [statsResponse, solutionsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/complaints/admin/quick-resolution/stats/`, { headers }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/complaints/admin/quick-resolution/solutions/`, { headers })
      ]);

      setStats(statsResponse.data);
      setSolutions(solutionsResponse.data.solutions);
    } catch (error) {
      console.error('Error fetching quick resolution data:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Authentication failed');
        } else if (error.response?.status === 403) {
          setError('Access denied - Admin privileges required');
        } else {
          setError('Failed to load data');
        }
      } else {
        setError('An unexpected error occurred');
      }
      
      // Set fallback data on error
      setSolutions([
        {
          id: '1',
          problem: 'PNR Status Not Updating',
          solution: '1. Clear browser cache\n2. Wait for 15 minutes\n3. Try refreshing the page\n4. Contact support if issue persists',
          category: 'Unreserved / Reserved Ticketing',
          resolution_time: '5 mins',
          success_rate: 92
        },
        {
          id: '2',
          problem: 'Refund Not Processed',
          solution: '1. Check bank account details\n2. Verify cancellation status\n3. Wait for 5-7 business days\n4. Raise ticket if delayed',
          category: 'Refund of Tickets',
          resolution_time: '7 days',
          success_rate: 85
        },
        {
          id: '3',
          problem: 'Seat Not Allocated',
          solution: '1. Check PNR status\n2. Verify booking confirmation\n3. Contact TTE\n4. Visit help desk',
          category: 'Passenger Amenities',
          resolution_time: '30 mins',
          success_rate: 88
        }
      ]);
      setStats({
        success_rate: 88.5,
        avg_resolution_time: '4.2h',
        pending_issues: 23,
        total_resolved: 142
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = 
      solution.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solution.solution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || solution.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from solutions
  const categories = Array.from(new Set(solutions.map(s => s.category))).sort();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{error}</p>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-8">
          <Zap className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-semibold">Quick Resolution Center</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${isDark ? 'bg-green-900' : 'bg-green-50'} p-6 rounded-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
                <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{stats.success_rate}%</div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Last 30 days</p>
              </div>
              <CheckCircle className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>

          <div className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} p-6 rounded-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Avg. Resolution Time</h3>
                <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{stats.avg_resolution_time}</div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>This week</p>
              </div>
              <Clock className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>

          <div className={`${isDark ? 'bg-yellow-900' : 'bg-yellow-50'} p-6 rounded-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Pending Issues</h3>
                <div className={`text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.pending_issues}</div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Requires attention</p>
              </div>
              <AlertTriangle className={`h-6 w-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for solutions..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className={`px-4 py-2 border rounded-lg ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredSolutions.length > 0 ? (
            filteredSolutions.map((solution) => (
              <div key={solution.id} className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{solution.problem}</h3>
                    <span className={`px-2 py-1 ${
                      isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
                    } text-sm rounded-full`}>
                      {solution.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Resolution Time</div>
                    <div className="font-semibold">{solution.resolution_time}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Solution Steps:</h4>
                  <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                    {solution.solution.split('\n').map((step, index) => (
                      <div key={index} className="flex items-start gap-2 mb-2">
                        <div className="min-w-[20px]">{step.split('.')[0]}.</div>
                        <div>{step.split('.')[1]}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate:</div>
                    <div className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {solution.success_rate}%
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Apply Solution
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No solutions found matching your search.</p>
            </div>
          )}
        </div>

        <div className={`mt-8 p-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
          <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            If you couldn't find a solution to your problem, you can:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className={`flex items-center justify-center gap-2 px-4 py-2 ${
              isDark ? 'bg-gray-800 text-indigo-400 border-indigo-500 hover:bg-gray-700' : 
              'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50'
            } border rounded-lg`}>
              <MessageSquare className="h-5 w-5" />
              Contact Support
            </button>
            <button className={`flex items-center justify-center gap-2 px-4 py-2 ${
              isDark ? 'bg-gray-800 text-indigo-400 border-indigo-500 hover:bg-gray-700' : 
              'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50'
            } border rounded-lg`}>
              <FileText className="h-5 w-5" />
              Submit Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickResolution;