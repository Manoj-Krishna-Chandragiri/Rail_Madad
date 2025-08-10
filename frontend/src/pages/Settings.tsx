import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Bell, AlertTriangle, Globe, VolumeX, Volume2, Shield, Monitor, Mail, Calendar } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    statusUpdates: true,
    marketingEmails: false,
    announcements: true
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
          <SettingsIcon className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-semibold">User Settings</h1>
        </div>

        <div className="space-y-8">
          {/* Theme Settings */}
          <div>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-indigo-400" />
              Display
            </h2>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div>
                <span>Dark Mode</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-400" />
              Notifications
            </h2>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div>
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {key === 'emailAlerts' ? 'Get email notifications for complaint updates' :
                       key === 'statusUpdates' ? 'Receive updates when your complaint status changes' :
                       key === 'marketingEmails' ? 'Receive promotional and newsletter emails' :
                       'Get notifications about system announcements'}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePreferenceChange(setNotificationSettings, key, !value)}
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
          </div>

          {/* Language Settings */}
          <div>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              Language
            </h2>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <label className="block mb-2">Preferred Language</label>
              <select
                value={languagePreference}
                onChange={(e) => setLanguagePreference(e.target.value)}
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
          </div>

          {/* Sound Settings */}
          <div>
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              {soundEnabled ? 
                <Volume2 className="h-5 w-5 text-indigo-400" /> : 
                <VolumeX className="h-5 w-5 text-indigo-400" />
              }
              Sound
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div>
                  <span>Sound Effects</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enable sound effects for notifications</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
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
                  <span>Volume</span>
                  <span className="font-semibold">{soundVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Accessibility Settings */}
        <div>
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-indigo-400" />
            Accessibility
          </h2>
          <div className="space-y-4">
            {Object.entries(accessibilitySettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div>
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {key === 'highContrast' ? 'Increase contrast for better readability' :
                     key === 'largeText' ? 'Increase text size throughout the application' :
                     key === 'reduceMotion' ? 'Reduce animations and motion effects' :
                     'Optimize for screen readers'}
                  </p>
                </div>
                <button
                  onClick={() => handlePreferenceChange(setAccessibilitySettings, key, !value)}
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
          </div>
        </div>
  
          {/* Save Settings Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;