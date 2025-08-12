import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const getValidToken = async (): Promise<string | null> => {
  // First check if we have an admin token in localStorage
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    console.log('Using stored admin token');
    return adminToken;
  }
  
  // Otherwise, use Firebase auth
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.log('No authenticated user found');
    return null;
  }
  
  try {
    // Force refresh the token to ensure it's valid
    const token = await user.getIdToken(true);
    console.log('Token refreshed successfully');
    return token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

export const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};

export const waitForAuthReady = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
};
