import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Bell, AlertTriangle, Globe, VolumeX, Volume2, Shield, Monitor, Mail, Calendar, Check } from 'lucide-react';
import { playTestSound, playSuccessSound } from '../utils/soundPlayer';

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
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
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
  }, []);

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

  // Save all settings to localStorage
  const handleSaveSettings = () => {
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
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <label htmlFor={`notification-${key}`} className="cursor-pointer">
                        <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {key === 'emailAlerts' ? 'Get email notifications for complaint updates' :
                           key === 'statusUpdates' ? 'Receive updates when your complaint status changes' :
                           key === 'marketingEmails' ? 'Receive promotional and newsletter emails' :
                           'Get notifications about system announcements'}
                        </p>
                      </label>
                    </div>
                    <button
                      id={`notification-${key}`}
                      type="button"
                      onClick={() => handlePreferenceChange(setNotificationSettings, key, !value)}
                      role="switch"
                      aria-checked={value}
                      aria-label={`${key.replace(/([A-Z])/g, ' $1').trim()} notifications ${value ? 'enabled' : 'disabled'}`}
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
                aria-label="Save all settings"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Save Settings
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
              Changes will be applied immediately and saved to your browser
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;