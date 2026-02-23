import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAeP3pD8WZkil9h-Z06_WLtEJgmC6rRFko",
  authDomain: "railmadad-login.firebaseapp.com",
  projectId: "railmadad-login",
  storageBucket: "railmadad-login.appspot.com",
  messagingSenderId: "914935310403",
  appId: "1:914935310403:web:edc5a318f2d9c9e9df8cf6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence to LOCAL (browser local storage) to prevent session timeouts
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting Firebase persistence:', error);
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Export the app instance
export { app };

export default app;
