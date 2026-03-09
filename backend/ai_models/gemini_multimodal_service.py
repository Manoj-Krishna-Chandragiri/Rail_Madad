"""
Gemini Multimodal Service for Rail Madad
Analyzes images, videos, and audio files to extract complaint information
"""
import os
import json
import base64
import logging
import tempfile
import requests
from typing import Dict, List, Optional, Tuple
import google.generativeai as genai
from pathlib import Path

logger = logging.getLogger(__name__)

class GeminiMultimodalService:
    """Service for analyzing multimedia content using Gemini API"""
    
    def __init__(self):
        """Initialize Gemini API with different model configurations"""
        # Try multiple environment variable names for API key
        # Prefer GOOGLE_GEMINI_API_KEY — it was never exposed in a VITE_ frontend variable
        self.api_key = (
            os.getenv('GOOGLE_GEMINI_API_KEY') or
            os.getenv('GEMINI_MULTIMODAL_API_KEY') or
            os.getenv('GEMINI_API_KEY') or
            os.getenv('GEMINI_CHATBOT_API_KEY')
        )
        if not self.api_key:
            raise ValueError("No Gemini API key found. Set GOOGLE_GEMINI_API_KEY in the environment.")
        
        genai.configure(api_key=self.api_key)
        
        # Model selection based on task - use stable model names
        self.image_model = os.getenv('GEMINI_IMAGE_MODEL', 'gemini-1.5-flash')
        self.video_model = os.getenv('GEMINI_VIDEO_MODEL', 'gemini-1.5-flash')
        self.audio_model = os.getenv('GEMINI_AUDIO_MODEL', 'gemini-1.5-flash')
        
        # Generation config for consistent JSON output
        self.generation_config = {
            "temperature": 0.4,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
    
    def _create_prompt(self) -> str:
        """Create the analysis prompt for Gemini"""
        return """
Analyze this multimedia complaint from a railway passenger.

Extract the following information:
1. **Complaint Description**: Detailed description of the issue visible/heard in the media
2. **Category**: Choose ONE from [Cleanliness, Safety, Catering, Electrical, Medical, Staff Behavior, Infrastructure, Security, Other]
3. **Severity**: Choose ONE from [Critical, High, Medium, Low]
4. **Train Number**: If visible or mentioned (or "not_detected")
5. **Coach Number**: If visible or mentioned (or "not_detected")
6. **Location**: Station name or between stations (or "not_detected")
7. **Urgency**: Based on visual/audio sentiment [urgent, high, normal, low]
8. **Confidence**: Your confidence level in the analysis (0.0 to 1.0)

Important:
- Be specific and detailed in the description
- Look for visible train numbers, coach markings, station boards
- Assess urgency based on the severity of the issue shown
- If multiple issues are visible, describe all of them

Respond ONLY in JSON format (no markdown, no code blocks):
{
  "description": "detailed complaint description",
  "category": "category name",
  "severity": "severity level",
  "train_number": "train number or not_detected",
  "coach_number": "coach number or not_detected",
  "location": "location details or not_detected",
  "urgency": "urgency level",
  "confidence": 0.85
}
"""
    
    def analyze_image(self, image_path: str) -> Optional[Dict]:
        """
        Analyze an image to extract complaint information
        
        Args:
            image_path: Path to the image file or Cloudinary URL
            
        Returns:
            Dictionary with extracted complaint details or None if error
        """
        try:
            logger.info(f"Analyzing image: {image_path}")
            
            model = genai.GenerativeModel(
                model_name=self.image_model,
                generation_config=self.generation_config
            )
            
            # Handle local file or URL
            if image_path.startswith('http'):
                # For URLs, we need to download first or use different approach
                import requests
                response = requests.get(image_path)
                image_data = response.content
                image_parts = [{
                    "mime_type": "image/jpeg",
                    "data": base64.b64encode(image_data).decode('utf-8')
                }]
            else:
                # Local file
                with open(image_path, 'rb') as f:
                    image_data = f.read()
                image_parts = [{
                    "mime_type": self._get_mime_type(image_path),
                    "data": base64.b64encode(image_data).decode('utf-8')
                }]
            
            prompt = self._create_prompt()
            response = model.generate_content([prompt, image_parts[0]])
            
            # Parse JSON response
            result = self._parse_response(response.text)
            logger.info(f"Image analysis complete. Confidence: {result.get('confidence', 0)}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return None
    
    def analyze_video(self, video_path: str) -> Optional[Dict]:
        """
        Analyze a video to extract complaint information
        
        Args:
            video_path: Path to the video file or Cloudinary URL
            
        Returns:
            Dictionary with extracted complaint details or None if error
        """
        import tempfile
        import time
        import requests
        
        temp_video_path = None
        try:
            logger.info(f"Analyzing video: {video_path}")
            
            # Download video if it's a URL
            if video_path.startswith('http'):
                logger.info("📥 Downloading video from Cloudinary...")
                response = requests.get(video_path, stream=True)
                response.raise_for_status()
                
                # Save to temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
                    for chunk in response.iter_content(chunk_size=8192):
                        temp_file.write(chunk)
                    temp_video_path = temp_file.name
                logger.info(f"✅ Video downloaded to: {temp_video_path}")
                video_path = temp_video_path
            
            model = genai.GenerativeModel(
                model_name=self.video_model,
                generation_config=self.generation_config
            )
            
            # Upload video file to Gemini
            logger.info("📤 Uploading video to Gemini...")
            video_file = genai.upload_file(path=video_path)
            logger.info(f"✅ Video uploaded: {video_file.name}")
            
            # Wait for video processing
            logger.info("⏳ Waiting for Gemini to process video...")
            while video_file.state.name == "PROCESSING":
                time.sleep(2)
                video_file = genai.get_file(video_file.name)
                logger.info(f"   Status: {video_file.state.name}")
            
            if video_file.state.name == "FAILED":
                raise ValueError("Video processing failed")
            
            logger.info("🤖 Analyzing video content...")
            prompt = self._create_prompt()
            response = model.generate_content([video_file, prompt])
            
            # Clean up uploaded file
            genai.delete_file(video_file.name)
            logger.info("🗑️ Cleaned up Gemini file")
            
            result = self._parse_response(response.text)
            logger.info(f"✅ Video analysis complete. Confidence: {result.get('confidence', 0)}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error analyzing video: {str(e)}", exc_info=True)
            return None
        finally:
            # Clean up temporary file
            if temp_video_path and os.path.exists(temp_video_path):
                try:
                    os.unlink(temp_video_path)
                    logger.info("🗑️ Cleaned up temporary video file")
                except:
                    pass
    
    def analyze_audio(self, audio_path: str) -> Optional[Dict]:
        """
        Analyze an audio file to extract complaint information
        
        Args:
            audio_path: Path to the audio file or Cloudinary URL
            
        Returns:
            Dictionary with extracted complaint details or None if error
        """
        import tempfile
        import time
        import requests
        
        temp_audio_path = None
        try:
            logger.info(f"Analyzing audio: {audio_path}")
            
            # Download audio if it's a URL
            if audio_path.startswith('http'):
                logger.info("📥 Downloading audio from Cloudinary...")
                response = requests.get(audio_path, stream=True)
                response.raise_for_status()
                
                # Save to temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                    for chunk in response.iter_content(chunk_size=8192):
                        temp_file.write(chunk)
                    temp_audio_path = temp_file.name
                logger.info(f"✅ Audio downloaded to: {temp_audio_path}")
                audio_path = temp_audio_path
            
            model = genai.GenerativeModel(
                model_name=self.audio_model,
                generation_config=self.generation_config
            )
            
            # Upload audio file to Gemini
            logger.info("📤 Uploading audio to Gemini...")
            audio_file = genai.upload_file(path=audio_path)
            logger.info(f"✅ Audio uploaded: {audio_file.name}")
            
            # Wait for audio processing
            logger.info("⏳ Waiting for Gemini to process audio...")
            while audio_file.state.name == "PROCESSING":
                time.sleep(1)
                audio_file = genai.get_file(audio_file.name)
                logger.info(f"   Status: {audio_file.state.name}")
            
            if audio_file.state.name == "FAILED":
                raise ValueError("Audio processing failed")
            
            logger.info("🤖 Analyzing audio content...")
            prompt = self._create_prompt()
            response = model.generate_content([audio_file, prompt])
            
            # Clean up uploaded file
            genai.delete_file(audio_file.name)
            logger.info("🗑️ Cleaned up Gemini file")
            
            result = self._parse_response(response.text)
            logger.info(f"✅ Audio analysis complete. Confidence: {result.get('confidence', 0)}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error analyzing audio: {str(e)}", exc_info=True)
            return None
        finally:
            # Clean up temporary file
            if temp_audio_path and os.path.exists(temp_audio_path):
                try:
                    os.unlink(temp_audio_path)
                    logger.info("🗑️ Cleaned up temporary audio file")
                except:
                    pass
    
    def analyze_multiple_files(self, files: List[Tuple[str, str]]) -> Optional[Dict]:
        """
        Analyze multiple files and combine insights
        
        Args:
            files: List of tuples (file_path, file_type) where file_type is 'image', 'video', or 'audio'
            
        Returns:
            Combined analysis results with highest confidence
        """
        try:
            logger.info(f"Analyzing {len(files)} files")
            results = []
            
            for file_path, file_type in files:
                if file_type == 'image':
                    result = self.analyze_image(file_path)
                elif file_type == 'video':
                    result = self.analyze_video(file_path)
                elif file_type == 'audio':
                    result = self.analyze_audio(file_path)
                else:
                    logger.warning(f"Unknown file type: {file_type}")
                    continue
                
                if result:
                    results.append(result)
            
            if not results:
                return None
            
            # Combine results - use the one with highest confidence
            best_result = max(results, key=lambda x: x.get('confidence', 0))
            
            # Merge descriptions from all results
            all_descriptions = [r['description'] for r in results if r.get('description')]
            if len(all_descriptions) > 1:
                best_result['description'] = " | ".join(all_descriptions)
            
            logger.info(f"Combined analysis complete. Best confidence: {best_result.get('confidence', 0)}")
            return best_result
            
        except Exception as e:
            logger.error(f"Error analyzing multiple files: {str(e)}")
            return None
    
    def _parse_response(self, response_text: str) -> Dict:
        """Parse Gemini response and extract JSON"""
        try:
            # Remove markdown code blocks if present
            text = response_text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            
            # Parse JSON
            result = json.loads(text.strip())
            
            # Validate required fields
            required_fields = ['description', 'category', 'severity', 'urgency', 'confidence']
            for field in required_fields:
                if field not in result:
                    result[field] = 'Unknown' if field != 'confidence' else 0.5
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response text: {response_text}")
            # Return default structure
            return {
                'description': response_text[:500],  # Use raw text as description
                'category': 'Other',
                'severity': 'Medium',
                'train_number': 'not_detected',
                'coach_number': 'not_detected',
                'location': 'not_detected',
                'urgency': 'normal',
                'confidence': 0.3
            }
    
    def _get_mime_type(self, file_path: str) -> str:
        """Get MIME type from file extension"""
        ext = Path(file_path).suffix.lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
        }
        return mime_types.get(ext, 'application/octet-stream')


# Singleton instance
_gemini_service = None

def get_gemini_service() -> GeminiMultimodalService:
    """Get or create Gemini service instance"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiMultimodalService()
    return _gemini_service
