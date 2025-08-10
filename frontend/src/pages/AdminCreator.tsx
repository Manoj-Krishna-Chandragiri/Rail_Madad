import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { AlertCircle, CheckCircle, Shield, ArrowLeft } from 'lucide-react';
import { createAdminAccount } from '../utils/adminCreator';

const AdminCreator: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const navigate = useNavigate();

  // Protect this page from being accessed in production
  useEffect(() => {
    if (import.meta.env.PROD) {
      navigate('/login');
    }
  }, [navigate]);

  const handleCreateAdmin = async () => {
    if (import.meta.env.PROD) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await createAdminAccount();
      
      if (result?.error) {
        setError(`Failed to create admin: ${result.error}`);
      } else if (result?.user) {
        setAdminInfo({
          email: result.email,
          password: result.password,
          uid: result.user.uid
        });
        
        // Get token and save to localStorage
        const token = await result.user.getIdToken();
        localStorage.setItem('adminToken', token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        
        setSuccess(result.created 
          ? 'Admin account created successfully!' 
          : 'Admin account already exists and is ready to use.'
        );
      }
    } catch (err: any) {
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://railmadad-dashboard.web.app/assets/body-bg-BM5rPYaf.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-8 rounded-lg shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-indigo-500" />
                <h1 className="text-xl font-semibold">Admin Account Creator</h1>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700'}`}>
                <CheckCircle className="h-5 w-5" />
                <span>{success}</span>
              </div>
            )}

            <div className={`p-4 mb-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-sm mb-2">
                <span className="font-medium">Development use only!</span> This tool creates an admin account for development and testing.
              </div>
              
              <div className="text-sm text-red-500">
                Never use this in production environments.
              </div>
            </div>

            {adminInfo && (
              <div className={`p-4 mb-6 rounded-lg ${theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
                <h3 className="font-medium mb-2">Admin Account Details</h3>
                <div className="space-y-1 text-sm font-mono">
                  <div><span className="font-semibold">Email:</span> {adminInfo.email}</div>
                  <div><span className="font-semibold">Password:</span> {adminInfo.password}</div>
                  <div><span className="font-semibold">UID:</span> {adminInfo.uid}</div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleCreateAdmin}
                disabled={loading}
                className={`flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                }`}
              >
                {loading ? 'Processing...' : 'Create Admin Account'}
              </button>
              
              {adminInfo && (
                <button
                  onClick={() => navigate('/login')}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Go to Login
                </button>
              )}
            </div>

            <div className="mt-6 text-xs text-center">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Default admin credentials: adm.railmadad@gmail.com / admin@2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreator;
