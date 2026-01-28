import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Users,
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter,
  Edit2,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import apiClient from '../utils/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff' | 'passenger';
  status: 'active' | 'inactive';
  phone_number?: string;
  location?: string;
  created_at: string;
}

const UserManagement = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    staff: 0,
    passengers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users from API...');
      const response = await apiClient.get('/api/accounts/users/');
      console.log('Users response:', response.data);
      
      if (response.data) {
        setUsers(response.data);
        calculateStats(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch users';
      setError(errorMsg);
      
      // If it's an authentication error, show a specific message
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication error. Please logout and login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userData: User[]) => {
    setStats({
      totalUsers: userData.length,
      activeUsers: userData.filter(u => u.status === 'active').length,
      admins: userData.filter(u => u.role === 'admin').length,
      staff: userData.filter(u => u.role === 'staff').length,
      passengers: userData.filter(u => u.role === 'passenger').length
    });
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiClient.delete(`/api/accounts/users/${userId}/delete/`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      // Update user via backend API
      await apiClient.put(`/api/accounts/users/${editingUser.id}/update/`, {
        full_name: editingUser.full_name,
        phone_number: editingUser.phone_number,
        role: editingUser.role,
        status: editingUser.status
      });
      
      // Refresh user list from server
      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
      alert('User details updated successfully!');
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Failed to update user. Please try again.');
    }
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

  if (error) {
    return (
      <div className={`min-h-screen ${bgGradient} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 text-center`}>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Error Loading Users</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>{error}</p>
            <button
              onClick={fetchUsers}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
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
                User Management
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage all system users and their permissions
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="h-5 w-5" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-blue-500" />
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Users
              </h3>
            </div>
            <p className="text-3xl font-bold text-blue-500">{stats.totalUsers}</p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="h-6 w-6 text-green-500" />
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Active
              </h3>
            </div>
            <p className="text-3xl font-bold text-green-500">{stats.activeUsers}</p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-purple-500" />
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Admins
              </h3>
            </div>
            <p className="text-3xl font-bold text-purple-500">{stats.admins}</p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-yellow-500" />
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Staff
              </h3>
            </div>
            <p className="text-3xl font-bold text-yellow-500">{stats.staff}</p>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-indigo-500" />
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Passengers
              </h3>
            </div>
            <p className="text-3xl font-bold text-indigo-500">{stats.passengers}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="passenger">Passenger</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`text-left px-6 py-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    User
                  </th>
                  <th className={`text-left px-6 py-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role
                  </th>
                  <th className={`text-left px-6 py-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Contact
                  </th>
                  <th className={`text-left px-6 py-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`text-left px-6 py-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Joined
                  </th>
                  <th className={`text-right px-6 py-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id}
                    className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          {user.full_name || 'N/A'}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'staff' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.phone_number ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {user.phone_number}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'active' ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-500">
                          <XCircle className="h-4 w-4" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-md w-full`}>
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className={`w-full px-3 py-2 border rounded-lg opacity-50 cursor-not-allowed ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editingUser.phone_number || ''}
                  onChange={(e) => setEditingUser({...editingUser, phone_number: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="passenger">Passenger</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value as any})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className={`px-4 py-2 rounded-lg border ${
                  isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
