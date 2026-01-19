"""
API Views for Facial Authentication
Handles face enrollment, authentication, and management
"""
import os
import time
import uuid
import io
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status, authentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from django.contrib.auth import login, get_user_model
from firebase_admin import auth as firebase_auth

from .face_models import FaceProfile, FaceAuthLog, FaceEnrollmentSession
from .face_serializers import (
    FaceProfileSerializer, FaceEnrollmentSerializer,
    FaceAuthLoginSerializer, FaceAuthLogSerializer
)
from .face_utils import (
    decode_base64_image, save_image_from_base64,
    detect_face, generate_face_embedding,
    verify_face_against_database, assess_image_quality,
    cleanup_temp_images
)
from .models import FirebaseUser
import logging

logger = logging.getLogger('accounts.face_auth')


class FirebaseTokenAuthentication(authentication.BaseAuthentication):
    """
    DRF Authentication class that uses the request.user set by FirebaseAuthMiddleware.
    This bridges the custom middleware authentication with DRF's authentication system.
    """
    def authenticate(self, request):
        # IMPORTANT: Access the underlying Django request to avoid the DRF .user property
        # which would recurse back into authentication again.
        base_request = getattr(request, "_request", request)

        # If middleware already populated a real user with a pk, reuse it.
        existing_user = getattr(base_request, "user", None)
        if existing_user is not None and getattr(existing_user, "pk", None):
            logger.info(f"[DRF_AUTH] Using middleware user: {existing_user}")
            return (existing_user, None)

        # Check if we have firebase_email but no user yet - try to find/create user
        firebase_email = getattr(base_request, "firebase_email", None)
        if firebase_email:
            try:
                User = get_user_model()
                user = User.objects.get(email__iexact=firebase_email)
                logger.info(f"[DRF_AUTH] Found user by firebase_email: {user}")
                return (user, None)
            except ObjectDoesNotExist:
                logger.error(f"[DRF_AUTH] No user found for firebase_email: {firebase_email}")
                return None
            except Exception as e:
                logger.error(f"[DRF_AUTH] Unexpected error during firebase_email lookup: {e}")
                return None

        # No authentication found
        return None


