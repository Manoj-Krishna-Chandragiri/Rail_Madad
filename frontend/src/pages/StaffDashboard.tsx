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
  Bell,
  UserCheck,
  Cpu,
  Train
} from 'lucide-react';
import apiClient from '../utils/api';

interface AssignedComplaint {
  id: string | number;
  complaint_id?: string;
  type?: string;
  description: string;
  category?: string;
  priority?: string;
  priority_level?: 'Low' | 'Medium' | 'High' | 'Critical';
  severity?: string;
  status: string;
  created_at: string;
  passenger_name?: string;
  passenger_contact?: string;
  user?: any;
  ai_confidence?: number;
  assigned_at?: string;
  location?: string;
  train_number?: string;
  pnr_number?: string;
  date_of_incident?: string;
  staff?: string;
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
  const [priorityFilter, setPriorityFilter] = useState<string>('all');  const [typeFilter, setTypeFilter] = useState<string>('all');
  useEffect(() => {
    fetchStaffDashboard();
  }, []);

  const fetchStaffDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Debug: Check localStorage values
      console.log('🔍 Staff Dashboard Debug:');
      console.log('  - authToken:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      console.log('  - userEmail:', localStorage.getItem('userEmail'));
      console.log('  - isStaff:', localStorage.getItem('isStaff'));
      console.log('  - userRole:', localStorage.getItem('userRole'));
      
      const response = await apiClient.get('/api/complaints/staff/dashboard/');
      
      console.log('✅ Dashboard Response:', response.data);
      
      // Handle response - check if success field exists, otherwise just use the data
      if (response.data) {
        const complaintsData = response.data.complaints || [];
        const statsData = response.data.stats || response.data.statistics || stats;
        
        console.log('📊 Complaints count:', complaintsData.length);
        console.log('📈 Stats:', statsData);
        
        setComplaints(complaintsData);
        setStats({
          total_assigned: statsData.total_assigned || 0,
          pending: statsData.pending || statsData.open_complaints || 0,
          in_progress: statsData.in_progress || statsData.in_progress_complaints || 0,
          resolved_today: statsData.resolved_today || statsData.today_resolved || 0,
          avg_resolution_time: statsData.avg_resolution_time || '0 hours'
        });
        
        // Clear error on successful load
        setError('');
      } else {
        setError('No data received from server');
      }
    } catch (err: any) {
      console.error('❌ Dashboard fetch error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Full error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const response = await apiClient.post(`/api/complaints/staff/resolve/${complaintId}/`, {
        resolution_notes: 'Resolved by staff member'
      });
      
      if (response.data.success) {
        // Update the complaint status locally
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id.toString() === complaintId 
              ? { ...complaint, status: 'Closed' }
              : complaint
          )
        );
        
        // Update stats
        setStats(prev => ({
          ...prev,
          resolved_today: prev.resolved_today + 1,
          in_progress: prev.in_progress - 1
        }));
        
        alert('Complaint marked as resolved!');
      }
    } catch (err: any) {
      console.error('Resolve error:', err);
      alert(err.response?.data?.error || 'Failed to resolve complaint');
    }
  };

  const handleTakeAction = async (complaintId: string) => {
    try {
      const response = await apiClient.post(`/api/complaints/staff/update-status/${complaintId}/`, {
        status: 'In Progress'
      });
      
      if (response.data.success) {
        // Update the complaint status to in-progress locally
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id.toString() === complaintId 
              ? { ...complaint, status: 'In Progress' }
              : complaint
          )
        );
        
        // Update stats
        setStats(prev => ({
          ...prev,
          in_progress: prev.in_progress + 1,
          pending: prev.pending - 1
        }));
        
        alert('Complaint status updated to In Progress!');
      }
    } catch (err: any) {
      console.error('Take action error:', err);
      alert(err.response?.data?.error || 'Failed to update complaint status');
    }
  };

  // Unique complaint types for the type filter
  const uniqueTypes = Array.from(
    new Set(complaints.map(c => (c.category || c.type || 'other').toLowerCase()))
  ).sort();

  // Filter complaints based on search and filters
  const filteredComplaints = complaints.filter(complaint => {
    const searchLower = searchTerm.toLowerCase();
    const complaintId = complaint.complaint_id || complaint.id.toString();
    const category = (complaint.category || complaint.type || '').toLowerCase();
    const passengerName = complaint.passenger_name || complaint.user?.name || complaint.user?.email || 'Unknown';

    const matchesSearch =
      complaint.description.toLowerCase().includes(searchLower) ||
      complaintId.toLowerCase().includes(searchLower) ||
      passengerName.toLowerCase().includes(searchLower) ||
      category.includes(searchLower);

    // Model statuses: 'Open', 'In Progress', 'Closed'
    const statusLower = complaint.status.toLowerCase().replace(/ /g, '-');
    const matchesStatus = statusFilter === 'all' || statusLower === statusFilter;

    const priority = complaint.priority_level || complaint.priority || complaint.severity || 'Medium';
    const matchesPriority = priorityFilter === 'all' || priority === priorityFilter;

    const matchesType = typeFilter === 'all' || category === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
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
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'resolved':
      case 'closed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in progress':
      case 'in-progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'pending':
      case 'open':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
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
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
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

          {/* Type / Category Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`appearance-none pl-4 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>
                  {t.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Active filter count + clear */}
          {(statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setTypeFilter('all'); setSearchTerm(''); }}
              className="px-3 py-2 text-sm text-red-500 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
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
          filteredComplaints.map((complaint) => {
            const complaintId = complaint.complaint_id || `C${complaint.id}`;
            const category = complaint.category || complaint.type || 'General';
            const priority = complaint.priority_level || complaint.priority || complaint.severity || 'Medium';
            const status = (complaint.status || 'pending').toLowerCase().replace(/ /g, '-');
            const passengerName = complaint.passenger_name || complaint.user?.name || complaint.user?.email || 'Unknown';
            const staffAssigned = complaint.staff || 'Unassigned';
            
            return (
            <div
              key={complaint.id}
              className={`p-6 rounded-lg shadow-sm transition-all hover:shadow-md ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold">#{complaintId}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                      {priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {complaint.status.toUpperCase()}
                    </span>
                    {complaint.train_number && (
                      <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        Train: {complaint.train_number}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Category:</strong> {(category || 'General').replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase()}
                  </p>
                  {complaint.location && (
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Location:</strong> {complaint.location}
                    </p>
                  )}
                  <p className={`mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {complaint.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {passengerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(complaint.created_at)}
                    </span>
                    {complaint.date_of_incident && (
                      <span className="flex items-center gap-1">
                        <Train className="h-4 w-4" />
                        Incident: {new Date(complaint.date_of_incident).toLocaleDateString('en-GB')}
                      </span>
                    )}
                    {complaint.ai_confidence && (
                      <span className="flex items-center gap-1">
                        <Cpu className="h-4 w-4" />
                        AI: {(complaint.ai_confidence * 100).toFixed(1)}%
                      </span>
                    )}
                    <span className={`flex items-center gap-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      <UserCheck className="h-4 w-4" />
                      Assigned: {staffAssigned}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {(status === 'pending' || status === 'open') && (
                    <button
                      onClick={() => handleTakeAction(complaint.id.toString())}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Take Action
                    </button>
                  )}
                  {status === 'in-progress' && (
                    <button
                      onClick={() => handleResolveComplaint(complaint.id.toString())}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {(status === 'resolved' || status === 'closed') && (
                    <span className={`flex items-center gap-1 px-4 py-2 rounded-lg ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`}>
                      <CheckCircle2 className="h-4 w-4" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;