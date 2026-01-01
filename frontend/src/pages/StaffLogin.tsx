import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleIcon from '../components/icons/GoogleIcon';
import { useTheme } from '../context/ThemeContext';
import FaceAuthModal from '../components/FaceAuthModal';
import TermsModal from '../components/TermsModal';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from '../config/firebase';
import { fetchAndStoreUserProfile } from '../utils/auth-helpers';
import { setDoc, doc } from 'firebase/firestore';
import apiClient from '../utils/api';

const MALE_DEFAULT_AVATAR = 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/default-profile-picture-male-icon.png';
const FEMALE_DEFAULT_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHEJ-8GyKlZr5ZmEfRMmt5nR4tH_aP-crbgg&s';

interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  gender: 'male' | 'female' | '';
  address: string;
  userType: 'staff';
  employeeId: string;
  department: string;
  role: string;
  location: string;
  expertise: string[];
  languages: string[];
  communicationChannels: string[];
}

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, label, required = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  return (
    <div>
      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10 
            ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          required={required}
        />
        <button
          type="button"
          className={`absolute right-2 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setShowPassword(!showPassword)}
        >
          <svg 
            viewBox="0 0 24 24" 
            width="20" 
            height="20"
          >
            {showPassword ? (
              <path 
                fill="currentColor"
                fillRule="evenodd" 
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              />
            ) : (
              <path 
                fill="currentColor"
                fillRule="evenodd" 
                d="M7.119 14.563L5.982 16.53l-1.732-1 1.301-2.253A8.97 8.97 0 0 1 3 7h2a7 7 0 0 0 14 0h2a8.973 8.973 0 0 1-2.72 6.448l1.202 2.083-1.732 1-1.065-1.845A8.944 8.944 0 0 1 13 15.946V18h-2v-2.055a8.946 8.946 0 0 1-3.881-1.382z"
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
};

const StaffLogin = () => {
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  const [signUpData, setSignUpData] = useState<SignUpData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    gender: '',
    address: '',
    userType: 'staff',
    employeeId: '',
    department: '',
    role: '',
    location: '',
    expertise: [],
    languages: [],
    communicationChannels: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showFaceAuthModal, setShowFaceAuthModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms');
  
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Using shared Firebase auth instance

  const validateSignInForm = () => {
    const newErrors: Record<string, string> = {};

    if (!signInData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signInData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!signInData.password) {
      newErrors.password = 'Password is required';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Please accept the Terms of Service and Privacy Policy to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTermsClick = (type: 'terms' | 'privacy') => {
    setModalType(type);
    setShowTermsModal(true);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignInForm()) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, signInData.email, signInData.password);
      
      // Fetch user profile to get user type
      const userProfile = await fetchAndStoreUserProfile();
      
      if (!userProfile) {
        setErrors({ general: 'Failed to fetch user profile. Please try again.' });
        return;
      }

      // Set staff-specific localStorage
      localStorage.setItem('loginType', 'staff');
      localStorage.setItem('userRole', 'staff');
      localStorage.setItem('isStaff', 'true');
      
      // Dispatch custom event to notify app of user type change
      window.dispatchEvent(new Event('userTypeChanged'));
      
      navigate('/staff-dashboard');
    } catch (error: any) {
      console.error('Staff login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrors({ general: 'Invalid staff credentials' });
      } else if (error.code === 'auth/invalid-credential') {
        setErrors({ general: 'Invalid staff credentials' });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      // Fetch user profile to validate staff status
      const userProfile = await fetchAndStoreUserProfile();
      
      if (!userProfile) {
        setErrors({ general: 'Failed to fetch user profile. Please try again.' });
        return;
      }

      localStorage.setItem('loginType', 'staff');
      localStorage.setItem('userRole', 'staff');
      localStorage.setItem('isStaff', 'true');
      
      window.dispatchEvent(new Event('userTypeChanged'));
      navigate('/staff-dashboard');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setErrors({ general: 'Google sign-in failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceAuthSuccess = async (userData: any, firebaseToken: string) => {
    try {
      console.log('🎯 Face auth success handler called:', { userData, firebaseToken });
      
      const isDevToken = firebaseToken && firebaseToken.startsWith('dev-face-token-');
      const effectiveToken = firebaseToken || (isDevToken ? firebaseToken : `dev-face-token-${userData?.id || 'user'}`);

      // Validate that the user is staff
      if (userData.user_type !== 'staff') {
        setErrors({ general: 'This account is not authorized for staff access.' });
        setShowFaceAuthModal(false);
        return;
      }

      console.log('✅ Storing auth data:', {
        token: effectiveToken,
        userType: userData.user_type,
        userId: userData.id
      });

      // Store authentication data
      localStorage.setItem('authToken', effectiveToken || '');
      localStorage.setItem('firebaseToken', effectiveToken || '');
      localStorage.setItem('loginType', 'staff');
      localStorage.setItem('userRole', 'staff');
      localStorage.setItem('isStaff', 'true');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', String(userData.id || ''));
      localStorage.setItem('userName', userData.full_name || userData.name || userData.email);
      localStorage.setItem('userEmail', userData.email);

      if (userData.profile_image) {
        localStorage.setItem('userAvatar', userData.profile_image);
      }

      console.log('✅ Auth data stored, triggering userTypeChanged event');
      window.dispatchEvent(new Event('userTypeChanged'));
      
      setShowFaceAuthModal(false);
      
      console.log('✅ Navigating to staff dashboard...');
      // Small delay to ensure storage is complete
      setTimeout(() => {
        navigate('/staff-dashboard');
      }, 100);
    } catch (error) {
      console.error('❌ Face auth success handler error:', error);
      setErrors({ general: 'Authentication succeeded but navigation failed.' });
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setForgotPasswordMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setForgotPasswordMessage('Error sending reset email. Please try again.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      setErrors({ general: 'Please accept the Terms of Service and Privacy Policy to continue' });
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setErrors({ general: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        signUpData.email, 
        signUpData.password
      );
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      
      // Get token for backend authentication
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', user.email || '');
      
      // Prepare user data for Firestore
      const userData = {
        email: signUpData.email,
        name: signUpData.name,
        phoneNumber: signUpData.phoneNumber,
        gender: signUpData.gender,
        address: signUpData.address,
        userType: 'staff',
        employeeId: signUpData.employeeId,
        department: signUpData.department,
        role: signUpData.role,
        location: signUpData.location,
        expertise: signUpData.expertise,
        languages: signUpData.languages,
        communicationChannels: signUpData.communicationChannels,
        profileImage: signUpData.gender === 'male' ? MALE_DEFAULT_AVATAR : FEMALE_DEFAULT_AVATAR,
        emailVerified: false,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), userData);
      
      // Register in Django backend using the new staff registration endpoint
      try {
        console.log('Attempting to register staff in backend...');
        const response = await apiClient.post('/api/accounts/staff/register/', {
          email: signUpData.email,
          name: signUpData.name,
          phone_number: signUpData.phoneNumber,
          gender: signUpData.gender,
          address: signUpData.address,
          employee_id: signUpData.employeeId,
          department: signUpData.department,
          role: signUpData.role,
          location: signUpData.location,
          expertise: signUpData.expertise,
          languages: signUpData.languages,
          communication_channels: signUpData.communicationChannels,
        });
        console.log('✅ Staff registered successfully in backend:', response.data);
      } catch (backendError: any) {
        console.error('❌ Backend registration failed:', backendError);
        console.error('Error details:', backendError.response?.data);
        
        // Show the actual error to the user
        if (backendError.response?.data?.error) {
          throw new Error(`Backend registration failed: ${backendError.response.data.error}`);
        }
        throw new Error('Failed to register staff profile in database. Please contact administrator.');
      }
      
      // Set localStorage for staff
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'staff');
      
      setErrors({ general: 'Account created successfully! Please check your email and verify before signing in.' });
      setShowSignUp(false);
      
      // Clear the form
      setSignUpData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        gender: '',
        address: '',
        userType: 'staff',
        employeeId: '',
        department: '',
        role: '',
        location: '',
        expertise: [],
        languages: [],
        communicationChannels: []
      });
      setAcceptedTerms(false);
    } catch (error: any) {
      console.error('Error during signup:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ general: 'Email Address Already Exists!' });
      } else {
        setErrors({ general: `Unable to create user: ${error.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-[url('https://railmadad-dashboard.web.app/assets/body-bg-BM5rPYaf.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="container mx-auto px-4 flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 text-white flex-col justify-center pr-16">
          <div className="flex items-center gap-4 mb-6">
            <img src="https://railmadad-dashboard.web.app/assets/train-DBEUZT8P.png" alt="Rail Madad Logo" className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Rail Madad Portal</h1>
          </div>
          <p className="text-lg mb-8 opacity-90">
            Welcome to the Rail Madad portal. This secure platform is designed to assist all users—whether you're a passenger, client, or admin.
            It enables you to easily submit inquiries, address grievances, and receive assistance for a smoother travel experience.
          </p>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <img
                key={num}
                src={`https://railmadad.indianrailways.gov.in/madad/final/images/booking-icon-${num === 8 ? 2 : num}.png`}
                alt={`Railway Icon ${num}`}
                className="w-12 h-12"
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Staff Login Form */}
        <div className="w-full lg:w-1/2 lg:pl-16">
          <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-8 rounded-lg shadow-xl max-w-md mx-auto`}>
            <h2 className="text-2xl font-bold mb-2">Staff Portal</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Access for railway staff members</p>

          {!showForgotPassword && !showSignUp ? (
            <form className="space-y-4" onSubmit={handleSignIn}>
              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Staff Email
                </label>
                <input
                  type="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="staff@railmadad.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
              >
                {isLoading ? 'Signing In...' : 'Sign In as Staff'}
              </button>

              <div className={`mt-6 p-4 rounded-lg ${
                !acceptedTerms 
                  ? theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                  : theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="acceptTerms" className={`text-sm cursor-pointer flex-1 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => handleTermsClick('terms')}
                      className="text-indigo-500 hover:text-indigo-400 underline font-medium"
                    >
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={() => handleTermsClick('privacy')}
                      className="text-indigo-500 hover:text-indigo-400 underline font-medium"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
                {!acceptedTerms && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-3 flex items-center gap-2">
                    <span className="text-lg">*</span> Please accept the terms and conditions to continue
                  </p>
                )}
                {acceptedTerms && (
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium mt-2 flex items-center gap-2">
                    <span>✓</span> Thank you for accepting our terms
                  </p>
                )}
              </div>

              <div className="my-6 flex items-center">
                <div className={`flex-1 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}></div>
                <span className={`px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Or continue with</span>
                <div className={`flex-1 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 border py-2 rounded-lg ${
                  theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <GoogleIcon />
                Sign in with Google
              </button>

              <button
                type="button"
                onClick={() => setShowFaceAuthModal(true)}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 border py-2 rounded-lg ${
                  theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sign in with Face
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-indigo-500 hover:text-indigo-400"
                >
                  Forgot password?
                </button>
              </div>

              <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setShowSignUp(true)}
                  className="text-indigo-500 hover:text-indigo-400 font-medium"
                >
                  Sign up
                </button>
                {' | '}
                <Link to="/login-portal" className="text-indigo-500 hover:text-indigo-400 font-medium">
                  Back to Login
                </Link>
              </p>
            </form>
          ) : showSignUp ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-2">Create Staff Account</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Register as a railway staff member
              </p>

              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                      ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                      ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={signUpData.phoneNumber}
                    onChange={(e) => setSignUpData({ ...signUpData, phoneNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                      ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Gender *
                  </label>
                  <select
                    value={signUpData.gender}
                    onChange={(e) => setSignUpData({ ...signUpData, gender: e.target.value as 'male' | 'female' })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                      ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Address
                  </label>
                  <textarea
                    value={signUpData.address}
                    onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                      ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    rows={3}
                  />
                </div>

                {/* Staff-specific fields */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Staff Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        value={signUpData.employeeId}
                        onChange={(e) => setSignUpData({ ...signUpData, employeeId: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                          ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                          Department *
                        </label>
                        <select
                          value={signUpData.department}
                          onChange={(e) => setSignUpData({ ...signUpData, department: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                            ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        >
                          <option value="">Select Department</option>
                          <option value="Customer Service">Customer Service</option>
                          <option value="Technical">Technical</option>
                          <option value="Operations">Operations</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Security">Security</option>
                          <option value="Medical">Medical</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                          Role *
                        </label>
                        <select
                          value={signUpData.role}
                          onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                            ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        >
                          <option value="">Select Role</option>
                          <option value="Staff">Staff</option>
                          <option value="Senior Staff">Senior Staff</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Manager">Manager</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                        Location *
                      </label>
                      <input
                        type="text"
                        value={signUpData.location}
                        onChange={(e) => setSignUpData({ ...signUpData, location: e.target.value })}
                        placeholder="e.g., Mumbai Central Station"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                          ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                        Areas of Expertise (Select multiple)
                      </label>
                      <select
                        multiple
                        value={signUpData.expertise}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setSignUpData({ ...signUpData, expertise: selected });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                          ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        size={4}
                      >
                        <option value="Ticketing">Ticketing</option>
                        <option value="Refunds">Refunds</option>
                        <option value="Train Delays">Train Delays</option>
                        <option value="Cleanliness">Cleanliness</option>
                        <option value="Safety">Safety</option>
                        <option value="Lost & Found">Lost & Found</option>
                        <option value="Medical">Medical</option>
                        <option value="Food Quality">Food Quality</option>
                      </select>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Hold Ctrl/Cmd to select multiple
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                        Languages Spoken (Select multiple)
                      </label>
                      <select
                        multiple
                        value={signUpData.languages}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setSignUpData({ ...signUpData, languages: selected });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                          ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        size={4}
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Bengali">Bengali</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Marathi">Marathi</option>
                        <option value="Gujarati">Gujarati</option>
                        <option value="Kannada">Kannada</option>
                      </select>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Hold Ctrl/Cmd to select multiple
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                        Preferred Communication Channels (Select multiple)
                      </label>
                      <select
                        multiple
                        value={signUpData.communicationChannels}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setSignUpData({ ...signUpData, communicationChannels: selected });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                          ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        size={3}
                      >
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="SMS">SMS</option>
                        <option value="WhatsApp">WhatsApp</option>
                      </select>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Hold Ctrl/Cmd to select multiple
                      </p>
                    </div>
                  </div>
                </div>

                <PasswordInput
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  label="Password"
                  required
                />
                <PasswordInput
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  label="Confirm Password"
                  required
                />
                
                <div className={`p-4 rounded-lg ${
                  !acceptedTerms 
                    ? theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                    : theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="acceptTerms" className={`text-sm cursor-pointer flex-1 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => handleTermsClick('terms')}
                        className="text-indigo-500 hover:text-indigo-400 underline font-medium"
                      >
                        Terms of Service
                      </button>
                      {' '}and{' '}
                      <button
                        type="button"
                        onClick={() => handleTermsClick('privacy')}
                        className="text-indigo-500 hover:text-indigo-400 underline font-medium"
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                  {!acceptedTerms && (
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-3 flex items-center gap-2">
                      <span className="text-lg">*</span> Please accept the terms and conditions to continue
                    </p>
                  )}
                  {acceptedTerms && (
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium mt-2 flex items-center gap-2">
                      <span>✓</span> Thank you for accepting our terms
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating Account...' : 'Sign up'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignUp(false);
                      setAcceptedTerms(false);
                      setErrors({});
                    }}
                    className={`flex-1 border py-2 rounded-lg 
                      ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-2">Reset Password</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Enter your email to reset your password
              </p>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Staff Email
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter your staff email"
                />
              </div>
              {forgotPasswordMessage && (
                <div className={`p-3 rounded-lg text-sm ${forgotPasswordMessage.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {forgotPasswordMessage}
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleForgotPassword}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className={`flex-1 border py-2 rounded-lg ${
                    theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Face Authentication Modal */}
  <FaceAuthModal
    isOpen={showFaceAuthModal}
    onClose={() => setShowFaceAuthModal(false)}
    onSuccess={handleFaceAuthSuccess}
    mode="login"
  />

  {/* Terms Modal */}
  <TermsModal
    isOpen={showTermsModal}
    onClose={() => setShowTermsModal(false)}
    type={modalType}
  />
  </>
  );
};

export default StaffLogin;