class IsFirebaseAuthenticated(BasePermission):
    """
    Custom permission to check Firebase authentication via middleware
    """
    def has_permission(self, request, view):
        # After DRF authentication runs, check if we have a real user
        has_valid_user = hasattr(request, 'user') and request.user and request.user.pk
        
        if not has_valid_user:
            logger.error(f"[PERMISSION] Auth failed - user: {request.user}, is_authenticated: {getattr(request.user, 'is_authenticated', False)}")
            return False
        
        return True


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(['POST'])
@authentication_classes([FirebaseTokenAuthentication])
@permission_classes([IsFirebaseAuthenticated])
def enroll_face(request):
    """
    Enroll a user's face for authentication
    Expects: { "image": "base64_encoded_image" }
    """
    start_time = time.time()
    
    try:
        logger.info(f"[ENROLL] Starting face enrollment for user: {request.user}, user.id: {request.user.id if request.user else 'None'}")
        
        serializer = FaceEnrollmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        if not user or not user.pk:
            logger.error(f"[ENROLL] Invalid user object: {user}")
            return Response({
                'success': False,
                'message': 'User not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        image_base64 = serializer.validated_data['image']
        
        # Check if user already has a face profile
        existing_profile = FaceProfile.objects.filter(user=user).first()
        if existing_profile:
            return Response({
                'success': False,
                'message': 'Face profile already exists. Please delete the existing profile first.',
                'data': FaceProfileSerializer(existing_profile).data
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save image temporarily
        temp_path = save_image_from_base64(image_base64, f"enroll_{user.id}_{int(time.time())}")
        
        try:
            # Assess image quality
            quality_check = assess_image_quality(temp_path)
            if not quality_check['suitable_for_enrollment']:
                return Response({
                    'success': False,
                    'message': 'Image quality not suitable for enrollment',
                    'issues': quality_check['issues'],
                    'quality_score': quality_check['quality_score']
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate face embedding
            embedding_result = generate_face_embedding(temp_path)
            if not embedding_result['success']:
                return Response({
                    'success': False,
                    'message': embedding_result['message']
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save the image permanently
            image = decode_base64_image(image_base64)
            image_file = ContentFile(b'')
            filename = f"face_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
            
            # Save image to buffer
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=95)
            image_file = ContentFile(buffer.getvalue(), name=filename)
            
            # Create FaceProfile
            face_profile = FaceProfile.objects.create(
                user=user,
                face_image=image_file,
                is_verified=True,
                image_quality_score=quality_check['quality_score'],
                model_name='Facenet'
            )
            
            # Store embedding
            face_profile.set_encoding(embedding_result['embedding'])
            face_profile.save()
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return Response({
                'success': True,
                'message': 'Face enrolled successfully',
                'data': FaceProfileSerializer(face_profile).data,
                'processing_time_ms': processing_time,
                'quality_score': quality_check['quality_score']
            }, status=status.HTTP_201_CREATED)
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        logger.error(f"Error enrolling face: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': f'Error enrolling face: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([FirebaseTokenAuthentication])
@permission_classes([IsFirebaseAuthenticated])
def face_profile_status(request):
    """
    Check if user has enrolled their face
    """
    try:
        user = request.user
        logger.info(f"[FACE_STATUS] Checking status for user: {user}, user.id: {user.id if user else 'None'}")
        
        if not user or not user.pk:
            logger.error(f"[FACE_STATUS] Invalid user object: {user}")
            return Response({
                'enrolled': False,
                'message': 'User not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        face_profile = FaceProfile.objects.filter(user=user).first()
        
        if face_profile:
            return Response({
                'enrolled': True,
                'profile': FaceProfileSerializer(face_profile).data
            })
        else:
            return Response({
                'enrolled': False,
                'message': 'No face profile found'
            })
    
    except Exception as e:
        import traceback
        logger.error(f"Error checking face profile status: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({
            'error': str(e),
            'detail': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@authentication_classes([FirebaseTokenAuthentication])
@permission_classes([IsFirebaseAuthenticated])
def remove_face_profile(request):
    """
    Remove user's face profile
    """
    try:
        user = request.user
        face_profile = FaceProfile.objects.filter(user=user).first()
        
        if not face_profile:
            return Response({
                'success': False,
                'message': 'No face profile found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Delete the image file
        if face_profile.face_image:
            try:
                if os.path.exists(face_profile.face_image.path):
                    os.remove(face_profile.face_image.path)
            except Exception as e:
                logger.warning(f"Failed to delete face image file: {str(e)}")
        
        face_profile.delete()
        
        return Response({
            'success': True,
            'message': 'Face profile removed successfully'
        })
    
    except Exception as e:
        logger.error(f"Error removing face profile: {str(e)}")
        return Response({
            'success': False,
            'message': f'Error removing face profile: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def face_auth_login(request):
    """
    Authenticate user using facial recognition
    Expects: { "image": "base64_encoded_image" }
    Returns: User data and authentication token if successful
    """
    start_time = time.time()
    temp_path = None
    captured_image_file = None
    
    try:
        serializer = FaceAuthLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Invalid data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_base64 = serializer.validated_data['image']
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Save image temporarily
        temp_filename = f"auth_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        temp_path = save_image_from_base64(image_base64, temp_filename)
        
        # Detect face first
        face_check = detect_face(temp_path)
        if not face_check['success']:
            # Log failed attempt
            image = decode_base64_image(image_base64)
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=85)
            captured_image_file = ContentFile(
                buffer.getvalue(),
                name=f"auth_failed_{uuid.uuid4().hex[:8]}.jpg"
            )
            
            log_status = 'no_face' if face_check['face_count'] == 0 else 'multiple_faces'
            FaceAuthLog.objects.create(
                user=None,
                captured_image=captured_image_file,
                status=log_status,
                confidence_score=0.0,
                ip_address=ip_address,
                user_agent=user_agent,
                processing_time_ms=int((time.time() - start_time) * 1000)
            )
            
            return Response({
                'success': False,
                'message': face_check['message']
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get all enrolled users' embeddings
        enrolled_profiles = FaceProfile.objects.filter(is_verified=True).select_related('user')
        
        if enrolled_profiles.count() == 0:
            return Response({
                'success': False,
                'message': 'No enrolled faces in database. Please enroll first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        user_embeddings = {}
        for profile in enrolled_profiles:
            if profile.has_valid_encoding():
                user_embeddings[profile.user.id] = profile.get_encoding()
        
        # Verify face against database
        verification_result = verify_face_against_database(temp_path, user_embeddings)
        
        # Save captured image for logging
        image = decode_base64_image(image_base64)
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        captured_image_file = ContentFile(
            buffer.getvalue(),
            name=f"auth_{uuid.uuid4().hex[:8]}.jpg"
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        if verification_result['success']:
            # Face matched - authenticate user
            matched_user = FirebaseUser.objects.get(id=verification_result['user_id'])
            
            # Create auth log
            FaceAuthLog.objects.create(
                user=matched_user,
                captured_image=captured_image_file,
                status='success',
                confidence_score=verification_result['confidence'],
                ip_address=ip_address,
                user_agent=user_agent,
                matched_user_email=matched_user.email,
                model_used='Facenet',
                processing_time_ms=processing_time
            )
            
            # Generate Firebase custom token for frontend
            firebase_token = None
            try:
                from firebase_admin import auth as firebase_auth
                if firebase_auth._apps and getattr(matched_user, 'firebase_uid', None):
                    custom_token = firebase_auth.create_custom_token(matched_user.firebase_uid)
                    firebase_token = custom_token.decode('utf-8') if isinstance(custom_token, bytes) else custom_token
                else:
                    firebase_token = f"dev-face-token-{matched_user.id}-{uuid.uuid4().hex[:8]}"
            except Exception as e:
                logger.warning(f"Failed to create Firebase token: {str(e)}")
                firebase_token = f"dev-face-token-{matched_user.id}-{uuid.uuid4().hex[:8]}"
            
            return Response({
                'success': True,
                'message': 'Face authentication successful',
                'user': {
                    'id': matched_user.id,
                    'email': matched_user.email,
                    'full_name': matched_user.full_name,
                    'user_type': matched_user.user_type,
                    'is_admin': matched_user.is_admin,
                    'is_staff': matched_user.is_staff,
                    'is_passenger': matched_user.is_passenger
                },
                'firebase_token': firebase_token,
                'confidence': verification_result['confidence'],
                'processing_time_ms': processing_time
            })
        else:
            # Face not matched
            FaceAuthLog.objects.create(
                user=None,
                captured_image=captured_image_file,
                status='low_confidence',
                confidence_score=verification_result['confidence'],
                ip_address=ip_address,
                user_agent=user_agent,
                model_used='Facenet',
                processing_time_ms=processing_time
            )
            
            return Response({
                'success': False,
                'message': 'Face not recognized. Please try again or use alternative login method.',
                'confidence': verification_result['confidence']
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    except Exception as e:
        logger.error(f"Error during face authentication: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': f'Authentication error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    finally:
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Failed to remove temp file: {str(e)}")
        
        # Clean up old temporary images
        cleanup_temp_images(older_than_minutes=30)


@api_view(['GET'])
@authentication_classes([FirebaseTokenAuthentication])
@permission_classes([IsFirebaseAuthenticated])
def face_auth_logs(request):
    """
    Get face authentication logs for current user
    """
    try:
        user = request.user
        logs = FaceAuthLog.objects.filter(user=user).order_by('-timestamp')[:20]
        serializer = FaceAuthLogSerializer(logs, many=True)
        
        return Response({
            'success': True,
            'logs': serializer.data
        })
    
    except Exception as e:
        logger.error(f"Error fetching auth logs: {str(e)}")
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([FirebaseTokenAuthentication])
@permission_classes([IsFirebaseAuthenticated])
def update_face_profile(request):
    """
    Update existing face profile with new image
    """
    try:
        user = request.user
        face_profile = FaceProfile.objects.filter(user=user).first()
        
        if not face_profile:
            return Response({
                'success': False,
                'message': 'No face profile found. Please enroll first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Remove existing profile and create new one
        face_profile.delete()
        
        # Call enroll_face to create new profile
        return enroll_face(request)
    
    except Exception as e:
        logger.error(f"Error updating face profile: {str(e)}")
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
