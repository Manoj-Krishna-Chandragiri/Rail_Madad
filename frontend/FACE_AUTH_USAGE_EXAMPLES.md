/**
 * Example: How to Add Face Authentication Settings to Profile Page
 * 
 * This file shows how to integrate the FaceAuthSettings component
 * into your existing user profile pages.
 */

// ========================================
// Example 1: Add to Profile.tsx
// ========================================

import FaceAuthSettings from '../components/FaceAuthSettings';

// Inside your Profile component, add a new section:
function Profile() {
  return (
    <div className="container mx-auto p-6">
      {/* ... existing profile sections ... */}
      
      {/* Add Face Authentication Section */}
      <div className="mb-6">
        <FaceAuthSettings />
      </div>
      
      {/* ... rest of profile sections ... */}
    </div>
  );
}

// ========================================
// Example 2: Add as a Tab in Settings
// ========================================

import { useState } from 'react';
import FaceAuthSettings from '../components/FaceAuthSettings';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  
  return (
    <div className="container mx-auto p-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 ${activeTab === 'profile' ? 'border-b-2 border-indigo-600' : ''}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 ${activeTab === 'security' ? 'border-b-2 border-indigo-600' : ''}`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('face-auth')}
          className={`px-4 py-2 ${activeTab === 'face-auth' ? 'border-b-2 border-indigo-600' : ''}`}
        >
          Face Authentication
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileSettings />}
      {activeTab === 'security' && <SecuritySettings />}
      {activeTab === 'face-auth' && <FaceAuthSettings />}
    </div>
  );
}

// ========================================
// Example 3: Standalone Face Auth Page
// ========================================

import FaceAuthSettings from '../components/FaceAuthSettings';

function FaceAuthPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Face Authentication</h1>
      <FaceAuthSettings />
    </div>
  );
}

export default FaceAuthPage;

// ========================================
// Example 4: Add Route to Your Router
// ========================================

// In your main router file (e.g., App.tsx or routes.tsx):
import FaceAuthSettings from './components/FaceAuthSettings';

// Add this route:
{
  path: '/profile/face-auth',
  element: (
    <div className="container mx-auto p-6 max-w-4xl">
      <FaceAuthSettings />
    </div>
  )
}

// ========================================
// Example 5: Add Link in Navigation
// ========================================

// In your navigation menu:
<nav>
  <Link to="/profile">Profile</Link>
  <Link to="/profile/face-auth">Face Authentication</Link>
  <Link to="/settings">Settings</Link>
</nav>

// ========================================
// Testing the Integration
// ========================================

/**
 * 1. Start your backend server:
 *    cd backend
 *    python manage.py runserver
 * 
 * 2. Start your frontend:
 *    cd frontend
 *    npm run dev
 * 
 * 3. Login to your application
 * 
 * 4. Navigate to where you added FaceAuthSettings
 * 
 * 5. Click "Enroll Face" to set up facial authentication
 * 
 * 6. After enrollment, logout and try "Sign in with Face" on login page
 */

// ========================================
// Customization Options
// ========================================

/**
 * The FaceAuthSettings component is fully self-contained and doesn't
 * require any props. It automatically:
 * - Checks enrollment status
 * - Handles enrollment
 * - Manages face removal
 * - Shows authentication history
 * - Handles all errors and loading states
 * 
 * You can customize the appearance by modifying the component itself
 * or wrapping it in your own styled container.
 */

// Example: Wrapped in a card
function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2>Profile Information</h2>
        {/* ... profile fields ... */}
      </div>
      
      {/* Face Auth Card */}
      <FaceAuthSettings />
      
      {/* Security Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2>Security Settings</h2>
        {/* ... security options ... */}
      </div>
    </div>
  );
}
