import { Brain, Search, Filter, BarChart2, RefreshCw, AlertTriangle, TrendingUp, CheckCircle, Clock, PieChart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import ApexCharts from 'apexcharts';

interface Complaint {
  id: string;
  text: string;
  category: string;
  confidence: number;
  timestamp: string;
  status: string;
  severity?: string;
  actual_status?: string;
}

interface ClassificationStats {
  accuracy: number;
  processed_today: number;
  pending_review: number;
  category_distribution: Array<{type: string, count: number}>;
  confidence_trends: Array<{date: string, confidence: number}>;
}

const SmartClassification = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<ClassificationStats>({
    accuracy: 0,
    processed_today: 0,
    pending_review: 0,
    category_distribution: [],
    confidence_trends: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  
  // Chart refs
  const chartRef = useRef<HTMLDivElement>(null);
  const trendsChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Add useEffect to update charts when data changes
  useEffect(() => {
    if (stats.category_distribution.length > 0 || stats.confidence_trends.length > 0) {
      const updateCharts = () => {
        updateCategoryDistributionChart();
        updateConfidenceTrendsChart();
      };
      
      setTimeout(updateCharts, 100);
    }
  }, [stats, theme]);

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

      // Fetch stats and complaints in parallel
      const [statsResponse, complaintsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/complaints/admin/smart-classification/stats/`, { headers }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/complaints/admin/smart-classification/complaints/`, { headers })
      ]);

      setStats(statsResponse.data);
      setComplaints(complaintsResponse.data.complaints);
      setCategories(complaintsResponse.data.categories);
    } catch (error) {
      console.error('Error fetching classification data:', error);
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
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Category Distribution Chart
  const updateCategoryDistributionChart = () => {
    if (!chartRef.current) return;

    const options = {
      chart: {
        height: 280,
        type: 'pie',
        foreColor: theme === 'dark' ? '#e5e7eb' : '#4b5563',
        background: 'transparent',
      },
      colors: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'],
      labels: stats.category_distribution.map(item => item.type),
      series: stats.category_distribution.map(item => item.count),
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        offsetY: 8,
        labels: {
          colors: theme === 'dark' ? '#e5e7eb' : '#4b5563'
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '0%'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return Math.round(val) + '%';
        },
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
      },
      tooltip: {
        theme: theme === 'dark' ? 'dark' : 'light',
        y: {
          formatter: function(val: number) {
            return val + ' complaints';
          }
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };

    // Clear previous chart
    if (chartRef.current.querySelector('.apexcharts-canvas')) {
      chartRef.current.innerHTML = '';
    }

    // Create new chart
    const chart = new ApexCharts(chartRef.current, options);
    chart.render();
  };

  // Confidence Trends Chart
  const updateConfidenceTrendsChart = () => {
    if (!trendsChartRef.current) return;

    const options = {
      chart: {
        height: 280,
        type: 'line',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        foreColor: theme === 'dark' ? '#e5e7eb' : '#4b5563',
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        }
      },
      colors: ['#3b82f6'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      series: [{
        name: 'Classification Confidence',
        data: stats.confidence_trends.map(item => ({
          x: item.date,
          y: item.confidence
        }))
      }],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: "vertical",
          shadeIntensity: 0.3,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          formatter: function(value: string) {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          },
          style: {
            colors: theme === 'dark' ? '#e5e7eb' : '#4b5563'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        min: 70,
        max: 100,
        labels: {
          formatter: function(val: number) {
            return val.toFixed(1) + '%';
          },
          style: {
            colors: theme === 'dark' ? '#e5e7eb' : '#4b5563'
          }
        }
      },
      grid: {
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        strokeDashArray: 3
      },
      tooltip: {
        theme: theme === 'dark' ? 'dark' : 'light',
        x: {
          format: 'dd MMM yyyy'
        },
        y: {
          formatter: function(val: number) {
            return val.toFixed(1) + '% confidence';
          }
        }
      },
      markers: {
        size: 4,
        colors: ['#3b82f6'],
        strokeColors: theme === 'dark' ? '#1f2937' : '#ffffff',
        strokeWidth: 2,
        hover: {
          size: 6
        }
      }
    };

    // Clear previous chart
    if (trendsChartRef.current.querySelector('.apexcharts-canvas')) {
      trendsChartRef.current.innerHTML = '';
    }

    // Create new chart
    const chart = new ApexCharts(trendsChartRef.current, options);
    chart.render();
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || complaint.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || complaint.status.toLowerCase().includes(selectedStatus.toLowerCase());
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const updateClassification = async (complaintId: string, newCategory: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/complaints/admin/smart-classification/${complaintId}/update/`,
        { category: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setComplaints(prev => prev.map(complaint => 
        complaint.id === complaintId 
          ? { ...complaint, category: newCategory, status: 'Classified' }
          : complaint
      ));
    } catch (error) {
      console.error('Error updating classification:', error);
      alert('Failed to update classification');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
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
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{error}</p>
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
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-indigo-400" />
            <h1 className="text-2xl font-semibold">Smart Classification System</h1>
          </div>
          <button 
            onClick={refreshData}
            disabled={refreshing}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'} p-6 rounded-lg transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Classification Accuracy</h3>
                <div className="text-3xl font-bold text-indigo-400">{stats.accuracy}%</div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Last 24 hours</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'} p-6 rounded-lg transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Processed Complaints</h3>
                <div className="text-3xl font-bold text-green-400">{stats.processed_today.toLocaleString()}</div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Today</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'} p-6 rounded-lg transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Pending Review</h3>
                <div className="text-3xl font-bold text-yellow-400">{stats.pending_review}</div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Requires attention</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500' 
                    : 'bg-white border-gray-300 focus:border-indigo-500'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className={`px-4 py-2 border rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500'
                  : 'bg-white border-gray-300 focus:border-indigo-500'
              }`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className={`px-4 py-2 border rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500'
                  : 'bg-white border-gray-300 focus:border-indigo-500'
              }`}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="classified">Classified</option>
              <option value="pending">Pending Review</option>
              <option value="auto">Auto-Classified</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>ID</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Complaint Text</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Category</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Confidence</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Timestamp</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className={`transition-colors hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{complaint.id}</td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-sm">{complaint.text}</div>
                      {complaint.severity && (
                        <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          complaint.severity === 'High' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                            : complaint.severity === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                        }`}>
                          {complaint.severity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        theme === 'dark' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {complaint.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {(complaint.confidence * 100).toFixed(1)}%
                        </span>
                        <div className={`ml-2 w-24 h-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                          <div
                            className={`h-full rounded-full ${
                              complaint.confidence >= 0.9 ? 'bg-green-500' :
                              complaint.confidence >= 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${complaint.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          complaint.status === 'Classified'
                            ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                            : complaint.status === 'Auto-Classified'
                              ? theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              : theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <Search className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No complaints found</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Show result count */}
        <div className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center`}>
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>

        {/* Classification Analytics Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-semibold">Classification Analytics</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Distribution Chart */}
            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Category Distribution</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Breakdown of complaints by category
                  </p>
                </div>
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <PieChart className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              
              {stats.category_distribution.length > 0 ? (
                <div ref={chartRef} className="h-80"></div>
              ) : (
                <div className={`h-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg flex items-center justify-center`}>
                  <div className="text-center">
                    <BarChart2 className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No category data available
                    </p>
                  </div>
                </div>
              )}
              
              {/* Category stats summary */}
              {stats.category_distribution.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-indigo-500">
                        {stats.category_distribution.length}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Categories
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-500">
                        {stats.category_distribution.reduce((sum, item) => sum + item.count, 0)}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Classified
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confidence Trends Chart */}
            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Confidence Trends</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Classification confidence over the last 7 days
                  </p>
                </div>
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
              
              {stats.confidence_trends.length > 0 ? (
                <div ref={trendsChartRef} className="h-80"></div>
              ) : (
                <div className={`h-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg flex items-center justify-center`}>
                  <div className="text-center">
                    <TrendingUp className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No confidence trend data available
                    </p>
                  </div>
                </div>
              )}
              
              {/* Confidence stats summary */}
              {stats.confidence_trends.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-500">
                        {Math.max(...stats.confidence_trends.map(t => t.confidence)).toFixed(1)}%
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Peak
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-500">
                        {(stats.confidence_trends.reduce((sum, t) => sum + t.confidence, 0) / stats.confidence_trends.length).toFixed(1)}%
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Average
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-500">
                        {stats.confidence_trends[stats.confidence_trends.length - 1]?.confidence.toFixed(1) || '0'}%
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Latest
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>High Confidence</p>
                  <p className="text-lg font-semibold text-green-500">
                    {complaints.filter(c => c.confidence >= 0.9).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Medium Confidence</p>
                  <p className="text-lg font-semibold text-yellow-500">
                    {complaints.filter(c => c.confidence >= 0.8 && c.confidence < 0.9).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Low Confidence</p>
                  <p className="text-lg font-semibold text-red-500">
                    {complaints.filter(c => c.confidence < 0.8).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Avg Confidence</p>
                  <p className="text-lg font-semibold text-indigo-500">
                    {complaints.length > 0 
                      ? (complaints.reduce((sum, c) => sum + c.confidence, 0) / complaints.length * 100).toFixed(1) + '%'
                      : '0%'
                    }
                  </p>
                </div>
                <Brain className="h-8 w-8 text-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartClassification;