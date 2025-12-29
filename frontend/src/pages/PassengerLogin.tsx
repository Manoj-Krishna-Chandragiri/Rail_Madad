import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleIcon from '../components/icons/GoogleIcon';
import { useTheme } from '../context/ThemeContext';
import FaceAuthModal from '../components/FaceAuthModal';
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
  userType: 'passenger';
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

const PassengerLogin = () => {
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
    userType: 'passenger'
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignInForm()) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, signInData.email, signInData.password);
      
      // Fetch user profile to get user type
      const userProfile = await fetchAndStoreUserProfile();
      
      // Validate that this user is actually a passenger
      if (!userProfile || !userProfile.is_passenger) {
        setErrors({ general: 'Access denied. Passenger credentials required.' });
        await auth.signOut(); // Sign out the non-passenger user
        return;
      }

      // Set passenger-specific localStorage
      localStorage.setItem('loginType', 'passenger');
      localStorage.setItem('userRole', 'passenger');
      localStorage.setItem('isPassenger', 'true');
      
      // Dispatch custom event to notify app of user type change
      window.dispatchEvent(new Event('userTypeChanged'));
      
      navigate('/user-dashboard');
    } catch (error: any) {
      console.error('Passenger login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrors({ general: 'Invalid passenger credentials' });
      } else if (error.code === 'auth/invalid-credential') {
        setErrors({ general: 'Invalid passenger credentials' });
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
      
      // Fetch user profile to validate passenger status
      const userProfile = await fetchAndStoreUserProfile();
      
      if (!userProfile) {
        setErrors({ general: 'Failed to fetch user profile. Please try again.' });
        return;
      }

      localStorage.setItem('loginType', 'passenger');
      localStorage.setItem('userRole', 'passenger');
      localStorage.setItem('isPassenger', 'true');
      
      window.dispatchEvent(new Event('userTypeChanged'));
      navigate('/user-dashboard');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setErrors({ general: 'Google sign-in failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceAuthSuccess = async (userData: any, firebaseToken: string) => {
    try {
      const isDevToken = firebaseToken && firebaseToken.startsWith('dev-face-token-');
      const effectiveToken = firebaseToken || (isDevToken ? firebaseToken : `dev-face-token-${userData?.id || 'user'}`);

      // Validate that the user is a passenger
      if (userData.user_type !== 'passenger') {
        setErrors({ general: 'This account is not authorized for passenger access.' });
        setShowFaceAuthModal(false);
        return;
      }

      // Store authentication data
      localStorage.setItem('authToken', effectiveToken || '');
      localStorage.setItem('firebaseToken', effectiveToken || '');
      localStorage.setItem('loginType', 'passenger');
      localStorage.setItem('userRole', 'passenger');
      localStorage.setItem('isPassenger', 'true');
      localStorage.setItem('userName', userData.name || userData.email);
      localStorage.setItem('userEmail', userData.email);

      if (userData.profile_image) {
        localStorage.setItem('userAvatar', userData.profile_image);
      }

      window.dispatchEvent(new Event('userTypeChanged'));
      setShowFaceAuthModal(false);
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Face auth success handler error:', error);
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
        userType: 'passenger',
        profileImage: signUpData.gender === 'male' ? MALE_DEFAULT_AVATAR : FEMALE_DEFAULT_AVATAR,
        emailVerified: false,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), userData);
      
      // Register in Django backend
      try {
        await apiClient.post('/api/accounts/profile/create/', {
          email: signUpData.email,
          name: signUpData.name,
          phone_number: signUpData.phoneNumber,
          gender: signUpData.gender,
          address: signUpData.address,
          user_type: 'passenger',
          profile_image: signUpData.gender === 'male' ? MALE_DEFAULT_AVATAR : FEMALE_DEFAULT_AVATAR
        });
      } catch (backendError) {
        console.error('Backend registration failed:', backendError);
      }
      
      // Set localStorage for passenger
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'passenger');
      
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
        userType: 'passenger'
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

        {/* Right Panel - Passenger Login Form */}
        <div className="w-full lg:w-1/2 lg:pl-16">
          <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-8 rounded-lg shadow-xl max-w-md mx-auto`}>
            <h2 className="text-2xl font-bold mb-2">Passenger Portal</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Submit complaints and track your requests</p>

          {!showForgotPassword && !showSignUp ? (
            <form className="space-y-4" onSubmit={handleSignIn}>
              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Email Address
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
                  placeholder="your.email@example.com"
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
                      theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
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
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

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
              <h3 className="text-2xl font-bold mb-2">Create Passenger Account</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Register to submit complaints and track requests
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
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    I agree to the Terms of Service and Privacy Policy
                  </label>
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
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter your email"
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
  </>
  );
};

export default PassengerLogin;