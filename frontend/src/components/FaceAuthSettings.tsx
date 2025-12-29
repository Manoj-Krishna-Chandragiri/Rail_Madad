import React, { useState, useEffect } from 'react';
import FaceAuthModal from './FaceAuthModal';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../utils/api';

interface FaceAuthLog {
  id: number;
  status: string;
  confidence_score: number;
  timestamp: string;
  ip_address: string;
  is_successful: boolean;
}

const FaceAuthSettings: React.FC = () => {
  const { theme } = useTheme();
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [faceProfile, setFaceProfile] = useState<any>(null);
  const [authLogs, setAuthLogs] = useState<FaceAuthLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    checkEnrollmentStatus();
  }, []);

  const checkEnrollmentStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/accounts/face-profile/status/');
      
      if (response.data.enrolled) {
        setEnrolled(true);
        setFaceProfile(response.data.profile);
      } else {
        setEnrolled(false);
        setFaceProfile(null);
      }
    } catch (err: any) {
      console.error('Error checking enrollment status:', err);
      setError('Failed to check enrollment status');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollSuccess = (data: any) => {
    setSuccess('Face enrolled successfully! You can now use face authentication to login.');
    setEnrolled(true);
    setFaceProfile(data.data);
    setShowEnrollModal(false);
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleRemoveFace = async () => {
    if (!confirm('Are you sure you want to remove your face authentication? You will need to re-enroll to use this feature again.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.delete('/api/accounts/face-profile/remove/');
      
      if (response.data.success) {
        setSuccess('Face profile removed successfully');
        setEnrolled(false);
        setFaceProfile(null);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.data.message || 'Failed to remove face profile');
      }
    } catch (err: any) {
      console.error('Error removing face:', err);
      setError('Failed to remove face profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFace = async () => {
    setShowEnrollModal(true);
  };

  const fetchAuthLogs = async () => {
    try {
      const response = await apiClient.get('/api/accounts/face-auth/logs/');
      if (response.data.success) {
        setAuthLogs(response.data.logs);
        setShowLogs(true);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch authentication logs');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
      case 'low_confidence':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'no_face':
      case 'multiple_faces':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className={`rounded-lg shadow p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Face Authentication
            </h3>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Use your face to quickly and securely login
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            enrolled 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {enrolled ? 'Enrolled' : 'Not Enrolled'}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Content */}
        {enrolled ? (
          <div>
            {/* Enrolled Status */}
            <div className={`border rounded-lg p-4 mb-4 ${
              theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-start gap-4">
                {faceProfile?.face_image && (
                  <img 
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${faceProfile.face_image}`}
                    alt="Face Profile"
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Your Face Profile
                  </h4>
                  <div className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>Enrolled: {faceProfile?.enrollment_date ? formatDate(faceProfile.enrollment_date) : 'N/A'}</p>
                    <p>Quality Score: {faceProfile?.image_quality_score ? (faceProfile.image_quality_score * 100).toFixed(1) : 'N/A'}%</p>
                    <p>Model: {faceProfile?.model_name || 'Facenet'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleUpdateFace}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Update Face
              </button>

              <button
                onClick={fetchAuthLogs}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Auth History
              </button>

              <button
                onClick={handleRemoveFace}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Face
              </button>
            </div>

            {/* Auth Logs */}
            {showLogs && authLogs.length > 0 && (
              <div className="mt-6">
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Authentication Attempts
                </h4>
                <div className="space-y-2">
                  {authLogs.map((log) => (
                    <div 
                      key={log.id}
                      className={`border rounded-lg p-3 ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(log.status)}`}>
                            {log.status}
                          </span>
                          {log.confidence_score > 0 && (
                            <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {(log.confidence_score * 100).toFixed(1)}% confidence
                            </span>
                          )}
                        </div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      {log.ip_address && (
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          From: {log.ip_address}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Not Enrolled */}
            <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
            }`}>
              <svg 
                className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h4 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Face Authentication Not Set Up
              </h4>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Enroll your face to enable quick and secure biometric login
              </p>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Enroll Face
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <div className="text-indigo-600 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h5 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Fast Login
                </h5>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Login in seconds without typing passwords
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <div className="text-indigo-600 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h5 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Secure
                </h5>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your face is unique and cannot be stolen
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <div className="text-indigo-600 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h5 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Convenient
                </h5>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No need to remember complex passwords
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      <FaceAuthModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        onSuccess={handleEnrollSuccess}
        mode="enroll"
      />
    </div>
  );
};

export default FaceAuthSettings;
