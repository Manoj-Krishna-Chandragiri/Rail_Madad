import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { adminHelper } from '../utils/adminHelper';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      const result = await adminHelper.resetPassword(email);
      
      if (result.success) {
        setSuccessMessage(`Password reset instructions have been sent to ${email}. Please check your inbox.`);
        setEmail('');
      } else {
        setErrorMessage('Failed to send reset email. Please try again.');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      setErrorMessage(`Reset failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://railmadad-dashboard.web.app/assets/body-bg-BM5rPYaf.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-8 rounded-lg shadow-xl`}>
            <div className="text-center mb-8">
              <img
                src="https://railmadad-dashboard.web.app/assets/logo-railmadad-B9R2Xeqc.png"
                alt="Rail Madad Logo"
                className="mx-auto h-16"
              />
              <h2 className="text-2xl font-bold mt-4">Reset Password</h2>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Enter your email to receive password reset instructions
              </p>
            </div>

            {errorMessage && (
              <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
                <AlertCircle className="h-5 w-5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700'}`}>
                <CheckCircle className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'border-gray-300 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    placeholder="your-email@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                {loading ? 'Sending Instructions...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 flex justify-center">
              <Link 
                to="/login" 
                className="flex items-center text-indigo-500 hover:text-indigo-600 gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
