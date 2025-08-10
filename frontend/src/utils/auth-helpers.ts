import axios from "axios";
import { getAuth } from "firebase/auth";

// Function to fetch user profile and store date_joined in localStorage
export const fetchAndStoreUserProfile = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }
    
    // Get a fresh token
    const token = await user.getIdToken(true);
    
    // Make API call to get user profile
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/accounts/profile/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Store important user data in localStorage
    if (response.data) {
      localStorage.setItem("userRole", response.data.user_type);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", response.data.email);
      
      // Store date_joined for legacy admin check
      if (response.data.date_joined) {
        localStorage.setItem("dateJoined", response.data.date_joined);
        console.log("Date joined stored:", response.data.date_joined);
      }
      
      // Store admin status
      if (response.data.is_admin) {
        localStorage.setItem("isAdmin", "true");
      } else {
        localStorage.removeItem("isAdmin");
      }
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Function to check if a user is a legacy admin (joined before Aug 10, 2025)
export const isLegacyAdmin = () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!isAdmin) return false;
  
  const dateJoined = localStorage.getItem("dateJoined");
  if (!dateJoined) return false;
  
  try {
    const joinDate = new Date(dateJoined);
    const cutoffDate = new Date("2025-08-10T17:52:30.241331");
    
    return joinDate < cutoffDate;
  } catch (error) {
    console.error("Error parsing date:", error);
    return false;
  }
};
