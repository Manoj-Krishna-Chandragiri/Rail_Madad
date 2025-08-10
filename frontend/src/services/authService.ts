import { auth } from '../config/firebase';
import { User } from 'firebase/auth';
import { isLegacyAdmin } from '../utils/auth-helpers';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRole: string;
  token: string | null;
  isLegacyAdmin: boolean;
}

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];

  // Get current authentication state
  getAuthState(): AuthState {
    const user = auth.currentUser;
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole') || 'passenger';
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    const isAdmin = userRole === 'admin';

    return {
      user,
      isAuthenticated,
      isAdmin,
      userRole,
      token,
      isLegacyAdmin: isAdmin ? isLegacyAdmin() : false
    };
  }
  
  // Check if user is an admin who joined before August 10, 2025
  checkLegacyAdminStatus(): boolean {
    return isLegacyAdmin();
  }

  // Get auth headers for API calls
  getAuthHeaders(): Record<string, string> {
    const { token, isAdmin } = this.getAuthState();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (isAdmin) {
      headers['X-Admin-Access'] = 'true';
    }

    return headers;
  }

  // Get auth headers without Content-Type (for FormData requests)
  getAuthHeadersWithoutContentType(): Record<string, string> {
    const { token, isAdmin } = this.getAuthState();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (isAdmin) {
      headers['X-Admin-Access'] = 'true';
    }

    return headers;
  }

  // Create authenticated fetch request
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.error('Authentication failed - 401 Unauthorized');
      // Optionally redirect to login or refresh token
    }

    return response;
  }

  // Make authenticated request (alias for compatibility)
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // If headers are provided and don't include Content-Type, use them as-is
    // This is for FormData requests where Content-Type should not be set manually
    if (options.headers && !('Content-Type' in options.headers)) {
      const response = await fetch(url, {
        ...options,
        headers: options.headers,
      });

      if (response.status === 401) {
        console.error('Authentication failed - 401 Unauthorized');
      }

      return response;
    }
    
    // Otherwise use the regular authenticated fetch
    return this.authenticatedFetch(url, options);
  }

  // Subscribe to auth state changes
  subscribe(callback: (state: AuthState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of auth state change
  private notifyListeners(): void {
    const state = this.getAuthState();
    this.listeners.forEach(listener => listener(state));
  }

  // Login as admin
  async loginAsAdmin(_email: string, _password: string): Promise<void> {
    try {
      // Your admin login logic here
      // TODO: Implement actual admin authentication
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('isAuthenticated', 'true');
      this.notifyListeners();
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await auth.signOut();
      this.clearAllUserData();
      this.notifyListeners();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  // Comprehensive user data cleanup
  clearAllUserData(): void {
    // Remove standard auth items
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('verificationData');
    localStorage.removeItem('mockUser');
    localStorage.removeItem('token');
    
    // Clear any other potential localStorage items that start with user/auth/admin
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('user') || key.startsWith('auth') || key.startsWith('admin'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Dispatch event to notify components
    window.dispatchEvent(new Event('userTypeChanged'));
  }

  // Check if user is admin
  isUserAdmin(): boolean {
    return this.getAuthState().isAdmin;
  }

  // Check if user is authenticated
  isUserAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  }
}

// Create and export the singleton instance
export const authService = new AuthService();

// Also export as default for backward compatibility
export default authService;