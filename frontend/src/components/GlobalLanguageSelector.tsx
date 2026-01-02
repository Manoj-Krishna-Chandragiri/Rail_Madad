import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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

const GlobalLanguageSelector = () => {
  const { theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTranslateReady, setIsTranslateReady] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Initialize Google Translate Widget if not already present
  useEffect(() => {
    const initializeWidget = () => {
      // Check if widget already exists
      const existingWidget = document.querySelector('.goog-te-combo');
      if (existingWidget) {
        setIsTranslateReady(true);
        console.log('🌐 Navbar: Google Translate widget already exists');
        
        // Sync with widget's current language
        const select = existingWidget as HTMLSelectElement;
        if (select.value) {
          setSelectedLanguage(select.value);
        }
        return true;
      }

      // Check if Google Translate script is already loaded
      if (window.google?.translate) {
        console.log('🌐 Navbar: Google Translate API loaded, creating widget...');
        createWidget();
        return true;
      }

      return false;
    };

    const createWidget = () => {
      // Create a hidden container for the widget
      let container = document.getElementById('google_translate_navbar');
      if (!container) {
        container = document.createElement('div');
        container.id = 'google_translate_navbar';
        container.style.display = 'none';
        document.body.appendChild(container);
      }

      // Clear any existing content
      container.innerHTML = '';

      // Initialize the widget
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,bn,te,ta,mr,gu,kn,ml,pa,ur',
            layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
            autoDisplay: false,
          },
          'google_translate_navbar'
        );

        console.log('✅ Navbar: Google Translate widget initialized');
        setIsTranslateReady(true);
      }
    };

    const loadScript = () => {
      // Check if script already exists
      if (document.querySelector('script[src*="translate.google.com"]')) {
        console.log('🌐 Navbar: Google Translate script already loaded');
        return;
      }

      console.log('📥 Navbar: Loading Google Translate script...');

      // Define the callback function before loading the script
      window.googleTranslateElementInit = () => {
        console.log('🎯 Navbar: googleTranslateElementInit callback fired');
        createWidget();
      };

      // Load the Google Translate script
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => {
        console.error('❌ Navbar: Failed to load Google Translate script');
      };
      document.head.appendChild(script);
    };

    // Try to initialize immediately
    if (!initializeWidget()) {
      // If widget doesn't exist, load the script
      loadScript();
    }

    // Poll for widget readiness
    const intervalId = setInterval(() => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select && window.google?.translate) {
        setIsTranslateReady(true);
        
        // Sync with widget's current language
        if (select.value) {
          setSelectedLanguage(select.value);
        }
        
        clearInterval(intervalId);
      }
    }, 500);

    // Stop polling after 15 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (!isTranslateReady) {
        console.log('⚠️ Navbar: Google Translate widget initialization timeout');
      }
    }, 15000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Load saved language preference and apply it
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language') || localStorage.getItem('selectedLanguage');
    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      setSelectedLanguage(savedLanguage);
      
      // Apply language if widget is ready
      if (isTranslateReady && savedLanguage !== 'en') {
        changeLanguage(savedLanguage);
      }
    }
  }, [isTranslateReady]);

  // Continuously monitor the widget to sync with changes from MultiLingual page
  useEffect(() => {
    if (!isTranslateReady) return;

    let lastKnownLang = selectedLanguage;

    const syncWithWidget = () => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select && select.value) {
        const widgetLang = select.value;
        
        // Only update if language actually changed
        if (widgetLang !== lastKnownLang) {
          console.log(`🔄 Navbar: Syncing with widget change from ${lastKnownLang} to ${widgetLang}`);
          lastKnownLang = widgetLang;
          setSelectedLanguage(widgetLang);
          localStorage.setItem('preferred_language', widgetLang);
          localStorage.setItem('selectedLanguage', widgetLang);
        }
      }
    };

    // Check every 300ms for changes
    const intervalId = setInterval(syncWithWidget, 300);

    return () => clearInterval(intervalId);
  }, [isTranslateReady]);

  // Function to change the language using Google Translate Widget
  const changeLanguage = (langCode: string) => {
    setShowDropdown(false);
    
    if (langCode === selectedLanguage) return;

    console.log(`🌐 Navbar: Changing language to ${langCode}`);
    
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (!select) {
      console.error('❌ Navbar: Google Translate widget not found, please wait...');
      
      // Save preference for when widget loads
      localStorage.setItem('preferred_language', langCode);
      localStorage.setItem('selectedLanguage', langCode);
      setSelectedLanguage(langCode);
      
      // Widget might still be loading, try again in a moment
      setTimeout(() => {
        const retrySelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (retrySelect) {
          retrySelect.value = langCode;
          const event = new Event('change', { bubbles: true });
          retrySelect.dispatchEvent(event);
          console.log(`✅ Navbar: Language changed to ${langCode} (retry successful)`);
        }
      }, 1000);
      
      return;
    }

    // Set the language in the Google Translate dropdown
    select.value = langCode;
    
    // Trigger the change event to make Google Translate apply the translation
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
    
    // Update local state and storage
    setSelectedLanguage(langCode);
    localStorage.setItem('preferred_language', langCode);
    localStorage.setItem('selectedLanguage', langCode);
    
    console.log(`✅ Navbar: Language changed to ${langCode}`);
  };

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];
  const isDark = theme === 'dark';

  return (
    <div className="relative notranslate" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isDark
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        title="Change Language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium hidden sm:inline notranslate">
          {selectedLang.native}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className={`absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-lg border z-50 notranslate ${
          isDark
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          <div className={`px-3 py-2 text-xs font-medium border-b ${
            isDark ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'
          }`}>
            Select Language
          </div>
          
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                selectedLanguage === language.code
                  ? isDark
                    ? 'bg-indigo-900 text-indigo-200'
                    : 'bg-indigo-50 text-indigo-700'
                  : isDark
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span>{language.name}</span>
              <span className={`text-xs ${
                selectedLanguage === language.code
                  ? isDark ? 'text-indigo-300' : 'text-indigo-500'
                  : isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {language.native}
              </span>
            </button>
          ))}
          
          <div className={`px-3 py-2 text-xs border-t mt-2 ${
            isDark ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'
          }`}>
            {isTranslateReady ? (
              <span className="text-green-500">✓ Translation Ready</span>
            ) : (
              <span className="text-yellow-500">⏳ Loading widget...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalLanguageSelector;