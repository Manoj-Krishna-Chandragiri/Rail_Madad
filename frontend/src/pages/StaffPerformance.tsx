import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Users,
  Star,
  Target,
  Calendar,
  Filter,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface StaffMember {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  department: string;
  role: string;
  location: string;
  status: string;
  rating: number;
  active_tickets: number;
  joining_date: string;
}

interface PerformanceMetric {
  staff_id: number;
  staff_name: string;
  staff_email: string;
  month: number;
  year: number;
  tickets_resolved: number;
  avg_resolution_time: number;
  customer_satisfaction: number;
  complaints_received: number;
}

const StaffPerformance: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'tickets' | 'satisfaction'>('rating');

  useEffect(() => {
    fetchStaffPerformance();
  }, [selectedMonth, selectedYear, selectedDepartment]);

  const fetchStaffPerformance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [staffRes, performanceRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/accounts/staff/list/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/accounts/staff/performance/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { month: selectedMonth, year: selectedYear }
        })
      ]);

      setStaffMembers(staffRes.data);
      setPerformanceData(performanceRes.data);
    } catch (error) {
      console.error('Error fetching staff performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceForStaff = (staffId: number) => {
    return performanceData.find(p => p.staff_id === staffId) || null;
  };

  const filteredStaff = staffMembers
    .filter(staff => selectedDepartment === 'all' || staff.department === selectedDepartment)
    .sort((a, b) => {
      const perfA = getPerformanceForStaff(a.user_id);
      const perfB = getPerformanceForStaff(b.user_id);

      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'tickets') return (perfB?.tickets_resolved || 0) - (perfA?.tickets_resolved || 0);
      if (sortBy === 'satisfaction') return (perfB?.customer_satisfaction || 0) - (perfA?.customer_satisfaction || 0);
      return 0;
    });

  const departments = ['all', ...new Set(staffMembers.map(s => s.department))];

  const overallStats = {
    totalStaff: staffMembers.length,
    avgRating: (staffMembers.reduce((sum, s) => sum + (s.rating || 0), 0) / staffMembers.length || 0).toFixed(1),
    totalResolved: performanceData.reduce((sum, p) => sum + p.tickets_resolved, 0),
    avgSatisfaction: (performanceData.reduce((sum, p) => sum + p.customer_satisfaction, 0) / performanceData.length || 0).toFixed(1)
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Staff Performance
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Monitor and analyze staff performance metrics
            </p>
          </div>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}>
            <Download size={20} />
            Export Report
          </button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Staff</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {overallStats.totalStaff}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <Users className="text-blue-500" size={24} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Rating</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {overallStats.avgRating}
                  <Star className="inline ml-2 text-yellow-500" size={20} fill="currentColor" />
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                <Award className="text-yellow-500" size={24} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Resolved</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {overallStats.totalResolved}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <CheckCircle className="text-green-500" size={24} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Satisfaction</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {overallStats.avgSatisfaction}/5
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <TrendingUp className="text-purple-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <Filter size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="rating">Rating</option>
                <option value="tickets">Tickets Resolved</option>
                <option value="satisfaction">Satisfaction</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Performance Table */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Staff Member
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Department
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Rating
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Tickets Resolved
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Avg Resolution
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Satisfaction
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Active Tickets
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Loading staff performance data...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => {
                    const performance = getPerformanceForStaff(staff.user_id);
                    return (
                      <tr key={staff.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                            }`}>
                              <span className="text-blue-500 font-medium">
                                {staff.full_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {staff.full_name}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {staff.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {staff.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="text-yellow-500 mr-1" size={16} fill="currentColor" />
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {staff.rating ? staff.rating.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {performance?.tickets_resolved || 0}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {performance ? `${performance.avg_resolution_time.toFixed(1)}h` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {performance ? `${performance.customer_satisfaction.toFixed(1)}/5` : 'N/A'}
                            </span>
                            {performance && performance.customer_satisfaction >= 4 && (
                              <ArrowUp className="ml-1 text-green-500" size={14} />
                            )}
                            {performance && performance.customer_satisfaction < 3 && (
                              <ArrowDown className="ml-1 text-red-500" size={14} />
                            )}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {staff.active_tickets}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            staff.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : staff.status === 'on_leave'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {staff.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPerformance;
