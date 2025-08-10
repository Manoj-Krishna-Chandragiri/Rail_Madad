import { useState, useEffect } from 'react';
import { User, Settings, Shield } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';  // Using relative path
interface AdminData {
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  address: string;
}

const AdminProfile = () => {
  const { theme } = useTheme();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        console.log('Current token:', token); // Debug log

        if (!token) {
          setError('Not authenticated');
          navigate('/login');
          return;
        }

        // Check your frontend axios configuration
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        // Make sure all API calls use this base URL
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/profile/`,
          {
            headers: {
              'Authorization': `Token ${token}`, // Changed from Bearer to Token
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Admin data response:', response.data); // Debug log
        setAdminData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !adminData) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">{error || 'Please sign in as admin to view your profile.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <User className="h-12 w-12 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold">Admin Profile</h1>
              <p className="text-gray-600">Manage your admin account settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 p-2 border rounded-lg">{adminData.full_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 p-2 border rounded-lg">{adminData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <p className="mt-1 p-2 border rounded-lg">{adminData.phone_number}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="mt-1 p-2 border rounded-lg">{adminData.gender}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 p-2 border rounded-lg">{adminData.address}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Settings
              </h2>
              <div className="mt-4 space-y-4">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Edit Profile
                </button>
                <button className="ml-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Change Password
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                <Shield className="h-5 w-5" />
                Security Settings
              </h2>
              <div className="mt-4">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Enable Two-Factor Authentication
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
