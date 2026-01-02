import { Globe, ChevronDown, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit?: () => void;
  }
}

const MultiLingual = () => {
  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTranslateReady, setIsTranslateReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const translateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'Urdu', native: 'اردو' }
  ];

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang && languages.find(l => l.code === savedLang)) {
      setSelectedLanguage(savedLang);
    }
  }, []);

  // Sync with Google Translate widget's actual current language
  useEffect(() => {
    const syncWithWidget = () => {
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElement && selectElement.value) {
        const currentLang = selectElement.value;
        if (currentLang !== selectedLanguage) {
          console.log(`🔄 MultiLingual: Syncing dropdown to widget's language: ${currentLang}`);
          setSelectedLanguage(currentLang);
        }
      }
    };

    // Sync immediately when component mounts
    syncWithWidget();

    // Monitor for changes to the widget's select element
    const intervalId = setInterval(syncWithWidget, 500);

    // Also listen for storage changes (when language is changed from another tab/component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferred_language' && e.newValue) {
        console.log(`📦 MultiLingual: Storage change detected: ${e.newValue}`);
        setSelectedLanguage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedLanguage]);

  // Custom language switcher function
  const changeLanguage = (langCode: string) => {
    setSelectedLanguage(langCode);
    setShowDropdown(false);
    localStorage.setItem('preferred_language', langCode);
    
    // Wait for Google Translate to be ready, then change language
    const attemptTranslate = () => {
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Clear the interval once successful
        if (translateIntervalRef.current) {
          clearInterval(translateIntervalRef.current);
          translateIntervalRef.current = null;
        }
      }
    };

    // Try immediately
    attemptTranslate();
    
    // If not immediately available, keep trying for a few seconds
    if (!translateIntervalRef.current) {
      let attempts = 0;
      translateIntervalRef.current = setInterval(() => {
        attempts++;
        attemptTranslate();
        
        // Stop after 20 attempts (10 seconds)
        if (attempts >= 20 && translateIntervalRef.current) {
          clearInterval(translateIntervalRef.current);
          translateIntervalRef.current = null;
        }
      }, 500);
    }
  };

  useEffect(() => {
    console.log('Setting up Google Translate...');
    let pollInterval: NodeJS.Timeout | null = null;

    // Check if widget already exists from previous initialization (e.g., from Navbar)
    const checkExistingWidget = () => {
      const existingWidget = document.querySelector('.goog-te-combo');
      if (existingWidget) {
        console.log('✅ Found existing Google Translate widget!');
        setIsTranslateReady(true);
        setLoadError(false); // Clear any error state
        
        // Sync with widget's current language
        const select = existingWidget as HTMLSelectElement;
        if (select.value) {
          setSelectedLanguage(select.value);
        }
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkExistingWidget()) {
      return;
    }

    // Poll for widget existence (in case it's still initializing)
    pollInterval = setInterval(() => {
      if (checkExistingWidget()) {
        if (pollInterval) clearInterval(pollInterval);
      }
    }, 300);

    // Stop polling after 3 seconds and proceed to load script
    const timeoutId = setTimeout(() => {
      if (pollInterval) clearInterval(pollInterval);
      const existingWidget = document.querySelector('.goog-te-combo');
      if (existingWidget) {
        setIsTranslateReady(true);
        setLoadError(false);
        return; // Widget found, no need to load script
      }
      loadGoogleTranslateScript();
    }, 3000);

    const loadGoogleTranslateScript = () => {

      // Initialize Google Translate - SET THIS FIRST before loading script
      window.googleTranslateElementInit = () => {
      console.log('✅ googleTranslateElementInit callback triggered!');
      try {
        if (!window.google?.translate?.TranslateElement) {
          console.error('❌ Google Translate API not available on window object');
          setLoadError(true);
          return;
        }

        console.log('Creating TranslateElement...');
        
        // Clear the container first
        const container = document.getElementById('google_translate_element');
        if (container) {
          container.innerHTML = '';
        }
        
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,bn,te,ta,mr,gu,kn,ml,pa,ur',
            layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
            autoDisplay: false,
            multilanguagePage: true,
          },
          'google_translate_element'
        );
        
        console.log('TranslateElement created, waiting for widget...');
        
        // Wait for widget to be fully initialized with longer checks
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          
          // Check multiple possible selectors
          const selectElement = document.querySelector('.goog-te-combo') || 
                               document.querySelector('select.goog-te-combo') ||
                               document.querySelector('#google_translate_element select');
          
          if (selectElement) {
            console.log('✅ Google Translate widget ready!');
            console.log('Widget element:', selectElement);
            clearInterval(checkInterval);
            setIsTranslateReady(true);
            
            // Apply saved language preference
            const savedLang = localStorage.getItem('preferred_language');
            if (savedLang && savedLang !== 'en') {
              console.log(`Applying saved language: ${savedLang}`);
              changeLanguage(savedLang);
            }
          } else if (attempts >= 20) {
            // Stop after 20 attempts (10 seconds)
            console.warn('⏰ Google Translate widget not found after 10 seconds');
            console.log('Checking container contents:', document.getElementById('google_translate_element')?.innerHTML);
            clearInterval(checkInterval);
            setLoadError(true);
          } else {
            if (attempts % 5 === 0) {
              console.log(`⏳ Still waiting... (attempt ${attempts}/20)`);
            }
          }
        }, 500);
        
      } catch (error) {
        console.error('❌ Error initializing Google Translate:', error);
        setLoadError(true);
      }
    };

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    if (existingScript) {
      console.log('Script already exists, checking if we need to reinitialize...');
      
      // Try to trigger the callback if Google is already loaded
      if (window.google?.translate?.TranslateElement) {
        console.log('Google Translate API already loaded, initializing now...');
        window.googleTranslateElementInit();
      } else {
        console.log('Waiting for existing script to load...');
      }
      return;
    }

    // Add Google Translate script
    console.log('📥 Loading Google Translate script...');
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Google Translate script:', error);
      setLoadError(true);
    };
    
    script.onload = () => {
      console.log('✅ Google Translate script loaded successfully');
    };
    
      document.body.appendChild(script);
      console.log('Script tag added to document');
    };

    // Cleanup
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
      if (translateIntervalRef.current) {
        clearInterval(translateIntervalRef.current);
      }
    };
  }, []);

  const getSelectedLanguageName = () => {
    const lang = languages.find(lang => lang.code === selectedLanguage);
    return lang ? `${lang.name} (${lang.native})` : 'English';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center gap-3 mb-8">
          <Globe className={`h-8 w-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h1 className="text-2xl font-semibold">Language Settings</h1>
        </div>

        <div className="space-y-6">
          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <h2 className="text-lg font-semibold mb-4">Select Your Preferred Language</h2>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose from a variety of Indian languages to view the website in your preferred language. The entire website will be translated.
            </p>
            
            {/* Status indicators */}
            {!isTranslateReady && !loadError && (
              <div className={`mb-4 p-3 rounded ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Loading translation service...</span>
                </div>
              </div>
            )}
            
            {isTranslateReady && (
              <div className={`mb-4 p-3 rounded ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Translation service ready!</span>
                </div>
              </div>
            )}
            
            {loadError && (
              <div className={`mb-4 p-3 rounded ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
                Unable to load translation service. Please check your internet connection and refresh the page.
              </div>
            )}
            
            {/* Custom language selector dropdown */}
            <div className="relative mb-4 notranslate" ref={dropdownRef}>
              <div 
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors notranslate ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-750' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                } ${!isTranslateReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isTranslateReady && setShowDropdown(!showDropdown)}
              >
                <div className="flex items-center gap-2 notranslate">
                  <Globe className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium notranslate">{getSelectedLanguageName()}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
              </div>
              
              {showDropdown && isTranslateReady && (
                <div className={`absolute z-10 mt-1 w-full rounded-lg border shadow-lg notranslate ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className={`max-h-60 overflow-y-auto notranslate ${theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                    {languages.map(lang => (
                      <div
                        key={lang.code}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors notranslate ${
                          selectedLanguage === lang.code
                            ? theme === 'dark' ? 'bg-indigo-900' : 'bg-indigo-50'
                            : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => changeLanguage(lang.code)}
                      >
                        <div className="notranslate">
                          <span className="font-medium notranslate">{lang.name}</span>
                          <span className={`ml-2 text-sm notranslate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {lang.native}
                          </span>
                        </div>
                        {selectedLanguage === lang.code && (
                          <CheckCircle className="h-5 w-5 text-indigo-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Hidden Google Translate element */}
            <div id="google_translate_element" style={{ position: 'absolute', left: '-9999px' }}></div>
          </div>

          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <h2 className="text-lg font-semibold mb-4">Supported Languages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Primary Language</h3>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>English (English)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">North Indian Languages</h3>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Hindi (हिंदी)</li>
                  <li>Punjabi (ਪੰਜਾਬੀ)</li>
                  <li>Urdu (اردو)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">South Indian Languages</h3>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Tamil (தமிழ்)</li>
                  <li>Telugu (తెలుగు)</li>
                  <li>Malayalam (മലയാളം)</li>
                  <li>Kannada (ಕನ್ನಡ)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">East & West Indian Languages</h3>
                <ul className={`list-disc list-inside ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Bengali (বাংলা)</li>
                  <li>Marathi (मराठी)</li>
                  <li>Gujarati (ગુજરાતી)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <h2 className="text-lg font-semibold mb-4">Translation Information</h2>
            <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>✓ Powered by Google Translate for accurate translations</li>
              <li>✓ Entire website content is translated in real-time</li>
              <li>✓ Your language preference is saved automatically</li>
              <li>✓ Switch languages anytime without losing your progress</li>
              <li>✓ Some technical terms may remain in English for clarity</li>
              <li>✓ Works on all pages including forms and notifications</li>
            </ul>
          </div>
        </div>
      </div>
      
      <style>{`
        /* Hide Google Translate toolbar */
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        
        /* Custom scrollbar styling */
        .scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #2d3748;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background-color: #4a5568;
          border-radius: 4px;
        }
        .scrollbar-light::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
        }
        .bg-gray-750 {
          background-color: #1e293b;
        }
        
        /* Hide Google Translate branding */
        .goog-te-gadget {
          color: transparent !important;
        }
        .goog-te-gadget .goog-te-combo {
          margin: 0px 0 !important;
        }
        .goog-logo-link {
          display: none !important;
        }
        .goog-te-gadget span {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default MultiLingual;
