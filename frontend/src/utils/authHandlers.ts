import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../config/firebase';

export const handleEmailSignIn = async (email: string, password: string) => {
  const auth = getAuth();
  
  // Use Firebase authentication for all users, including admin
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Get Firebase ID token
  const token = await user.getIdToken();

  // Special admin account check
  if (email === 'adm.railmadad@gmail.com') {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('adminToken', token);
    localStorage.setItem('userEmail', user.email || '');
    localStorage.setItem('userId', user.uid);
    return { success: true, redirect: '/dashboard' };
  }

  if (!user.emailVerified) {
    throw new Error('Please verify your email before signing in. Check your inbox.');
  }

  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userRole', 'passenger');
  localStorage.setItem('userEmail', user.email || '');
  localStorage.setItem('userId', user.uid);
  localStorage.setItem('authToken', token);

  return { success: true, redirect: '/' };
};

export const handlePhoneSignIn = async (phone: string) => {
  try {
    // Create a query against the users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', phone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // No user found with this phone number
      throw new Error('No account found with this phone number. Please sign up first.');
    }

    // Get the first matching document
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Set user session data
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'passenger');
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('userId', userDoc.id);
    localStorage.setItem('userName', userData.name || '');

    return { success: true, redirect: '/' };
  } catch (error: any) {
    console.error('Phone sign-in error:', error);
    throw error;
  }
};

export const validatePhoneVerification = async (verificationData: any) => {
  const { code, phone, enteredCode } = verificationData;

  if (code !== enteredCode) {
    throw new Error('Invalid verification code');
  }

  // If code matches, proceed with phone sign in
  return handlePhoneSignIn(phone);
};

// Add helper function to handle mock verification for testing
export const handleMockVerification = async (phone: string) => {
  // In mock mode, just set the authentication without checking database
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userRole', 'passenger');
  localStorage.setItem('userPhone', phone);
  localStorage.setItem('mockUser', 'true');

  return { success: true, redirect: '/' };
};
