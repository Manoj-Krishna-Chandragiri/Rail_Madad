import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  avatar: string;
  status: 'active' | 'inactive' | 'on-leave';
  expertise: string[];
  rating: number;
  active_tickets: number;
  languages: string[];
  communication_preferences: string[];
}

const ContactStaff: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAvailableStaff();
  }, []);

  const fetchAvailableStaff = async () => {
    setLoading(true);
    try {
      // Use auth service for authenticated requests or plain fetch for public endpoints
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Fetching staff with headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/api/complaints/staff/`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data and filter only active staff
      const processedData = data
        .filter((staff: any) => staff.status === 'active')
        .map((staff: any) => ({
          ...staff,
          expertise: typeof staff.expertise === 'string' 
            ? JSON.parse(staff.expertise || '[]') 
            : (Array.isArray(staff.expertise) ? staff.expertise : []),
          languages: typeof staff.languages === 'string' 
            ? JSON.parse(staff.languages || '[]') 
            : (Array.isArray(staff.languages) ? staff.languages : []),
          communication_preferences: typeof staff.communication_preferences === 'string' 
            ? JSON.parse(staff.communication_preferences || '["Chat"]') 
            : (Array.isArray(staff.communication_preferences) ? staff.communication_preferences : ['Chat'])
        }));
      
      setStaffMembers(processedData);
      console.log('Staff data loaded successfully:', processedData);
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Failed to load available staff. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const processAvatarUrl = (avatarPath: string, staffName: string): string => {
    if (!avatarPath) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(staffName)}&background=random`;
    }
    
    if (avatarPath.includes('http://') || avatarPath.includes('https://')) {
      return avatarPath;
    }
    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (avatarPath.startsWith('/media/')) {
      return `${apiBaseUrl}${avatarPath}`;
    } else if (avatarPath.startsWith('media/')) {
      return `${apiBaseUrl}/${avatarPath}`;
    } else {
      return `${apiBaseUrl}/media/${avatarPath}`;
    }
  };

  // Get unique departments and languages for filtering
  const departments = Array.from(new Set(staffMembers.map(staff => staff.department)));
  const allLanguages = Array.from(new Set(staffMembers.flatMap(staff => staff.languages)));

  // Filter staff based on search and filters
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || staff.department === selectedDepartment;
    const matchesLanguage = !selectedLanguage || staff.languages.includes(selectedLanguage);
    
    return matchesSearch && matchesDepartment && matchesLanguage;
  });

  const handleContactStaff = (staff: StaffMember, method: string) => {
    switch (method) {
      case 'chat':
        // Implement chat functionality here
        alert(`Starting chat with ${staff.name}...`);
        break;
      case 'email':
        window.open(`mailto:${staff.email}?subject=Rail Madad Support Request`);
        break;
      case 'phone':
        window.open(`tel:${staff.phone}`);
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-indigo-400" />
            <div>
              <h1 className="text-2xl font-semibold">Contact Support Staff</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Get help from our available support team members
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">All Languages</option>
                  {allLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className={`border rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}
            >
              {/* Staff Avatar and Basic Info */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={processAvatarUrl(staff.avatar, staff.name)}
                  alt={staff.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=random`;
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{staff.name}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {staff.role}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(staff.status)}`}>
                    {staff.status}
                  </span>
                </div>
              </div>

              {/* Department and Location */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <Users className="h-4 w-4" />
                  <span>{staff.department}</span>
                </div>
                {staff.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{staff.location}</span>
                  </div>
                )}
              </div>

              {/* Rating and Active Tickets */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(staff.rating)}
                  <span className="text-sm text-gray-500 ml-1">({staff.rating})</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{staff.active_tickets} active</span>
                </div>
              </div>

              {/* Expertise Tags */}
              {staff.expertise.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {staff.expertise.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${
                          isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                    {staff.expertise.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{staff.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Languages */}
              {staff.languages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Languages:</p>
                  <div className="flex flex-wrap gap-1">
                    {staff.languages.map((lang, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${
                          isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Methods */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Contact Methods:</p>
                <div className="flex flex-wrap gap-2">
                  {staff.communication_preferences.includes('Chat') && (
                    <button
                      onClick={() => handleContactStaff(staff, 'chat')}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700"
                    >
                      <MessageCircle className="h-3 w-3" />
                      Chat
                    </button>
                  )}
                  {staff.communication_preferences.includes('Email') && (
                    <button
                      onClick={() => handleContactStaff(staff, 'email')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-full hover:bg-green-700"
                    >
                      <Mail className="h-3 w-3" />
                      Email
                    </button>
                  )}
                  {staff.communication_preferences.includes('Phone') && (
                    <button
                      onClick={() => handleContactStaff(staff, 'phone')}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700"
                    >
                      <Phone className="h-3 w-3" />
                      Phone
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStaff.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No staff members found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedDepartment || selectedLanguage
                ? 'Try adjusting your search filters'
                : 'No support staff are currently available'}
            </p>
          </div>
        )}

        {/* Real-time Support Info */}
        <div className={`mt-8 p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <div className="flex items-start gap-3">
            <MessageCircle className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Real-time Support Available
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Our support staff are here to help you with any railway-related issues. 
                Choose your preferred communication method and get instant assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactStaff;
