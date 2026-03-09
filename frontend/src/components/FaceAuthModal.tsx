import React, { useState } from 'react';
import FaceCapture from './FaceCapture';
import { useTheme } from '../context/ThemeContext';

interface FaceAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any, token: string) => void;
  mode: 'login' | 'enroll';
}

const FaceAuthModal: React.FC<FaceAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCapture, setShowCapture] = useState(false);

  if (!isOpen) return null;

  const handleImageCapture = async (imageData: string) => {
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' 
        ? '/api/accounts/face-auth/login/'
        : '/api/accounts/face-profile/enroll/';

      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(mode === 'enroll' && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        body: JSON.stringify({ image: imageData })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (mode === 'login') {
          // Handle login success
          if (data.firebase_token) {
            onSuccess(data.user, data.firebase_token);
          } else {
            setError('Authentication successful but token generation failed');
          }
        } else {
          // Handle enrollment success
          onSuccess(data, '');
        }
        onClose();
      } else {
        setError(data.message || 'Operation failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Face auth error:', err);
      setError('Connection error. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowCapture(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className={`relative w-full max-w-2xl rounded-lg shadow-xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {mode === 'login' ? 'Face Authentication Login' : 'Enroll Your Face'}
            </h2>
            <button
              onClick={handleCancel}
              className={`rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
                <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Processing your face data...
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This may take a few seconds
                </p>
              </div>
            ) : !showCapture ? (
              <div className="text-center py-8">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                <h3 className={`text-xl font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {mode === 'login' 
                    ? 'Ready to authenticate with your face?' 
                    : 'Ready to enroll your face?'
                  }
                </h3>
                
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {mode === 'login'
                    ? 'Click the button below to open your camera and authenticate.'
                    : 'This will allow you to login using facial recognition in the future.'
                  }
                </p>

                {mode === 'enroll' && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-900 bg-opacity-30 border-blue-700' : 'bg-blue-50 border-blue-200'
                  } border`}>
                    <h4 className={`font-semibold mb-2 ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      Before you begin:
                    </h4>
                    <ul className={`text-sm text-left space-y-1 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                    }`}>
                      <li>• Find a well-lit area</li>
                      <li>• Remove glasses and hats</li>
                      <li>• Face the camera directly</li>
                      <li>• Keep a neutral expression</li>
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setShowCapture(true)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Open Camera
                </button>
              </div>
            ) : (
              <FaceCapture
                onCapture={handleImageCapture}
                onCancel={handleCancel}
                title={mode === 'login' ? 'Authenticate Your Face' : 'Capture Your Face'}
                captureButtonText="Capture"
                retakeButtonText="Retake"
                showPreview={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceAuthModal;
