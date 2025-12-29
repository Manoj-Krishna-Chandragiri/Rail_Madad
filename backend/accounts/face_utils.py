"""
Facial Recognition Utility Functions
Uses DeepFace library for face detection, encoding, and matching
"""
import os
import time
import logging
import numpy as np
from django.conf import settings
from django.core.files.base import ContentFile
import base64
from PIL import Image
import io

logger = logging.getLogger('accounts.face_auth')

# DeepFace imports
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    logger.warning("DeepFace not installed. Face authentication will not work.")
    DEEPFACE_AVAILABLE = False


# Configuration
FACE_RECOGNITION_MODEL = 'Facenet'  # Options: VGG-Face, Facenet, Facenet512, OpenFace, DeepFace, DeepID, ArcFace, Dlib, SFace
FACE_DETECTOR = 'opencv'  # Options: opencv, ssd, dlib, mtcnn, retinaface
DISTANCE_METRIC = 'cosine'  # Options: cosine, euclidean, euclidean_l2
CONFIDENCE_THRESHOLD = 0.40  # Lower is stricter (0.40 recommended for Facenet with cosine)


def check_deepface_available():
    """Check if DeepFace is properly installed"""
    if not DEEPFACE_AVAILABLE:
        raise ImportError("DeepFace is not installed. Please install it: pip install deepface")
    return True


def decode_base64_image(base64_string):
    """
    Decode base64 image string to PIL Image object
    
    Args:
        base64_string: Base64 encoded image string (with or without data URL prefix)
    
    Returns:
        PIL.Image object
    """
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 to bytes
        image_data = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
    except Exception as e:
        logger.error(f"Error decoding base64 image: {str(e)}")
        raise ValueError(f"Invalid image data: {str(e)}")


def save_image_from_base64(base64_string, filename=None):
    """
    Save base64 image to a temporary file and return the path
    
    Args:
        base64_string: Base64 encoded image
        filename: Optional filename (without extension)
    
    Returns:
        Path to saved temporary image file
    """
    if filename is None:
        filename = f"temp_face_{int(time.time() * 1000)}"
    
    image = decode_base64_image(base64_string)
    
    # Create temp directory if it doesn't exist
    temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp_faces')
    os.makedirs(temp_dir, exist_ok=True)
    
    # Save image
    temp_path = os.path.join(temp_dir, f"{filename}.jpg")
    image.save(temp_path, 'JPEG', quality=95)
    
    return temp_path


def detect_face(image_path_or_array):
    """
    Detect if there's exactly one face in the image
    
    Args:
        image_path_or_array: Path to image file or numpy array
    
    Returns:
        dict: {
            'success': bool,
            'face_count': int,
            'message': str,
            'face_region': dict or None
        }
    """
    check_deepface_available()
    
    try:
        # Extract faces
        faces = DeepFace.extract_faces(
            img_path=image_path_or_array,
            detector_backend=FACE_DETECTOR,
            enforce_detection=False
        )
        
        face_count = len(faces)
        
        if face_count == 0:
            return {
                'success': False,
                'face_count': 0,
                'message': 'No face detected in the image. Please ensure your face is clearly visible.',
                'face_region': None
            }
        elif face_count > 1:
            return {
                'success': False,
                'face_count': face_count,
                'message': f'Multiple faces detected ({face_count}). Please ensure only your face is visible.',
                'face_region': None
            }
        else:
            # Single face detected
            face = faces[0]
            return {
                'success': True,
                'face_count': 1,
                'message': 'Face detected successfully',
                'face_region': face.get('facial_area', None),
                'confidence': face.get('confidence', 1.0)
            }
    
    except Exception as e:
        logger.error(f"Error detecting face: {str(e)}")
        return {
            'success': False,
            'face_count': 0,
            'message': f'Error processing image: {str(e)}',
            'face_region': None
        }


def generate_face_embedding(image_path_or_array):
    """
    Generate facial embedding/encoding for an image
    
    Args:
        image_path_or_array: Path to image file or numpy array
    
    Returns:
        dict: {
            'success': bool,
            'embedding': numpy array or None,
            'message': str
        }
    """
    check_deepface_available()
    
    try:
        # First check if face is present
        face_check = detect_face(image_path_or_array)
        if not face_check['success']:
            return {
                'success': False,
                'embedding': None,
                'message': face_check['message']
            }
        
        # Generate embedding
        embedding_objs = DeepFace.represent(
            img_path=image_path_or_array,
            model_name=FACE_RECOGNITION_MODEL,
            detector_backend=FACE_DETECTOR,
            enforce_detection=True
        )
        
        if not embedding_objs or len(embedding_objs) == 0:
            return {
                'success': False,
                'embedding': None,
                'message': 'Failed to generate face embedding'
            }
        
        # Get the first embedding (we already checked there's only one face)
        embedding = np.array(embedding_objs[0]['embedding'])
        
        return {
            'success': True,
            'embedding': embedding,
            'message': 'Face embedding generated successfully'
        }
    
    except Exception as e:
        logger.error(f"Error generating face embedding: {str(e)}")
        return {
            'success': False,
            'embedding': None,
            'message': f'Error generating embedding: {str(e)}'
        }


