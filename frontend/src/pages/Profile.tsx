import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  getAuth, 
  onAuthStateChanged, 
  updateProfile, 
  deleteUser, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

interface UserData {
  name: string;
  email: string;
  phoneNumber?: string;
  gender?: 'male' | 'female';
  address?: string;
  profileImage?: string;
  createdAt?: string;
}

const MALE_DEFAULT_AVATAR = 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/default-profile-picture-male-icon.png';
const FEMALE_DEFAULT_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHEJ-8GyKlZr5ZmEfRMmt5nR4tH_aP-crbgg&s';

interface MFAResponse {
  success: boolean;
  message: string;
}

const Profile: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const auth = getAuth();
  const db = getFirestore();

  const handleImageUpload = async (file: File) => {
    if (!auth.currentUser) return null;

    try {
      console.log('🔧 Uploading image to Cloudinary...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'profile_images'); // Make sure this preset exists
      formData.append('folder', 'rail-madad-profiles');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dtfpje06i/image/upload', // Your cloud name
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      console.log('🔧 Cloudinary response:', data);
      
      if (data.secure_url) {
        console.log('✅ Image uploaded successfully:', data.secure_url);
        return data.secure_url;
      } else {
        console.error('❌ Cloudinary upload failed:', data);
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  };

  const fetchUserData = async (user: any) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      // Get the latest profile image URL from Firestore
      const profileImage = userData?.profileImage || 
        (userData?.gender === 'female' ? FEMALE_DEFAULT_AVATAR : MALE_DEFAULT_AVATAR);

      setUserData({
        name: userData?.name || user.displayName || 'User',
        email: user.email || '',
        phoneNumber: userData?.phoneNumber || '',
        gender: userData?.gender,
        address: userData?.address || '',
        profileImage: profileImage // Use the stored image URL
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData({
        name: user.displayName || 'User',
        email: user.email || '',
        profileImage: MALE_DEFAULT_AVATAR
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  useEffect(() => {
    const checkNewUser = async () => {
      const isNewUser = new URLSearchParams(location.search).get('newUser');
      const user = auth.currentUser;
      
      if (isNewUser === 'true' && user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (!userData?.gender) {
          setIsEditing(true);
          setEditedData({
            name: userData?.name || user.displayName || '',
            email: user.email || '',
            profileImage: userData?.profileImage || user.photoURL || '',
            gender: undefined,
            phoneNumber: userData?.phoneNumber || '',
            address: userData?.address || ''
          });
        }
      }
    };

    checkNewUser();
  }, [location, auth.currentUser, db]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(userData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Reduce size more aggressively
          const MAX_SIZE = 400; // Reduced from 800
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                }
              },
              'image/jpeg',
              0.6 // Reduced quality for smaller file size
            );
          }
        };
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedData) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setEditedData({ ...editedData, profileImage: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const reAuthenticateGoogleUser = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      return true;
    } catch (error) {
      console.error('Re-authentication failed:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!editedData || !auth.currentUser) return;
    setUpdating(true);
    let imageUrl = editedData.profileImage;

    try {
      const isGoogleUser = auth.currentUser.providerData[0]?.providerId === 'google.com';
      
      // Check if user document exists
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      // Create updates object with only defined values
      const updates: Partial<UserData> = {};
      
      if (editedData.name) updates.name = editedData.name;
      if (editedData.phoneNumber !== undefined) updates.phoneNumber = editedData.phoneNumber;
      if (editedData.address !== undefined) updates.address = editedData.address;
      if (editedData.gender !== undefined) updates.gender = editedData.gender;

      // Handle image upload if changed
      if (editedData.profileImage?.startsWith('data:') || editedData.profileImage?.startsWith('blob:')) {
        try {
          const file = await fetch(editedData.profileImage).then(r => r.blob());
          const uploadedUrl = await handleImageUpload(file as File);
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
            updates.profileImage = imageUrl;
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          throw new Error('Image upload failed');
        }
      }

      // If document doesn't exist, create it with initial data
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: auth.currentUser.email,
          ...updates,
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing document
        await updateDoc(userRef, updates);
      }

      // Update auth profile
      if (isGoogleUser) {
        try {
          await reAuthenticateGoogleUser();
        } catch (error) {
          console.error('Re-authentication failed but continuing with update');
        }
      }

      await updateProfile(auth.currentUser, {
        displayName: editedData.name || undefined,
        photoURL: imageUrl || undefined
      });

      // Refresh user data
      await fetchUserData(auth.currentUser);
      setIsEditing(false);
      setEditedData(null);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        alert(`Failed to update profile: ${error.message}`);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };


  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;

    try {
      // First, call the backend to delete user from Django database
      try {
        const token = await auth.currentUser.getIdToken();
        await fetch('/api/accounts/profile/delete/', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('User deleted from Django database');
      } catch (backendError) {
        console.warn('Failed to delete user from backend:', backendError);
        // Continue with Firebase deletion even if backend fails
      }

      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", auth.currentUser.uid));

      // Delete user account from Firebase Auth
      await deleteUser(auth.currentUser);

      // Clear ALL localStorage data
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('verificationData');
      localStorage.removeItem('mockUser');
      localStorage.removeItem('token');
      
      // Clear any other potential localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('user') || key.startsWith('auth') || key.startsWith('admin'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Dispatch event to notify components of user change
      window.dispatchEvent(new Event('userTypeChanged'));
      
      // Redirect to login page
      navigate('/login');
      
      // Show success message
      alert('Account deleted successfully. You will be redirected to the login page.');
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setError(error.message || 'Failed to delete account');
    }
  };

  const showMessage = (message: string, setError: (message: string) => void, type: 'success' | 'error') => {
    setError(message);
    return type;
  };

  const handleEnableMFA = async () => {
    try {
      const vId = await setupMFA('recaptcha-container');
      setVerificationId(vId);
      setShowMFASetup(true);
      setMessageType(showMessage('Verification code sent to your phone', setError, 'success'));
    } catch (error) {
      setMessageType(showMessage('Failed to setup MFA. Ensure phone number is verified.', setError, 'error'));
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await enrollMFA(verificationId, verificationCode);
      setMessageType(showMessage('Two-factor authentication enabled successfully', setError, 'success'));
      setShowMFASetup(false);
    } catch (error) {
      setMessageType(showMessage('Invalid verification code', setError, 'error'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center p-6">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <img
              src={isEditing ? editedData?.profileImage : userData?.profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mb-4"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                // Use a data URL as ultimate fallback
                img.src = `data:image/svg+xml;base64,${btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                    <rect width="200" height="200" fill="#3b82f6"/>
                    <circle cx="100" cy="80" r="30" fill="white"/>
                    <circle cx="100" cy="160" r="50" fill="white"/>
                    <text x="100" y="190" text-anchor="middle" fill="#3b82f6" font-size="14">User</text>
                  </svg>
                `)}`;
              }}
            />
            {isEditing && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Change Photo
                </button>
              </>
            )}
          </div>

          <div className="flex-1 space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedData?.name}
                    onChange={(e) => setEditedData(prev => ({ ...prev!, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                      ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editedData?.phoneNumber}
                    onChange={(e) => setEditedData(prev => ({ ...prev!, phoneNumber: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                      ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Address
                  </label>
                  <textarea
                    value={editedData?.address || ''}
                    onChange={(e) => setEditedData(prev => ({ ...prev!, address: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                      ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    rows={3}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Gender *
                  </label>
                  <select
                    value={editedData?.gender || ''}
                    onChange={(e) => setEditedData(prev => ({ ...prev!, gender: e.target.value as 'male' | 'female' }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                      ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={updating}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={updating}
                    className={`flex-1 border py-2 rounded 
                      ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Full Name
                  </label>
                  <p className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {userData?.name}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email
                  </label>
                  <p className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {userData?.email}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Phone Number
                  </label>
                  <p className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {userData?.phoneNumber || 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Gender
                  </label>
                  <p className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {userData?.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Address
                  </label>
                  <p className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {userData?.address || 'Not provided'}
                  </p>
                </div>
                
                {/* Move edit button to bottom */}
                <div className="pt-6">
                  <button
                    onClick={handleEdit}
                    className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Danger Zone
          </h2>
          <div className={`p-4 border border-red-500 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-red-500 font-semibold mb-2">Delete Account</h3>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300'
                  }`}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setPassword('');
                      setError('');
                    }}
                    className={`px-4 py-2 rounded border ${
                      theme === 'dark'
                        ? 'border-gray-600 hover:bg-gray-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <div className={`p-4 border rounded-lg ${theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200'}`}>
            <div id="recaptcha-container"></div>
            {messageType && (
              <div className={`mb-4 p-3 rounded ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {error}
              </div>
            )}
            {showMFASetup ? (
              <form onSubmit={handleVerifyMFA} className="space-y-4">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Verify and Enable 2FA
                </button>
              </form>
            ) : (
              <button
                onClick={handleEnableMFA}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Enable Two-Factor Authentication
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add uploadToCloudinary and setupMFA type declarations
const uploadToCloudinary = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rail_madad'); // Your upload preset

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

// Setup MFA container and send verification code
const setupMFA = async (containerId: string): Promise<string> => {
  try {
    // Initialize reCAPTCHA in the specified container
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error('Container not found');
    }

    // Simulate sending verification code
    const verificationId = Math.random().toString(36).substring(7);
    return verificationId;
  } catch (error) {
    console.error('MFA setup error:', error);
    throw error;
  }
};

// Verify and enroll MFA
const enrollMFA = async (verificationId: string, code: string): Promise<void> => {
  try {
    // Validate inputs
    if (!verificationId || !code) {
      throw new Error('Missing verification ID or code');
    }

    // Simulate verification
    const isValid = code.length === 6 && /^\d+$/.test(code);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Success case - would normally verify with backend
    console.log('MFA enrolled with:', { verificationId, code });
  } catch (error) {
    console.error('MFA enrollment error:', error);
    throw error;
  }
};

export type { MFAResponse };
export { uploadToCloudinary, setupMFA, enrollMFA };
export default Profile;
