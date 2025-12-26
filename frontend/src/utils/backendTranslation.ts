/**
 * Backend translation service using GoogleTrans API
 */
import apiClient from './api';

export interface TranslationResult {
  translated_text: string;
  source_language: string;
  target_language: string;
  confidence: number;
  error?: string;
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  error?: string;
}

export interface SupportedLanguagesResult {
  supported_languages: Record<string, string>;
  total_count: number;
}

class BackendTranslationService {
  private cache = new Map<string, TranslationResult>();

  /**
   * Translate text using backend GoogleTrans service
   */
  async translateText(
    text: string, 
    targetLanguage: string = 'en', 
    sourceLanguage: string = 'auto'
  ): Promise<TranslationResult> {
    try {
      const cacheKey = `${text}-${sourceLanguage}-${targetLanguage}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      const response = await apiClient.post('/api/complaints/translate/', {
        text,
        target_language: targetLanguage,
        source_language: sourceLanguage
      });

      const result = response.data as TranslationResult;
      
      // Cache successful translations
      if (!result.error) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error: any) {
      console.error('Backend translation error:', error);
      return {
        translated_text: text, // Return original text on error
        source_language: sourceLanguage,
        target_language: targetLanguage,
        confidence: 0,
        error: error.response?.data?.error || error.message || 'Translation failed'
      };
    }
  }

  /**
   * Detect language of text using backend service
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      const response = await apiClient.post('/api/complaints/detect-language/', {
        text
      });

      return response.data as LanguageDetectionResult;
    } catch (error: any) {
      console.error('Language detection error:', error);
      return {
        language: 'en',
        confidence: 0,
        error: error.response?.data?.error || error.message || 'Language detection failed'
      };
    }
  }

  /**
   * Get supported languages from backend
   */
  async getSupportedLanguages(): Promise<SupportedLanguagesResult> {
    try {
      const response = await apiClient.get('/api/complaints/supported-languages/');
      return response.data as SupportedLanguagesResult;
    } catch (error: any) {
      console.error('Error getting supported languages:', error);
      return {
        supported_languages: {
          'en': 'English',
          'hi': 'Hindi',
          'bn': 'Bengali',
          'te': 'Telugu',
          'ta': 'Tamil'
        },
        total_count: 5
      };
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Translate complaint data for display
   */
  async translateComplaintData(
    complaintData: any, 
    targetLanguage: string = 'en'
  ): Promise<any> {
    try {
      const translatedData = { ...complaintData };
      
      // Fields that should be translated
      const fieldsToTranslate = ['description', 'type', 'location'];
      
      for (const field of fieldsToTranslate) {
        if (complaintData[field]) {
          const translation = await this.translateText(
            complaintData[field], 
            targetLanguage
          );
          
          if (!translation.error) {
            translatedData[`${field}_translated`] = translation.translated_text;
            translatedData[`${field}_confidence`] = translation.confidence;
          }
        }
      }
      
      translatedData.translation_language = targetLanguage;
      return translatedData;
    } catch (error) {
      console.error('Error translating complaint data:', error);
      return complaintData;
    }
  }
}

// Export singleton instance
export const backendTranslationService = new BackendTranslationService();
export default backendTranslationService;
