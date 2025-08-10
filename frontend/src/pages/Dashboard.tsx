import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, CheckCircle, ChevronDown, Check, ChevronDownIcon, Users, BarChart3, Workflow, Activity, ArrowUp, ArrowDown, BarChart2, PieChart, TrendingUp, RefreshCw, Filter, Calendar, Terminal } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';

interface Complaint {
  id: number;
  type: string;
  status: string;
  severity: string;
  date_of_incident: string;
  description: string;
  staff: string;
}

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200';
    case 'closed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
    case 'open':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
  }
};

const Dashboard = () => {
  const { theme } = useTheme();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState<number>(25);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const chartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  
  const [adminStats, setAdminStats] = useState({
    totalStaff: 0,
    activeAgents: 0,
    resolvedToday: 0,
    resolutionRate: 0,
    averageResolutionTime: '0h',
    pendingEscalations: 0,
    totalComplaints: 0,
    complaintTrends: [] as Array<{date: string, open: number, in_progress: number, closed: number}>
  });

  // Animation states
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchAdminStats();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchComplaints();
      fetchAdminStats();
    }, 30000);
    
    // Trigger animation after data is loaded
    setTimeout(() => {
      setAnimateStats(true);
    }, 500);
    
    // Remove the immediate chart initialization - charts will update when data loads
    
    return () => {
      clearInterval(interval);
    };
  }, [theme]);

  // Add new useEffect to update charts when data changes
  useEffect(() => {
    // Update charts only when we have data
    if (complaints.length > 0) {
      const updateCharts = () => {
        updateStatusDistributionChart();
        updateComplaintTrendsChart();
      };
      
      // Small delay to ensure DOM is ready
      setTimeout(updateCharts, 100);
    }
  }, [complaints, adminStats, theme]); // Update when complaints, adminStats, or theme changes

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      console.log('Fetching admin stats with token:', token.substring(0, 20) + '...');

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/complaints/admin/dashboard-stats/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Admin stats response:', response.data);

      const data = response.data;
      setAdminStats({
        totalStaff: data.totalStaff || 0,
        activeAgents: data.activeStaff || 0,
        resolvedToday: data.todayResolved || 0,
        resolutionRate: data.resolutionRate || 0,
        averageResolutionTime: data.averageResolutionTime || '0h',
        pendingEscalations: data.pendingEscalations || 0,
        totalComplaints: data.totalComplaints || 0,
        complaintTrends: data.complaintTrends || []
      });
      
      console.log('Admin stats loaded successfully:', data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      
      // Check if it's an authentication error
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.error('Authentication failed - user not logged in or token expired');
          console.error('Response:', error.response.data);
        } else if (error.response?.status === 403) {
          console.error('Access denied - user is not an admin');
          console.error('Response:', error.response.data);
        }
      }
      
      // Set default fallback data on error
      setAdminStats({
        totalStaff: 0,
        activeAgents: 0,
        resolvedToday: 0,
        resolutionRate: 0,
        averageResolutionTime: '0h',
        pendingEscalations: 0,
        totalComplaints: 0,
        complaintTrends: []
      });
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/complaints/user/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Sort complaints by ID in descending order (newest first)
      const sortedComplaints = response.data.sort((a: Complaint, b: Complaint) => {
        return b.id - a.id;
      });
      
      setComplaints(sortedComplaints);
    } catch (error) {
      console.error('Error fetching complaints', error);
      // Show user-friendly error message
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchComplaints(), fetchAdminStats()]);
      // Charts will automatically update due to the useEffect dependency
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 800); // Minimum duration to show refresh animation
    }
  };

  // Calculate complaint counts
  const openCount = complaints.filter(c => c.status === 'Open').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const closedCount = complaints.filter(c => c.status === 'Closed').length;

  // Function to load more complaints
  const loadMore = () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayCount(prevCount => prevCount + 10);
      setLoadingMore(false);
    }, 500);
  };

  // Function to format percentage for display
  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  // Performance indicator with random trend direction for demo
  const getPerformanceIndicator = () => {
    // Generate random trend (up or down)
    const trend = Math.random() > 0.5;
    const percentage = Math.floor(Math.random() * 10) + 1;
    
    return (
      <div className={`flex items-center ${trend ? 'text-green-500' : 'text-red-500'}`}>
        {trend ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
        <span>{percentage}%</span>
      </div>
    );
  };

  // Status distribution chart
  const updateStatusDistributionChart = () => {
    if (!pieChartRef.current) return;
    
    // Calculate current complaint counts
    const currentOpenCount = complaints.filter(c => c.status === 'Open').length;
    const currentInProgressCount = complaints.filter(c => c.status === 'In Progress').length;
    const currentClosedCount = complaints.filter(c => c.status === 'Closed').length;
    
    const options = {
      chart: {
        height: 320,
        type: 'donut',
        foreColor: theme === 'dark' ? '#e5e7eb' : '#4b5563',
        background: 'transparent',
      },
      colors: ['#ef4444', '#f59e0b', '#10b981'],
      labels: ['Open', 'In Progress', 'Closed'],
      series: [currentOpenCount, currentInProgressCount, currentClosedCount],
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
            size: '70%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '22px',
                fontFamily: 'Arial, sans-serif',
                color: theme === 'dark' ? '#e5e7eb' : '#4b5563',
                offsetY: -10
              },
              value: {
                show: true,
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: theme === 'dark' ? '#e5e7eb' : '#4b5563',
                offsetY: 2,
                formatter: function (val: number) {
                  return val.toString();
                }
              },
              total: {
                show: true,
                label: 'Total',
                color: theme === 'dark' ? '#e5e7eb' : '#4b5563',
                formatter: function () {
                  return (currentOpenCount + currentInProgressCount + currentClosedCount).toString();
                }
              }
            }
          }
        }
      },
      stroke: {
        width: 0
      },
      dataLabels: {
        enabled: false
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };

    // Clear previous chart
    if (pieChartRef.current.querySelector('.apexcharts-canvas')) {
      pieChartRef.current.innerHTML = '';
    }

    // Create new chart
    const chart = new ApexCharts(pieChartRef.current, options);
    chart.render();
  };

  // Complaint trends chart
  const updateComplaintTrendsChart = () => {
    if (!chartRef.current) return;

    // Use real data from adminStats if available
    let dates: string[], openData: number[], progressData: number[], closedData: number[];
    
    if (adminStats.complaintTrends && adminStats.complaintTrends.length > 0) {
      // Use real data from API
      dates = adminStats.complaintTrends.map(trend => trend.date);
      openData = adminStats.complaintTrends.map(trend => trend.open);
      progressData = adminStats.complaintTrends.map(trend => trend.in_progress);
      closedData = adminStats.complaintTrends.map(trend => trend.closed);
    } else {
      // If no API data, create empty data for the last 30 days
      dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });
      
      // Use zeros instead of random data when no real data is available
      openData = Array(30).fill(0);
      progressData = Array(30).fill(0);
      closedData = Array(30).fill(0);
    }

    const options = {
      chart: {
        height: 320,
        type: 'area',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
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
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      colors: ['#ef4444', '#f59e0b', '#10b981'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      series: [
        {
          name: 'Open',
          data: openData
        },
        {
          name: 'In Progress',
          data: progressData
        },
        {
          name: 'Closed',
          data: closedData
        }
      ],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: "vertical",
          shadeIntensity: 0.3,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        type: 'datetime',
        categories: dates,
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
        labels: {
          style: {
            colors: theme === 'dark' ? '#e5e7eb' : '#4b5563'
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
        labels: {
          colors: theme === 'dark' ? '#e5e7eb' : '#4b5563'
        }
      },
      grid: {
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
      },
      tooltip: {
        theme: theme === 'dark' ? 'dark' : 'light',
        x: {
          format: 'dd MMM yyyy'
        }
      }
    };

    // Clear previous chart
    if (chartRef.current.querySelector('.apexcharts-canvas')) {
      chartRef.current.innerHTML = '';
    }

    // Create new chart
    const chart = new ApexCharts(chartRef.current, options);
    chart.render();
  };

  // Filter the complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch =
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.staff?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || complaint.severity === severityFilter;
    const matchesType = selectedTypeFilter === 'All' || complaint.type === selectedTypeFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  // Get unique complaint types for filter
  const complaintTypes = Array.from(new Set(complaints.map(c => c.type))).sort();

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/complaints/${id}/`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update local state with new status
      setComplaints(prev =>
        prev.map(c =>
          c.id === id ? { ...c, status: newStatus } : c
        )
      );
      
      // Close dropdown
      setOpenDropdown(null);
      
      // Refresh admin stats to reflect changes
      fetchAdminStats();
      
      // Charts will automatically update due to the useEffect dependency on complaints
      
    } catch (error) {
      console.error('Error updating status', error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        alert('You do not have permission to update complaint status');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header with Refresh Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-indigo-500" />
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-3">
          <div className={`rounded-lg px-4 py-2 flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'}`}>
            <Activity className="h-4 w-4 text-indigo-500" />
            <span className="text-sm">Last Updated:</span>
            <span className="text-sm font-medium">{new Date().toLocaleTimeString()}</span>
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
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
            } ${showFilters ? 'ring-2 ring-indigo-400' : ''}`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <div className={`p-4 mb-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-md animate-fadeIn`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="All">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Complaint Type</label>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="All">All Types</option>
                {complaintTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={() => {
                setStatusFilter('All');
                setSeverityFilter('All');
                setSelectedTypeFilter('All');
                setDateRange('7d');
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Admin Stats Dashboard with animated counters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-500 transform hover:shadow-lg hover:-translate-y-1 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0ms' }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm mb-2 text-gray-500">Total Staff</h3>
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold">{adminStats.totalStaff}</div>
                  <div className="ml-2 text-xs">{getPerformanceIndicator()}</div>
                </div>
              </div>
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Users className="text-blue-500 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded">
              <div className="h-1.5 bg-blue-500 rounded" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-500 transform hover:shadow-lg hover:-translate-y-1 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm mb-2 text-gray-500">Active Agents</h3>
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold">{adminStats.activeAgents}</div>
                  <div className="ml-2 text-xs">{getPerformanceIndicator()}</div>
                </div>
              </div>
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <Users className="text-green-500 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded">
              <div className="h-1.5 bg-green-500 rounded" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-500 transform hover:shadow-lg hover:-translate-y-1 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm mb-2 text-gray-500">Resolved Today</h3>
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold">{adminStats.resolvedToday}</div>
                  <div className="ml-2 text-xs">{getPerformanceIndicator()}</div>
                </div>
              </div>
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <CheckCircle className="text-green-500 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded">
              <div className="h-1.5 bg-green-500 rounded" style={{ width: '80%' }}></div>
            </div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-500 transform hover:shadow-lg hover:-translate-y-1 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm mb-2 text-gray-500">Resolution Rate</h3>
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold">{formatPercentage(adminStats.resolutionRate)}</div>
                  <div className="ml-2 text-xs">{getPerformanceIndicator()}</div>
                </div>
              </div>
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                <PieChart className="text-indigo-500 h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded">
              <div className="h-1.5 bg-indigo-500 rounded" style={{ width: `${adminStats.resolutionRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-500 transform hover:shadow-lg ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Complaint Status Distribution</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Visual breakdown of open, in-progress, and closed complaints
                </p>
              </div>
              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                <PieChart className="text-indigo-500 h-5 w-5" />
              </div>
            </div>
            <div ref={pieChartRef} className="h-80"></div>
          </div>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-500 transform hover:shadow-lg ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Complaint Trends</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Daily complaint tracking by status over time
                </p>
              </div>
              <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                <BarChart3 className="text-indigo-500 h-5 w-5" />
              </div>
            </div>
            <div ref={chartRef} className="h-80"></div>
          </div>
        </div>
      </div>

      {/* Complaint Stats with animation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow transition-all duration-500 transform hover:shadow-xl hover:-translate-y-1 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm mb-2 text-gray-500">Open Complaints</h3>
              <div className="text-2xl font-bold">{openCount}</div>
            </div>
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <AlertTriangle className="text-red-500 h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full animate-pulse-custom" style={{ width: `${complaints.length ? (openCount / complaints.length) * 100 : 0}%` }}></div>
            </div>
            <span className="ml-2 text-xs text-gray-500">{complaints.length ? Math.round((openCount / complaints.length) * 100) : 0}%</span>
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow transition-all duration-500 transform hover:shadow-xl hover:-translate-y-1 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '700ms' }}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm mb-2 text-gray-500">In Progress</h3>
              <div className="text-2xl font-bold">{inProgressCount}</div>
            </div>
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
              <Clock className="text-amber-500 h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${complaints.length ? (inProgressCount / complaints.length) * 100 : 0}%` }}></div>
            </div>
            <span className="ml-2 text-xs text-gray-500">{complaints.length ? Math.round((inProgressCount / complaints.length) * 100) : 0}%</span>
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow transition-all duration-500 transform hover:shadow-xl hover:-translate-y-1 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '800ms' }}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm mb-2 text-gray-500">Closed Complaints</h3>
              <div className="text-2xl font-bold">{closedCount}</div>
            </div>
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <CheckCircle className="text-green-500 h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${complaints.length ? (closedCount / complaints.length) * 100 : 0}%` }}></div>
            </div>
            <span className="ml-2 text-xs text-gray-500">{complaints.length ? Math.round((closedCount / complaints.length) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 transition-all duration-500 transform ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '900ms' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Terminal className="h-6 w-6 text-indigo-500" />
            Complaint Management
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-4 py-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <tr>
                <th className="text-left p-3 font-semibold">ID</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Severity</th>
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-left p-3 font-semibold">Description</th>
                <th className="text-left p-3 font-semibold">Staff</th>
                <th className="text-left p-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredComplaints.length > 0 ? (
                <>
                  {filteredComplaints.slice(0, displayCount).map((complaint) => (
                    <tr key={complaint.id} className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                      <td className="p-3">{complaint.id}</td>
                      <td className="p-3">{complaint.type}</td>
                      <td className="p-3">
                        <span className={`status-badge px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          complaint.severity === 'High' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' 
                            : complaint.severity === 'Medium'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                        }`}>
                          {complaint.severity}
                        </span>
                      </td>
                      <td className="p-3">{complaint.date_of_incident}</td>
                      <td className="p-3 max-w-xs truncate">{complaint.description}</td>
                      <td className="p-3">{complaint.staff || 'Unassigned'}</td>
                      <td className="p-3">
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === complaint.id ? null : complaint.id)}
                            className={`flex items-center gap-1 px-2 py-1 text-sm rounded transition-colors ${
                              theme === 'dark' 
                                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            } ${openDropdown === complaint.id ? 'ring-2 ring-indigo-400' : ''}`}
                            disabled={loading}
                          >
                            <span className={`w-2 h-2 rounded-full mr-1 
                              ${complaint.status === 'Open' ? 'bg-red-500' : 
                                complaint.status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                            {complaint.status}
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </button>
                          
                          {openDropdown === complaint.id && (
                            <div className={`absolute top-full left-0 mt-1 py-1 rounded-md shadow-lg z-10 min-w-[120px] ${
                              theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
                            }`}>
                              {['Open', 'In Progress', 'Closed'].map(status => (
                                <div 
                                  key={status}
                                  className={`px-3 py-1.5 text-sm cursor-pointer flex items-center gap-2 
                                    ${complaint.status === status 
                                      ? theme === 'dark' ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-50 text-indigo-700' 
                                      : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                  onClick={() => handleStatusChange(complaint.id, status)}
                                >
                                  <span className={`w-2 h-2 rounded-full 
                                    ${status === 'Open' ? 'bg-red-500' : 
                                      status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                  {status}
                                  {complaint.status === status && (
                                    <Check className="h-3 w-3 ml-auto" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-8">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">No complaints found matching your search criteria.</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Load More button */}
          {filteredComplaints.length > displayCount && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                } hover:-translate-y-1 transform transition-transform`}
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-5 w-5" />
                    <span>Load More</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Show count information */}
          <div className={`text-center mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Showing {Math.min(displayCount, filteredComplaints.length)} of {filteredComplaints.length} complaints
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;