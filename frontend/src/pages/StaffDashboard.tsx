import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  MessageSquare,
  Search,
  ChevronDown,
  Badge,
  Bell
} from 'lucide-react';
import apiClient from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

interface AssignedComplaint {
  id: string;
  complaint_id: string;
  description: string;
  category: string;
  priority_level: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'pending' | 'in-progress' | 'resolved';
  created_at: string;
  passenger_name: string;
  passenger_contact: string;
  ai_confidence: number;
  assigned_at: string;
  location?: string;
}

interface StaffDashboardStats {
  total_assigned: number;
  pending: number;
  in_progress: number;
  resolved_today: number;
  avg_resolution_time: string;
}

const StaffDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [complaints, setComplaints] = useState<AssignedComplaint[]>([]);
  const [stats, setStats] = useState<StaffDashboardStats>({
    total_assigned: 0,
    pending: 0,
    in_progress: 0,
    resolved_today: 0,
    avg_resolution_time: '0 hours'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    fetchStaffDashboard();
  }, []);

  const fetchStaffDashboard = async () => {
    try {
      setLoading(true);
      
      // Debug: Check localStorage values
      console.log('🔍 Staff Dashboard Debug:');
      console.log('  - authToken:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      console.log('  - userEmail:', localStorage.getItem('userEmail'));
      console.log('  - isStaff:', localStorage.getItem('isStaff'));
      console.log('  - userRole:', localStorage.getItem('userRole'));
      
      const response = await apiClient.get('/api/complaints/staff/dashboard/');
      
      if (response.data.success) {
        setComplaints(response.data.complaints || []);
        setStats(response.data.stats || stats);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('❌ Dashboard fetch error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const response = await apiClient.post(`/api/complaints/staff/resolve/${complaintId}/`);
      
      if (response.data.success) {
        // Update the complaint status locally
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id === complaintId 
              ? { ...complaint, status: 'resolved' }
              : complaint
          )
        );
        
        // Update stats
        setStats(prev => ({
          ...prev,
          resolved_today: prev.resolved_today + 1,
          pending: prev.pending - 1
        }));
        
        alert('Complaint resolved successfully!');
      }
    } catch (err: any) {
      console.error('Resolve error:', err);
      alert(err.response?.data?.error || 'Failed to resolve complaint');
    }
  };

  const handleTakeAction = async (complaintId: string) => {
    try {
      const response = await apiClient.post(`/api/complaints/staff/take-action/${complaintId}/`);
      
      if (response.data.success) {
        // Update the complaint status to in-progress
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id === complaintId 
              ? { ...complaint, status: 'in-progress' }
              : complaint
          )
        );
        
        // Update stats
        setStats(prev => ({
          ...prev,
          in_progress: prev.in_progress + 1,
          pending: prev.pending - 1
        }));
      }
    } catch (err: any) {
      console.error('Take action error:', err);
      alert(err.response?.data?.error || 'Failed to update complaint status');
    }
  };

  // Filter complaints based on search and filters
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.passenger_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority_level === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center h-64">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-center text-red-600">{error}</p>
            <button 
              onClick={fetchStaffDashboard}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 block mx-auto"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage your assigned complaints and track resolution progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Assigned</p>
              <p className="text-2xl font-bold">{stats.total_assigned}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>In Progress</p>
              <p className="text-2xl font-bold">{stats.in_progress}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Resolved Today</p>
              <p className="text-2xl font-bold">{stats.resolved_today}</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Resolution</p>
              <p className="text-2xl font-bold">{stats.avg_resolution_time}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`p-6 rounded-lg shadow-sm mb-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints, IDs, or passenger names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`appearance-none pl-4 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`appearance-none pl-4 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className={`p-8 rounded-lg text-center ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No complaints found matching your criteria
            </p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">#{complaint.complaint_id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority_level)}`}>
                      {complaint.priority_level}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Category:</strong> {complaint.category.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className={`mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {complaint.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {complaint.passenger_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(complaint.created_at)}
                    </span>
                    {complaint.ai_confidence && (
                      <span className="flex items-center gap-1">
                        <Badge className="h-4 w-4" />
                        AI Confidence: {(complaint.ai_confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {complaint.status === 'pending' && (
                    <button
                      onClick={() => handleTakeAction(complaint.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Take Action
                    </button>
                  )}
                  {complaint.status === 'in-progress' && (
                    <button
                      onClick={() => handleResolveComplaint(complaint.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {complaint.status === 'resolved' && (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;