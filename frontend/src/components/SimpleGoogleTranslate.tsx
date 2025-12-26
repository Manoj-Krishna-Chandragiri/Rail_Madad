import { useEffect, useState } from 'react';
import backendTranslationService from '../utils/backendTranslation';

const SimpleGoogleTranslate = () => {
  const [status, setStatus] = useState('Loading...');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languages, setLanguages] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const initializeTranslation = async () => {
      try {
        setStatus('Initializing translation service...');
        
        // Get supported languages from backend
        const result = await backendTranslationService.getSupportedLanguages();
        setLanguages(result.supported_languages);
        setStatus('Ready!');
      } catch (error) {
        console.error('Failed to initialize translation service:', error);
        setStatus('Failed to load translator');
      }
    };

    initializeTranslation();
  }, []);

  const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const langCode = event.target.value;
    setSelectedLanguage(langCode);
    
    if (langCode === 'en') {
      // Reset to original English content
      document.querySelectorAll('[data-original-text]').forEach(element => {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
          element.textContent = originalText;
        }
      });
      setStatus('Viewing in English');
      return;
    }
    
    setStatus('Translating...');
    
    try {
      // Get all text elements on the page that need translation
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, li, label');
      
      // Store original text content if not already stored
      textElements.forEach((element, index) => {
        const originalText = element.textContent?.trim();
        if (originalText && originalText.length > 0) {
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
          const originalText = element.getAttribute('data-original-text');
          
          if (originalText && originalText.length > 0) {
            try {
              const result = await backendTranslationService.translateText(originalText, langCode);
              element.textContent = result.translated_text;
            } catch (error) {
              console.error(`Error translating element:`, error);
            }
          }
        }));
      }
      
      setStatus(`Translated to ${languages[langCode]}`);
    } catch (error) {
      console.error('Translation error:', error);
      setStatus('Translation failed');
    }
  };

  return (
    <div className="simple-translate-container bg-white dark:bg-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 mb-4">
      <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        🌍 Translate Page: <span className="text-xs text-blue-600 dark:text-blue-400">{status}</span>
      </div>
      
      <select
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        value={selectedLanguage}
        onChange={handleLanguageChange}
        disabled={Object.keys(languages).length === 0}
      >
        <option value="en">English</option>
        {Object.entries(languages).map(([code, name]) => (
          code !== 'en' && <option key={code} value={code}>{name}</option>
        ))}
      </select>
      
      {status === 'Ready!' && (
        <div className="mt-2 text-xs text-green-600 dark:text-green-400">
          ✅ Translation ready! Use the language selector above to translate this page.
        </div>
      )}
    </div>
  );
};

export default SimpleGoogleTranslate;