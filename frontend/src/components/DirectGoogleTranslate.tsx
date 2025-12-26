import { useEffect, useState } from 'react';
import backendTranslationService from '../utils/backendTranslation';

const DirectGoogleTranslate = () => {
  const [isReady, setIsReady] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [translationStatus, setTranslationStatus] = useState('idle');

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

  useEffect(() => {
    // Initialize backend translation service
    const initializeTranslation = async () => {
      try {
        // Check if backend translation service is available
        await backendTranslationService.getSupportedLanguages();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize translation service:', error);
        setIsReady(false);
      }
    };

    initializeTranslation();
  }, []);

  // Function to translate a single text element
  const translateText = async (text: string, targetLanguage: string) => {
    if (!text || targetLanguage === 'en') return text;
    
    try {
      const result = await backendTranslationService.translateText(text, targetLanguage);
      return result.translated_text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLang(langCode);
    
    if (langCode === 'en') {
      // Reset to original English content
      document.querySelectorAll('[data-original-text]').forEach(element => {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
          element.textContent = originalText;
        }
      });
      setTranslationStatus('idle');
      return;
    }

    setTranslationStatus('loading');
    
    try {
      // Get all text elements on the page that need translation
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, li, label');
      
      // Store original text content if not already stored
      textElements.forEach((element, index) => {
        const originalText = element.textContent?.trim();
        if (originalText && originalText.length > 0) {
          const elementId = `elem-${index}`;
          
          // Add a data attribute to track this element
          element.setAttribute('data-translate-id', elementId);
          
          // Store original text if we don't have it yet
          if (!element.getAttribute('data-original-text')) {
            element.setAttribute('data-original-text', originalText);
          }
        }
      });
      
      // Translate elements in batches to avoid overwhelming the API
      const batchSize = 10;
      const elementsArray = Array.from(textElements);
      
      for (let i = 0; i < elementsArray.length; i += batchSize) {
        const batch = elementsArray.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (element) => {
          const elementId = element.getAttribute('data-translate-id');
          const originalText = element.getAttribute('data-original-text');
          
          if (elementId && originalText && originalText.length > 0) {
            try {
              const translatedText = await translateText(originalText, langCode);
              
              // Update the element text
              element.textContent = translatedText;
            } catch (error) {
              console.error(`Error translating element ${elementId}:`, error);
            }
          }
        }));
      }
      
      setTranslationStatus('success');
    } catch (error) {
      console.error('Page translation error:', error);
      setTranslationStatus('error');
    }
  };

  const selectedLanguage = languages.find(lang => lang.code === selectedLang) || languages[0];

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
        🌍 Page Translation
      </h3>
      
      {/* Our Custom Language Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLang === lang.code
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
            }`}
            disabled={translationStatus === 'loading'}
          >
            {lang.native}
          </button>
        ))}
      </div>
      
      {/* Status */}
      <div className="text-sm text-blue-600 dark:text-blue-400">
        {translationStatus === 'loading' ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Translating page...</span>
          </div>
        ) : translationStatus === 'success' ? (
          <>
            ✅ Translation ready! Current: <strong>{selectedLanguage.native}</strong>
          </>
        ) : translationStatus === 'error' ? (
          <span className="text-red-500">❌ Translation failed. Please try again.</span>
        ) : isReady ? (
          <>
            ✅ Translation ready! Current: <strong>{selectedLanguage.native}</strong>
          </>
        ) : (
          <>⏳ Loading translation service...</>
        )}
      </div>
    </div>
  );
};

export default DirectGoogleTranslate;