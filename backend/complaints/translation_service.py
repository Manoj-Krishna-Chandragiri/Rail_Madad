"""
Translation service for Rail Madad backend using GoogleTrans
"""
from googletrans import Translator
import logging

logger = logging.getLogger(__name__)

class TranslationService:
    """Service class for handling text translations"""
    
    def __init__(self):
        self.translator = None  # Lazy init to avoid blocking on startup
        # Supported language codes for Indian languages
        self.supported_languages = {
            'en': 'English',
            'hi': 'Hindi',
            'bn': 'Bengali', 
            'te': 'Telugu',
            'ta': 'Tamil',
            'mr': 'Marathi',
            'gu': 'Gujarati',
            'kn': 'Kannada',
            'ml': 'Malayalam',
            'pa': 'Punjabi',
            'ur': 'Urdu',
            'as': 'Assamese',
            'or': 'Odia',
            'sa': 'Sanskrit',
            'ne': 'Nepali'
        }
    
    def _get_translator(self):
        """Lazily initialize translator to avoid blocking on startup"""
        if self.translator is None:
            self.translator = Translator()
        return self.translator

    def translate_text(self, text, target_language='en', source_language='auto'):
        """
        Translate text to target language
        
        Args:
            text (str): Text to translate
            target_language (str): Target language code (default: 'en')
            source_language (str): Source language code (default: 'auto')
            
        Returns:
            dict: Translation result with text, source_lang, target_lang, confidence
        """
        try:
            if not text or not text.strip():
                return {
                    'translated_text': text,
                    'source_language': source_language,
                    'target_language': target_language,
                    'confidence': 1.0,
                    'error': None
                }
            
            # Check if target language is supported
            if target_language not in self.supported_languages and target_language != 'auto':
                return {
                    'translated_text': text,
                    'source_language': source_language,
                    'target_language': target_language,
                    'confidence': 0.0,
                    'error': f'Unsupported target language: {target_language}'
                }
            
            # Skip translation if target is same as source
            if source_language == target_language:
                return {
                    'translated_text': text,
                    'source_language': source_language,
                    'target_language': target_language,
                    'confidence': 1.0,
                    'error': None
                }
            
            # Perform translation
            result = self._get_translator().translate(
                text, 
                dest=target_language, 
                src=source_language
            )
            
            return {
                'translated_text': result.text,
                'source_language': result.src,
                'target_language': target_language,
                'confidence': getattr(result, 'confidence', 0.95),
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            return {
                'translated_text': text,  # Return original text on error
                'source_language': source_language,
                'target_language': target_language,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def detect_language(self, text):
        """
        Detect the language of given text
        
        Args:
            text (str): Text to analyze
            
        Returns:
            dict: Detection result with language code and confidence
        """
        try:
            if not text or not text.strip():
                return {
                    'language': 'en',
                    'confidence': 0.0,
                    'error': 'Empty text provided'
                }
            
            detected = self._get_translator().detect(text)
            
            return {
                'language': detected.lang,
                'confidence': detected.confidence,
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Language detection error: {str(e)}")
            return {
                'language': 'en',  # Default to English
                'confidence': 0.0,
                'error': str(e)
            }
    
    def get_supported_languages(self):
        """Get list of supported languages"""
        return self.supported_languages
    
    def translate_complaint_data(self, complaint_data, target_language='en'):
        """
        Translate complaint data fields to target language
        
        Args:
            complaint_data (dict): Complaint data to translate
            target_language (str): Target language code
            
        Returns:
            dict: Translated complaint data
        """
        try:
            translated_data = complaint_data.copy()
            
            # Fields to translate
            translatable_fields = ['description', 'type', 'location']
            
            for field in translatable_fields:
                if field in complaint_data and complaint_data[field]:
                    translation_result = self.translate_text(
                        complaint_data[field], 
                        target_language=target_language
                    )
                    translated_data[f'{field}_translated'] = translation_result['translated_text']
                    translated_data[f'{field}_translation_confidence'] = translation_result['confidence']
            
            translated_data['translation_target_language'] = target_language
            return translated_data
            
        except Exception as e:
            logger.error(f"Error translating complaint data: {str(e)}")
            return complaint_data

# Global instance
translation_service = TranslationService()
