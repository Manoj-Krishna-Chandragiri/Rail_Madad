import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Utility to create admin account in development environments
 * This should NEVER be used in production
 */
export const createAdminAccount = async () => {
  if (import.meta.env.PROD) {
    console.error('Cannot create admin account in production!');
    return null;
  }

  const adminEmail = 'adm.railmadad@gmail.com';
  const adminPassword = 'admin@2025';

  try {
    // Try to sign in first
    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('Admin account already exists, signed in successfully');
      return {
        user: userCredential.user,
        email: adminEmail,
        password: adminPassword,
        created: false
      };
    } catch (loginError: any) {
      // If login fails due to non-existent user, create the account
      if (loginError.code === 'auth/user-not-found' || 
          loginError.code === 'auth/invalid-credential' ||
          loginError.code === 'auth/wrong-password') {
        
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log('Admin account created successfully');
        return {
          user: userCredential.user,
          email: adminEmail,
          password: adminPassword,
          created: true
        };
      }
      throw loginError;
    }
  } catch (error: any) {
    console.error('Error with admin account:', error.message);
    return {
      error: error.message,
      email: adminEmail,
      code: error.code
    };
  }
};

/**
 * Get the firebase auth token for the admin user
 */
export const getAdminToken = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting admin token:', error);
    return null;
  }
};
