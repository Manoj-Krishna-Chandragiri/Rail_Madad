import { 
  Users, 
  Search, 
  Filter, 
  X, 
  ChevronDown as ChevronDownIcon,
  Trash as TrashIcon,
  Pencil as PencilIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Camera,
  User
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import authService from '../services/authService';

// Check your frontend axios configuration
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
  joining_date: string;
  expertise: string[];
  rating: number;
  active_tickets: number;
  languages: string[];
  communication_preferences: string[]; // Add this new field
}

const Staff = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: '',
    status: 'active',
    expertise: [],
    languages: [],
    communication_preferences: ['Chat'] // Default to Chat
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  // Authentication and role state
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    status: '',
    location: ''
  });
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Pagination state
  const [displayCount, setDisplayCount] = useState<number>(6);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

  useEffect(() => {
    fetchStaffData();
    
    // Use auth service for better authentication handling
    const authState = authService.getAuthState();
    console.log('Authentication debug (via service):', authState);
    
    // Fallback to localStorage for backward compatibility
    const userRole = localStorage.getItem('userRole');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const adminToken = localStorage.getItem('adminToken');
    const authToken = localStorage.getItem('authToken');
    const token = localStorage.getItem('token');
    
    console.log('Authentication debug (localStorage):', {
      userRole,
      isAuthenticated,
      hasAdminToken: !!adminToken,
      hasAuthToken: !!authToken,
      hasToken: !!token
    });
    
    // Use auth service result or fallback to localStorage
    const finalIsAdmin = authState.isAdmin || (isAuthenticated && (userRole === 'admin' || userRole === 'staff') && (!!adminToken || !!authToken || !!token));
    setIsAdmin(finalIsAdmin);
  }, []);

  const processAvatarUrl = (avatarPath: string, staffName: string): string => {
    if (!avatarPath) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(staffName)}&background=random`;
    }
    
    // Handle external URLs (like randomuser.me)
    if (avatarPath.includes('randomuser.me') || avatarPath.includes('http://') || avatarPath.includes('https://')) {
      // Ensure URL starts with http:// or https://
      if (!avatarPath.startsWith('http')) {
        return `https:${avatarPath}`;
      }
      return avatarPath;
    }
    
    // Local/uploaded images: we need to make sure this is properly formatted with the full media URL
    // For Django development server, this would be something like http://localhost:8000/media/path/to/image.jpg
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    
    if (avatarPath.startsWith('/media/')) {
      // Already has /media/ prefix
      return `${apiBaseUrl}${avatarPath}`;
    } else if (avatarPath.startsWith('media/')) {
      // Has media/ without leading slash
      return `${apiBaseUrl}/${avatarPath}`;
    } else {
      // No media prefix, add it
      return `${apiBaseUrl}/media/${avatarPath}`;
    }
  };

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      // Use public staff endpoint for viewing staff
      const response = await axios.get(`${API_BASE_URL}/api/complaints/staff/`);
      
      // Parse expertise and languages fields if they're strings
      const processedData = response.data.map((staff: any) => {
        console.log('Original staff avatar path:', staff.avatar);
        const processedAvatar = processAvatarUrl(staff.avatar, staff.name);
        console.log('Processed avatar URL:', processedAvatar);
        
        return {
          ...staff,
          avatar: processedAvatar,
          expertise: typeof staff.expertise === 'string' 
            ? JSON.parse(staff.expertise || '[]') 
            : (Array.isArray(staff.expertise) ? staff.expertise : []),
          languages: typeof staff.languages === 'string' 
            ? JSON.parse(staff.languages || '[]') 
            : (Array.isArray(staff.languages) ? staff.languages : []),
          communication_preferences: typeof staff.communication_preferences === 'string' 
            ? JSON.parse(staff.communication_preferences || '["Chat"]') 
            : (Array.isArray(staff.communication_preferences) ? staff.communication_preferences : ['Chat'])
        };
      });
      
      setStaffMembers(processedData);
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Failed to load staff data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Generate unique departments, roles, and locations for filter dropdowns
  const departments = Array.from(new Set(staffMembers.map(staff => staff.department)));
  const roles = Array.from(new Set(staffMembers.map(staff => staff.role)));
  const locations = Array.from(new Set(staffMembers.map(staff => staff.location).filter(Boolean)));

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    // Required fields
    if (!newStaff.name?.trim()) errors.name = "Name is required";
    if (!newStaff.email?.trim()) errors.email = "Email is required";
    else if (!isValidEmail(newStaff.email)) errors.email = "Please enter a valid email address";
    if (!newStaff.phone?.trim()) errors.phone = "Phone number is required";
    if (!newStaff.role?.trim()) errors.role = "Role is required";
    if (!newStaff.department?.trim()) errors.department = "Department is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setNewStaff(prev => ({...prev, avatar: previewUrl}));
    }
  };

  const handleAddStaff = async () => {
    // Validate form data first
    if (!validateForm()) {
      console.error("Form validation failed", formErrors);
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      // Add all staff fields to FormData
      formData.append('name', newStaff.name || '');
      formData.append('email', newStaff.email || '');
      formData.append('phone', newStaff.phone || '');
      formData.append('role', newStaff.role || '');
      formData.append('department', newStaff.department || '');
      formData.append('location', newStaff.location || '');
      formData.append('status', newStaff.status || 'active');
      formData.append('expertise', JSON.stringify(newStaff.expertise || []));
      formData.append('languages', JSON.stringify(newStaff.languages || []));
      formData.append('communication_preferences', JSON.stringify(newStaff.communication_preferences || ['Chat']));
      formData.append('rating', '0');
      formData.append('active_tickets', '0');
      
      // Append avatar file if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      console.log('Sending staff data with image');

      // Send to backend using admin endpoint with authentication
      const authHeaders = authService.getAuthHeadersWithoutContentType();
      
      if (!authHeaders.Authorization) {
        alert('Authentication required. Please log in as admin first.');
        return;
      }

      console.log('Using auth service headers:', authHeaders);

      const response = await authService.makeAuthenticatedRequest(
        `${API_BASE_URL}/api/complaints/admin/staff/`,
        {
          method: 'POST',
          body: formData,
          headers: authHeaders,  // ✅ Use headers without Content-Type for FormData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Staff creation response:', responseData);

      // Convert the returned data to match our frontend model
      const createdStaff = {
        ...responseData,
        // Parse JSON strings back to arrays
        expertise: Array.isArray(responseData.expertise) 
          ? responseData.expertise 
          : JSON.parse(responseData.expertise || '[]'),
        languages: Array.isArray(responseData.languages)
          ? responseData.languages
          : JSON.parse(responseData.languages || '[]'),
        communication_preferences: Array.isArray(responseData.communication_preferences)
          ? responseData.communication_preferences
          : JSON.parse(responseData.communication_preferences || '["Chat"]')
      };

      // Add to staff list
      setStaffMembers(prev => [...prev, createdStaff]);
      
      // Reset form and close modal
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        location: '',
        status: 'active',
        expertise: [],
        languages: [],
        communication_preferences: ['Chat']
      });
      setAvatarFile(null);
      setAvatarPreview('');
      setFormErrors({});
      setShowAddStaffModal(false);
    } catch (err: any) {
      console.error('Error adding staff member:', err);
      
      // Handle API error messages
      if (err.response?.data) {
        const apiErrors = err.response.data;
        const formattedErrors: { [key: string]: string } = {};
        
        // Transform API errors to form errors
        Object.keys(apiErrors).forEach(key => {
          if (Array.isArray(apiErrors[key])) {
            formattedErrors[key] = apiErrors[key][0];
          } else {
            formattedErrors[key] = apiErrors[key];
          }
        });
        
        setFormErrors(formattedErrors);
      } else {
        alert('Failed to add staff member. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExpertiseChange = (expertise: string) => {
    if (newStaff.expertise?.includes(expertise)) {
      setNewStaff({
        ...newStaff,
        expertise: newStaff.expertise.filter(e => e !== expertise)
      });
    } else {
      setNewStaff({
        ...newStaff,
        expertise: [...(newStaff.expertise || []), expertise]
      });
    }
  };

  const handleLanguageChange = (language: string) => {
    if (newStaff.languages?.includes(language)) {
      setNewStaff({
        ...newStaff,
        languages: newStaff.languages.filter(l => l !== language)
      });
    } else {
      setNewStaff({
        ...newStaff,
        languages: [...(newStaff.languages || []), language]
      });
    }
  };

  const handleCommunicationPrefChange = (pref: string) => {
    if (newStaff.communication_preferences?.includes(pref)) {
      setNewStaff({
        ...newStaff,
        communication_preferences: newStaff.communication_preferences.filter(p => p !== pref)
      });
    } else {
      setNewStaff({
        ...newStaff,
        communication_preferences: [...(newStaff.communication_preferences || []), pref]
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      department: '',
      role: '',
      status: '',
      location: ''
    });
  };

  const filteredStaff = staffMembers.filter(staff => {
    // Search term filter
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Additional filters
    const matchesDepartment = filters.department ? staff.department === filters.department : true;
    const matchesRole = filters.role ? staff.role === filters.role : true;
    const matchesStatus = filters.status ? staff.status === filters.status : true;
    const matchesLocation = filters.location ? staff.location === filters.location : true;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus && matchesLocation;
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return isDark ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800';
      case 'on-leave':
        return isDark ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return isDark ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800';
      default:
        return isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };

  // Fix for the map function error - ensure expertise is always an array
  const renderExpertise = (expertise: any): JSX.Element[] => {
    // If it's a string, try to parse it as JSON
    if (typeof expertise === 'string') {
      try {
        expertise = JSON.parse(expertise);
      } catch (e) {
        expertise = [];
      }
    }
    
    // If it's not an array after parsing, make it an empty array
    if (!Array.isArray(expertise)) {
      expertise = [];
    }
    
    return expertise.map((exp: string) => (
      <span key={exp} className={`text-xs px-2 py-1 rounded-full ${
        isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
      }`}>
        {exp}
      </span>
    ));
  };

  // Similar fix for languages
  const renderLanguages = (languages: any): JSX.Element[] => {
    // If it's a string, try to parse it as JSON
    if (typeof languages === 'string') {
      try {
        languages = JSON.parse(languages);
      } catch (e) {
        languages = [];
      }
    }
    
    // If it's not an array after parsing, make it an empty array
    if (!Array.isArray(languages)) {
      languages = [];
    }
    
    return languages.map((lang: string) => (
      <span key={lang} className={`text-xs px-2 py-1 rounded-full ${
        isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
      }`}>
        {lang}
      </span>
    ));
  };

  const handleEditStaff = (staff: StaffMember) => {
    // Initialize edit data with current staff data
    setSelectedStaff(staff);
    setNewStaff({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      location: staff.location || '',
      status: staff.status,
      avatar: staff.avatar,
      expertise: Array.isArray(staff.expertise) ? staff.expertise : [],
      languages: Array.isArray(staff.languages) ? staff.languages : [],
      communication_preferences: Array.isArray(staff.communication_preferences) ? staff.communication_preferences : ['Chat']
    });
    setAvatarPreview(staff.avatar); // Set the current avatar for preview
    setShowEditModal(true);
  };

  const handleUpdateStaff = async () => {
    if (!selectedStaff || !newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.role || !newStaff.department) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      // Add all staff fields to FormData
      formData.append('name', newStaff.name || '');
      formData.append('email', newStaff.email || '');
      formData.append('phone', newStaff.phone || '');
      formData.append('role', newStaff.role || '');
      formData.append('department', newStaff.department || '');
      formData.append('location', newStaff.location || '');
      formData.append('status', newStaff.status || 'active');
      formData.append('expertise', JSON.stringify(newStaff.expertise || []));
      formData.append('languages', JSON.stringify(newStaff.languages || []));
      formData.append('communication_preferences', JSON.stringify(newStaff.communication_preferences || ['Chat']));
      
      // Append avatar file if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      console.log('Updating staff with ID:', selectedStaff.id);
      console.log('Sending updated data with image');

      // Send to backend using admin endpoint with authentication
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required. Please log in as admin.');
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/complaints/admin/staff/${selectedStaff.id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`, // Use Bearer for Firebase tokens
          }
        }
      );

      console.log('Staff update response:', response.data);

      // Update in staff list
      setStaffMembers(prev => prev.map(staff => 
        staff.id === selectedStaff.id 
          ? {
              ...response.data,
              expertise: Array.isArray(response.data.expertise) 
                ? response.data.expertise 
                : JSON.parse(response.data.expertise || '[]'),
              languages: Array.isArray(response.data.languages)
                ? response.data.languages
                : JSON.parse(response.data.languages || '[]'),
              communication_preferences: Array.isArray(response.data.communication_preferences)
                ? response.data.communication_preferences
                : JSON.parse(response.data.communication_preferences || '["Chat"]')
            } 
          : staff
      ));
      
      // Reset form and close modal
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        location: '',
        status: 'active',
        expertise: [],
        languages: [],
        communication_preferences: ['Chat']
      });
      setAvatarFile(null);
      setAvatarPreview('');
      setSelectedStaff(null);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating staff member:', err);
      alert('Failed to update staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required. Please log in as admin.');
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/api/complaints/admin/staff/${selectedStaff.id}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Use Bearer for Firebase tokens
          }
        }
      );

      // Remove from staff list
      setStaffMembers(prev => prev.filter(staff => staff.id !== selectedStaff.id));
      setSelectedStaff(null);
      setShowDeleteConfirmation(false);
    } catch (err) {
      console.error('Error deleting staff member:', err);
      alert('Failed to delete staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setDisplayCount(prevCount => prevCount + 6);
  };

  if (loading && staffMembers.length === 0) {
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

  const renderStaffCard = (staff: StaffMember) => (
    <div key={staff.id} className={`border ${
      isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200'
    } rounded-lg p-6`}>
      <div className="flex gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <img 
            src={staff.avatar}
            alt={staff.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error(`Error loading image for ${staff.name}:`, staff.avatar);
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite error loop
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=random`;
            }}
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold">{staff.name}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {staff.role} • {staff.department}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(staff.status)}`}>
              {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
            </span>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {renderExpertise(staff.expertise)}
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {renderLanguages(staff.languages)}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {staff.email}
              </span>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditStaff(staff)}
                  className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  title="Edit Staff"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedStaff(staff);
                    setShowDeleteConfirmation(true);
                  }}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Remove Staff"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-400" />
            <h1 className="text-2xl font-semibold">Staff Management</h1>
          </div>
          {isAdmin ? (
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              onClick={() => setShowAddStaffModal(true)}
            >
              <Users className="h-5 w-5" />
              Add Staff
            </button>
          ) : (
            <button 
              className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-help flex items-center gap-2"
              onClick={() => {
                setError("Only administrators can add staff members. Please contact an administrator if you need assistance.");
                setTimeout(() => setError(""), 5000); // Clear message after 5 seconds
              }}
            >
              <Users className="h-5 w-5" />
              Add Staff
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              {error}
            </div>
            <button 
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Debug Panel for Development */}
        {import.meta.env.DEV && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Debug Info (Dev Mode Only)</h3>
            <div className="text-sm text-blue-700">
              <p>User Role: {localStorage.getItem('userRole')}</p>
              <p>Is Authenticated: {localStorage.getItem('isAuthenticated')}</p>
              <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
              <p>Has Admin Token: {localStorage.getItem('adminToken') ? 'Yes' : 'No'}</p>
              <p>Has Auth Token: {localStorage.getItem('authToken') ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff members..."
                className={`w-full pl-10 pr-12 py-2 border rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-200'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
            Filters ({Object.values(filters).filter(Boolean).length})
          </button>
        </div>

        {/* Search Results Summary */}
        {(searchTerm || Object.values(filters).some(Boolean)) && (
          <div className="mb-4 text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Showing {filteredStaff.length} of {staffMembers.length} staff members
              {searchTerm && (
                <span>
                  {' '}for "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </span>
            {(searchTerm || Object.values(filters).some(Boolean)) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  resetFilters();
                }}
                className="ml-3 text-indigo-500 hover:text-indigo-400"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Filters Section */}
        {showFilters && (
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Filter Staff</h2>
              <button 
                onClick={resetFilters} 
                className="text-indigo-500 text-sm hover:underline"
              >
                Reset Filters
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Department</label>
                <select
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  value={filters.department}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Role</label>
                <select
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                >
                  <option value="">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status</label>
                <select
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
              <div>
                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Location</label>
                <select
                  className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStaff.length > 0 ? (
            <>
              {filteredStaff.slice(0, displayCount).map(renderStaffCard)}
              
              {filteredStaff.length > displayCount && (
                <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <ChevronDownIcon className="h-5 w-5" />
                    <span>Load More</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                No staff members found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Staff Member</h2>
              <button
                onClick={() => {
                  setShowAddStaffModal(false);
                  setFormErrors({});
                  setAvatarFile(null);
                  setAvatarPreview('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Profile Image Upload */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 mb-2 flex items-center justify-center bg-gray-100">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview}
                      alt="Staff Avatar Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute bottom-0 right-0 p-2 rounded-full ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.name 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.email 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.phone 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Role *
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.role 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Support Manager">Support Manager</option>
                  <option value="Support Agent">Support Agent</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Complaint Handler">Complaint Handler</option>
                </select>
                {formErrors.role && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.role}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Department *
                </label>
                <select
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.department 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Complaint Management">Complaint Management</option>
                  <option value="Refunds">Refunds</option>
                  <option value="Security">Security</option>
                </select>
                {formErrors.department && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.department}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Location
                </label>
                <input
                  type="text"
                  value={newStaff.location}
                  onChange={(e) => setNewStaff({...newStaff, location: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.location 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                {formErrors.location && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Status
                </label>
                <select
                  value={newStaff.status}
                  onChange={(e) => setNewStaff({...newStaff, status: e.target.value as 'active' | 'inactive' | 'on-leave'})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.status 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
                {formErrors.status && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.status}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Areas of Expertise
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Technical Support', 'Booking Issues', 'Refunds', 'Complaint Resolution',
                  'General Inquiries', 'Passenger Assistance', 'Feedback Management',
                  'Escalation Management', 'Security Concerns', 'Technical Troubleshooting'
                ].map(expertise => (
                  <div key={expertise} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`expertise-${expertise}`}
                      checked={newStaff.expertise?.includes(expertise) || false}
                      onChange={() => handleExpertiseChange(expertise)}
                      className="mr-2"
                    />
                    <label htmlFor={`expertise-${expertise}`} className="text-sm">
                      {expertise}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Languages
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 
                  'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu'
                ].map(language => (
                  <div key={language} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`language-${language}`}
                      checked={newStaff.languages?.includes(language) || false}
                      onChange={() => handleLanguageChange(language)}
                      className="mr-2"
                    />
                    <label htmlFor={`language-${language}`} className="text-sm">
                      {language}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Communication Preferences
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Chat', 'Voice', 'Video'].map(pref => (
                  <div key={pref} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`pref-${pref}`}
                      checked={newStaff.communication_preferences?.includes(pref) || false}
                      onChange={() => handleCommunicationPrefChange(pref)}
                      className="mr-2"
                    />
                    <label htmlFor={`pref-${pref}`} className="text-sm">
                      {pref}
                    </label>
                  </div>
                ))}
              </div>
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                These determine how staff can be contacted through the support system
              </p>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowAddStaffModal(false);
                  setFormErrors({});
                  setAvatarFile(null);
                  setAvatarPreview('');
                }}
                className={`px-4 py-2 border rounded-lg ${
                  isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                disabled={loading}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
              >
                {loading ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Edit Staff Member</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
                  setFormErrors({});
                  setAvatarFile(null);
                  setAvatarPreview('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Profile Image Upload */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 mb-2 flex items-center justify-center bg-gray-100">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview}
                      alt="Staff Avatar Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  className={`absolute bottom-0 right-0 p-2 rounded-full ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Same form fields as Add Staff, but pre-filled */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.name 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.email 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.phone 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Role *
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.role 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Support Manager">Support Manager</option>
                  <option value="Support Agent">Support Agent</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Complaint Handler">Complaint Handler</option>
                </select>
                {formErrors.role && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.role}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Department *
                </label>
                <select
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.department 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Complaint Management">Complaint Management</option>
                  <option value="Refunds">Refunds</option>
                  <option value="Security">Security</option>
                </select>
                {formErrors.department && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.department}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Location
                </label>
                <input
                  type="text"
                  value={newStaff.location}
                  onChange={(e) => setNewStaff({...newStaff, location: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.location 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                {formErrors.location && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Status
                </label>
                <select
                  value={newStaff.status}
                  onChange={(e) => setNewStaff({...newStaff, status: e.target.value as 'active' | 'inactive' | 'on-leave'})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.status 
                      ? 'border-red-500' 
                      : isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
                {formErrors.status && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.status}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Areas of Expertise
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'Technical Support', 'Booking Issues', 'Refunds', 'Complaint Resolution',
                  'General Inquiries', 'Passenger Assistance', 'Feedback Management',
                  'Escalation Management', 'Security Concerns', 'Technical Troubleshooting'
                ].map(expertise => (
                  <div key={expertise} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`expertise-${expertise}`}
                      checked={newStaff.expertise?.includes(expertise) || false}
                      onChange={() => handleExpertiseChange(expertise)}
                      className="mr-2"
                    />
                    <label htmlFor={`expertise-${expertise}`} className="text-sm">
                      {expertise}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Languages
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 
                  'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu'
                ].map(language => (
                  <div key={language} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`language-${language}`}
                      checked={newStaff.languages?.includes(language) || false}
                      onChange={() => handleLanguageChange(language)}
                      className="mr-2"
                    />
                    <label htmlFor={`language-${language}`} className="text-sm">
                      {language}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Communication Preferences
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Chat', 'Voice', 'Video'].map(pref => (
                  <div key={pref} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`pref-${pref}`}
                      checked={newStaff.communication_preferences?.includes(pref) || false}
                      onChange={() => handleCommunicationPrefChange(pref)}
                      className="mr-2"
                    />
                    <label htmlFor={`pref-${pref}`} className="text-sm">
                      {pref}
                    </label>
                  </div>
                ))}
              </div>
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                These determine how staff can be contacted through the support system
              </p>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
                  setFormErrors({});
                  setAvatarFile(null);
                  setAvatarPreview('');
                }}
                className={`px-4 py-2 border rounded-lg ${
                  isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStaff}
                disabled={loading}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
              >
                {loading ? 'Updating...' : 'Update Staff Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-md w-full`}>
            <div className="mb-6 text-center">
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Confirm Removal</h2>
              <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to remove {selectedStaff.name} from staff? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className={`px-4 py-2 border rounded-lg ${
                  isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                disabled={loading}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
              >
                {loading ? 'Removing...' : 'Remove Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;