import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Award,
  Edit2,
  Save,
  X,
  Shield,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import apiClient from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface StaffProfile {
  email: string;
  full_name: string;
  phone_number: string;
  department: string;
  role: string;
  location: string;
  status: string;
  rating: number;
  active_tickets: number;
  joining_date: string;
  expertise_areas: string[];
  languages_spoken: string[];
}

const StaffProfile = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [profile, setProfile] = useState<StaffProfile>({
    email: '',
    full_name: '',
    phone_number: '',
    department: '',
    role: '',
    location: '',
    status: 'active',
    rating: 0,
    active_tickets: 0,
    joining_date: '',
    expertise_areas: [],
    languages_spoken: []
  });
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail');
      const response = await apiClient.get('/api/accounts/profile/', {
        params: { email: userEmail }
      });
      
      if (response.data) {
        setProfile(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const response = await apiClient.put('/api/accounts/profile/update/', profile);
      
      if (response.data) {
        setSuccess('Profile updated successfully!');
        setEditMode(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchProfile();
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

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                My Profile
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your personal information
              </p>
            </div>
            <div className="flex gap-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Rating
                </h3>
                <p className="text-2xl font-bold text-yellow-500">
                  {profile.rating?.toFixed(1) || '0.0'} ⭐
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Active Tickets
                </h3>
                <p className="text-2xl font-bold text-blue-500">
                  {profile.active_tickets}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Status
                </h3>
                <p className="text-2xl font-bold text-green-500 capitalize">
                  {profile.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-8`}>
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Personal Information
          </h2>
          
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <User className="h-4 w-4" />
                Full Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {profile.full_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                {profile.email}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              {editMode ? (
                <input
                  type="tel"
                  value={profile.phone_number}
                  onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {profile.phone_number || 'Not provided'}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Briefcase className="h-4 w-4" />
                Department
              </label>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                {profile.department}
              </p>
            </div>

            {/* Role */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Shield className="h-4 w-4" />
                Role
              </label>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                {profile.role}
              </p>
            </div>

            {/* Location */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                {profile.location}
              </p>
            </div>

            {/* Joining Date */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="h-4 w-4" />
                Joining Date
              </label>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Expertise & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Expertise Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.expertise_areas && profile.expertise_areas.length > 0 ? (
                profile.expertise_areas.map((area, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No expertise areas specified
                </p>
              )}
            </div>
          </div>

          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages_spoken && profile.languages_spoken.length > 0 ? (
                profile.languages_spoken.map((language, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {language}
                  </span>
                ))
              ) : (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No languages specified
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
