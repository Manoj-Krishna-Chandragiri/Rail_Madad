import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Bell, AlertTriangle, Globe, VolumeX, Volume2, Monitor, Check, Loader2 } from 'lucide-react';
import { playTestSound, playSuccessSound } from '../utils/soundPlayer';
import apiClient from '../utils/api';

interface NotificationSettings {
  emailAlerts?: boolean;
  email_alerts?: boolean;
  statusUpdates?: boolean;
  status_updates?: boolean;
  marketingEmails?: boolean;
  marketing_emails?: boolean;
  announcements?: boolean;
  feedbackNotifications?: boolean;
  feedback_notifications?: boolean;
  assignmentNotifications?: boolean;
  assignment_notifications?: boolean;
  resolutionNotifications?: boolean;
  resolution_notifications?: boolean;
}

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_alerts: true,
    status_updates: true,
    marketing_emails: false,
    announcements: true,
    feedback_notifications: true,
    assignment_notifications: true,
    resolution_notifications: true
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false
  });

  const [languagePreference, setLanguagePreference] = useState('en');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(80);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load settings from localStorage and API on mount
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
    
    // Load from localStorage first
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.notifications) setNotificationSettings(parsed.notifications);
        if (parsed.accessibility) setAccessibilitySettings(parsed.accessibility);
        if (parsed.language) setLanguagePreference(parsed.language);
        if (parsed.sound !== undefined) setSoundEnabled(parsed.sound);
        if (parsed.volume !== undefined) setSoundVolume(parsed.volume);
        
        // Apply accessibility settings
        applyAccessibilitySettings(parsed.accessibility || accessibilitySettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
    
    // Try to load from API
    if (email) {
      loadNotificationPreferences(email);
    }
  }, []);

  const loadNotificationPreferences = async (email: string) => {
    try {
      const response = await apiClient.get(`/api/accounts/notifications/?email=${email}&role=passenger`);
      if (response.data.preferences) {
        setNotificationSettings(response.data.preferences);
      }
    } catch (error) {
      console.error('Failed to load notification preferences from API:', error);
      // Silently fail - will use localStorage defaults
    }
  };

  // Apply accessibility settings to the document
  const applyAccessibilitySettings = (settings: typeof accessibilitySettings) => {
    const root = document.documentElement;
    
    // High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large Text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Reduce Motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Screen Reader optimizations
    if (settings.screenReader) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  };

  // Apply accessibility settings whenever they change
  useEffect(() => {
    applyAccessibilitySettings(accessibilitySettings);
  }, [accessibilitySettings]);

  // Function to handle preference changes
  const handlePreferenceChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    key: string,
    value: any
  ) => {
    setter((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  // Save all settings to localStorage and API
  const handleSaveSettings = async () => {
    setIsSaving(true);
    const settings = {
      notifications: notificationSettings,
      accessibility: accessibilitySettings,
      language: languagePreference,
      sound: soundEnabled,
      volume: soundVolume
    };
    
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      applyAccessibilitySettings(accessibilitySettings);
      
      // Save to API if user is authenticated
      if (userEmail) {
        try {
          await apiClient.post('/api/accounts/notifications/preferences/', {
            email: userEmail,
            ...notificationSettings
          });
        } catch (apiError) {
          console.error('Failed to save to API:', apiError);
          // Still show success if localStorage saved
        }
      }
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Play success sound if enabled
      if (soundEnabled) {
        playSuccessSound();
      }
      
      console.log('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'ur', name: 'Urdu' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-indigo-400" aria-hidden="true" />
          <h1 className="text-2xl font-semibold">User Settings</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }} aria-label="User settings form">
          <div className="space-y-8">
            {/* Theme Settings */}
            <section aria-labelledby="display-settings">
              <h2 id="display-settings" className="text-xl font-medium mb-4 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                Display
              </h2>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div>
                  <label htmlFor="dark-mode-toggle" className="cursor-pointer">
                    <span className="font-medium">Dark Mode</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                  </label>
                </div>
                <button
                  id="dark-mode-toggle"
                  type="button"
                  onClick={toggleTheme}
                  role="switch"
                  aria-checked={theme === 'dark'}
                  aria-label={`Dark mode is ${theme === 'dark' ? 'enabled' : 'disabled'}. Click to ${theme === 'dark' ? 'disable' : 'enable'}.`}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </section>

            {/* Notification Settings */}
            <section aria-labelledby="notification-settings">
              <h2 id="notification-settings" className="text-xl font-medium mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label htmlFor="email-alerts" className="cursor-pointer">
                      <span className="font-medium">Email Alerts</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get email notifications for complaint updates</p>
                    </label>
                  </div>
                  <button
                    id="email-alerts"
                    type="button"
                    onClick={() => handlePreferenceChange(setNotificationSettings, 'email_alerts', !notificationSettings.email_alerts)}
                    role="switch"
                    aria-checked={notificationSettings.email_alerts || false}
                    aria-label={`Email alerts ${notificationSettings.email_alerts ? 'enabled' : 'disabled'}`}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
                      ${notificationSettings.email_alerts ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${notificationSettings.email_alerts ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label htmlFor="status-updates" className="cursor-pointer">
                      <span className="font-medium">Status Updates</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates when your complaint status changes</p>
                    </label>
                  </div>
                  <button
                    id="status-updates"
                    type="button"
                    onClick={() => handlePreferenceChange(setNotificationSettings, 'status_updates', !notificationSettings.status_updates)}
                    role="switch"
                    aria-checked={notificationSettings.status_updates || false}
                    aria-label={`Status updates ${notificationSettings.status_updates ? 'enabled' : 'disabled'}`}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
                      ${notificationSettings.status_updates ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${notificationSettings.status_updates ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label htmlFor="marketing-emails" className="cursor-pointer">
                      <span className="font-medium">Marketing Emails</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive promotional and newsletter emails</p>
                    </label>
                  </div>
                  <button
                    id="marketing-emails"
                    type="button"
                    onClick={() => handlePreferenceChange(setNotificationSettings, 'marketing_emails', !notificationSettings.marketing_emails)}
                    role="switch"
                    aria-checked={notificationSettings.marketing_emails || false}
                    aria-label={`Marketing emails ${notificationSettings.marketing_emails ? 'enabled' : 'disabled'}`}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
                      ${notificationSettings.marketing_emails ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${notificationSettings.marketing_emails ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label htmlFor="announcements" className="cursor-pointer">
                      <span className="font-medium">Announcements</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notifications about system announcements</p>
                    </label>
                  </div>
                  <button
                    id="announcements"
                    type="button"
                    onClick={() => handlePreferenceChange(setNotificationSettings, 'announcements', !notificationSettings.announcements)}
                    role="switch"
                    aria-checked={notificationSettings.announcements || false}
                    aria-label={`Announcements ${notificationSettings.announcements ? 'enabled' : 'disabled'}`}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
                      ${notificationSettings.announcements ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${notificationSettings.announcements ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label htmlFor="feedback-notifications" className="cursor-pointer">
                      <span className="font-medium">Feedback Notifications</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive feedback</p>
                    </label>
                  </div>
                  <button
                    id="feedback-notifications"
                    type="button"
                    onClick={() => handlePreferenceChange(setNotificationSettings, 'feedback_notifications', !notificationSettings.feedback_notifications)}
                    role="switch"
                    aria-checked={notificationSettings.feedback_notifications || false}
                    aria-label={`Feedback notifications ${notificationSettings.feedback_notifications ? 'enabled' : 'disabled'}`}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
                      ${notificationSettings.feedback_notifications ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${notificationSettings.feedback_notifications ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label htmlFor="assignment-notifications" className="cursor-pointer">
                      <span className="font-medium">Assignment Notifications</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when complaint is assigned</p>
                    </label>
                  </div>
                  <button
                    id="assignment-notifications"
                    type="button"
                    onClick={() => handlePreferenceChange(setNotificationSettings, 'assignment_notifications', !notificationSettings.assignment_notifications)}
                    role="switch"
                    aria-checked={notificationSettings.assignment_notifications || false}
                    aria-label={`Assignment notifications ${notificationSettings.assignment_notifications ? 'enabled' : 'disabled'}`}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
                      ${notificationSettings.assignment_notifications ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${notificationSettings.assignment_notifications ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label htmlFor="resolution-notifications" className="cursor-pointer">
                      <span className="font-medium">Resolution Notifications</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when complaint is resolved</p>
                    </label>
                  </div>
                  <button
                    id="resolution-notifications"
                    type="button"
                    onClick={() => handlePreferenceChange(setNotificationSettings, 'resolution_notifications', !notificationSettings.resolution_notifications)}
                    role="switch"
                    aria-checked={notificationSettings.resolution_notifications || false}
                    aria-label={`Resolution notifications ${notificationSettings.resolution_notifications ? 'enabled' : 'disabled'}`}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
                      ${notificationSettings.resolution_notifications ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${notificationSettings.resolution_notifications ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Language Settings */}
            <section aria-labelledby="language-settings">
              <h2 id="language-settings" className="text-xl font-medium mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                Language
              </h2>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <label htmlFor="language-select" className="block mb-2 font-medium">
                  Preferred Language
                </label>
                <select
                  id="language-select"
                  value={languagePreference}
                  onChange={(e) => setLanguagePreference(e.target.value)}
                  aria-label="Select preferred language"
                  className={`w-full p-2 rounded border ${
                    theme === 'dark' 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Choose your preferred language for notifications and communications
                </p>
              </div>
            </section>

            {/* Sound Settings */}
            <section aria-labelledby="sound-settings">
              <h2 id="sound-settings" className="text-xl font-medium mb-4 flex items-center gap-2">
                {soundEnabled ? 
                  <Volume2 className="h-5 w-5 text-indigo-400" aria-hidden="true" /> : 
                  <VolumeX className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                }
                Sound
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label htmlFor="sound-toggle" className="cursor-pointer">
                      <span className="font-medium">Sound Effects</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enable sound effects for notifications</p>
                    </label>
                  </div>
                  <button
                    id="sound-toggle"
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    role="switch"
                    aria-checked={soundEnabled}
                    aria-label={`Sound effects ${soundEnabled ? 'enabled' : 'disabled'}`}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
                      ${soundEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                {soundEnabled && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="volume-slider" className="font-medium">Volume</label>
                      <span className="font-semibold" aria-live="polite">{soundVolume}%</span>
                    </div>
                    <input
                      id="volume-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={soundVolume}
                      onChange={(e) => setSoundVolume(parseInt(e.target.value))}
                      aria-label={`Volume level ${soundVolume} percent`}
                      className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={playTestSound}
                      className="mt-3 w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      aria-label="Play test sound"
                    >
                      <Volume2 className="h-4 w-4" aria-hidden="true" />
                      Test Sound
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Accessibility Settings */}
          <section aria-labelledby="accessibility-settings">
            <h2 id="accessibility-settings" className="text-xl font-medium mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-indigo-400" aria-hidden="true" />
              Accessibility
            </h2>
            <div className="space-y-4">
              {Object.entries(accessibilitySettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <label htmlFor={`accessibility-${key}`} className="cursor-pointer">
                      <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {key === 'highContrast' ? 'Increase contrast for better readability' :
                         key === 'largeText' ? 'Increase text size throughout the application' :
                         key === 'reduceMotion' ? 'Reduce animations and motion effects' :
                         'Optimize for screen readers'}
                      </p>
                    </label>
                  </div>
                  <button
                    id={`accessibility-${key}`}
                    type="button"
                    onClick={() => handlePreferenceChange(setAccessibilitySettings, key, !value)}
                    role="switch"
                    aria-checked={value}
                    aria-label={`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
                      ${value ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${value ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
        </section>

        {/* Save Settings Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button 
                type="submit"
                disabled={isSaving}
                aria-label="Save all settings"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Save Settings
                  </>
                )}
              </button>
              {saveSuccess && (
                <span 
                  className="text-green-600 dark:text-green-400 text-sm font-medium animate-fade-in"
                  role="status"
                  aria-live="polite"
                >
                  ✓ Settings saved successfully!
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Changes will be applied immediately and saved to your browser and account
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;