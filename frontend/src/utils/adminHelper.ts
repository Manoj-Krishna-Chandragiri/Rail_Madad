import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';

/**
 * Helper utilities for admin authentication
 */
export const adminHelper = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user,
        token: await userCredential.user.getIdToken()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error
      };
    }
  },

  /**
   * Create a new admin account
   */
  createAccount: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user,
        token: await userCredential.user.getIdToken()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error
      };
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      await signOut(auth);
      // Clear local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error
      };
    }
  },

  /**
   * Reset password for an email
   */
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error
      };
    }
  },

  /**
   * Check if currently logged in
   */
  isLoggedIn: () => {
    return localStorage.getItem('isAuthenticated') === 'true' && 
           localStorage.getItem('adminToken') !== null;
  }
};