def compare_faces(embedding1, embedding2, threshold=CONFIDENCE_THRESHOLD):
    """
    Compare two face embeddings and determine if they match
    
    Args:
        embedding1: First face embedding (numpy array or list)
        embedding2: Second face embedding (numpy array or list)
        threshold: Distance threshold for match (lower = stricter)
    
    Returns:
        dict: {
            'match': bool,
            'distance': float,
            'confidence': float (0-1, higher is better match)
        }
    """
    try:
        # Ensure embeddings are numpy arrays
        emb1 = np.array(embedding1)
        emb2 = np.array(embedding2)
        
        # Calculate distance based on metric
        if DISTANCE_METRIC == 'cosine':
            # Cosine distance
            distance = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
            distance = 1 - distance  # Convert similarity to distance
        elif DISTANCE_METRIC == 'euclidean':
            distance = np.linalg.norm(emb1 - emb2)
        elif DISTANCE_METRIC == 'euclidean_l2':
            distance = np.sqrt(np.sum((emb1 - emb2) ** 2))
        else:
            # Default to cosine
            distance = 1 - (np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2)))
        
        # Determine if match
        is_match = distance < threshold
        
        # Calculate confidence (0-1, higher is better)
        # For cosine distance, lower distance = better match
        confidence = max(0, 1 - (distance / threshold))
        
        return {
            'match': is_match,
            'distance': float(distance),
            'confidence': float(confidence)
        }
    
    except Exception as e:
        logger.error(f"Error comparing faces: {str(e)}")
        return {
            'match': False,
            'distance': 999,
            'confidence': 0.0
        }


def verify_face_against_database(captured_image_path, user_embeddings_dict):
    """
    Verify a captured face against all enrolled faces in database
    
    Args:
        captured_image_path: Path to captured image
        user_embeddings_dict: Dict mapping user_id -> embedding array
    
    Returns:
        dict: {
            'success': bool,
            'user_id': int or None,
            'confidence': float,
            'distance': float,
            'message': str
        }
    """
    try:
        # Generate embedding for captured image
        result = generate_face_embedding(captured_image_path)
        
        if not result['success']:
            return {
                'success': False,
                'user_id': None,
                'confidence': 0.0,
                'distance': 999,
                'message': result['message']
            }
        
        captured_embedding = result['embedding']
        
        # Compare against all enrolled faces
        best_match = None
        best_confidence = 0.0
        best_distance = 999
        
        for user_id, enrolled_embedding in user_embeddings_dict.items():
            comparison = compare_faces(captured_embedding, enrolled_embedding)
            
            if comparison['match'] and comparison['confidence'] > best_confidence:
                best_match = user_id
                best_confidence = comparison['confidence']
                best_distance = comparison['distance']
        
        if best_match:
            return {
                'success': True,
                'user_id': best_match,
                'confidence': best_confidence,
                'distance': best_distance,
                'message': f'Face matched with confidence {best_confidence:.2%}'
            }
        else:
            return {
                'success': False,
                'user_id': None,
                'confidence': 0.0,
                'distance': 999,
                'message': 'No matching face found in database'
            }
    
    except Exception as e:
        logger.error(f"Error verifying face: {str(e)}")
        return {
            'success': False,
            'user_id': None,
            'confidence': 0.0,
            'distance': 999,
            'message': f'Error during verification: {str(e)}'
        }


def assess_image_quality(image_path_or_array):
    """
    Assess the quality of a face image for enrollment
    
    Returns:
        dict: {
            'quality_score': float (0-1),
            'issues': list of str,
            'suitable_for_enrollment': bool
        }
    """
    try:
        issues = []
        quality_score = 1.0
        
        # Detect face and get details
        face_check = detect_face(image_path_or_array)
        
        if not face_check['success']:
            return {
                'quality_score': 0.0,
                'issues': [face_check['message']],
                'suitable_for_enrollment': False
            }
        
        # Check face confidence if available
        if 'confidence' in face_check and face_check['confidence'] < 0.9:
            quality_score -= 0.2
            issues.append(f"Low face detection confidence ({face_check['confidence']:.2%})")
        
        # Check image dimensions
        if isinstance(image_path_or_array, str):
            img = Image.open(image_path_or_array)
            width, height = img.size
            
            if width < 200 or height < 200:
                quality_score -= 0.3
                issues.append("Image resolution too low (minimum 200x200 recommended)")
            
            # Check if face region is too small
            if face_check['face_region']:
                face_width = face_check['face_region'].get('w', 0)
                face_height = face_check['face_region'].get('h', 0)
                
                if face_width < 80 or face_height < 80:
                    quality_score -= 0.2
                    issues.append("Face too small in image (move closer to camera)")
        
        suitable = quality_score >= 0.6 and len(issues) <= 1
        
        return {
            'quality_score': max(0.0, quality_score),
            'issues': issues,
            'suitable_for_enrollment': suitable
        }
    
    except Exception as e:
        logger.error(f"Error assessing image quality: {str(e)}")
        return {
            'quality_score': 0.0,
            'issues': [f"Error assessing quality: {str(e)}"],
            'suitable_for_enrollment': False
        }


def cleanup_temp_images(older_than_minutes=30):
    """
    Clean up temporary face images older than specified minutes
    
    Args:
        older_than_minutes: Delete files older than this many minutes
    """
    try:
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp_faces')
        if not os.path.exists(temp_dir):
            return
        
        current_time = time.time()
        threshold = older_than_minutes * 60  # Convert to seconds
        
        for filename in os.listdir(temp_dir):
            filepath = os.path.join(temp_dir, filename)
            
            if os.path.isfile(filepath):
                file_age = current_time - os.path.getmtime(filepath)
                if file_age > threshold:
                    os.remove(filepath)
                    logger.info(f"Cleaned up temp image: {filename}")
    
    except Exception as e:
        logger.error(f"Error cleaning up temp images: {str(e)}")
