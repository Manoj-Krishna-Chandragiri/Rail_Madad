from firebase_admin import auth, credentials
from django.http import JsonResponse
from django.conf import settings
from django.apps import apps
from django.contrib.auth import get_user_model
from django.urls import resolve, Resolver404
import logging
import firebase_admin
import json

logger = logging.getLogger('accounts')

# Enhanced middleware.py to better handle Google auth and ensure user_id is stored

class FirebaseAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log ALL requests to see what's hitting the middleware
        if request.path.startswith('/api/complaints/admin/staff'):
            logger.info(f"\n{'='*80}")
            logger.info(f"[MIDDLEWARE] {request.method} {request.path}")
            logger.info(f"[MIDDLEWARE] Authorization header present: {bool(request.META.get('HTTP_AUTHORIZATION'))}")
        
        # Extract the token from Authorization header first
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        has_real_token = auth_header and auth_header.startswith('Bearer ') and len(auth_header.split(' ')[1]) > 100
        
        # Check if we're in development mode without Firebase AND no real token is provided
        if hasattr(settings, 'DEVELOPMENT_MODE') and settings.DEVELOPMENT_MODE and not has_real_token:
            logger.info("Running in development mode - Firebase authentication bypassed (no real token)")
            
            # Check if there's a specific user email in the request headers or session
            # This allows the frontend to specify which user to simulate
            dev_user_email = request.META.get('HTTP_X_DEV_USER_EMAIL')
            
            # Set default values for development
            request.firebase_user = None
            request.firebase_uid = 'dev-uid-12345'
            request.is_authenticated = True  # Enable authentication in development
            request.user = None
            
            # Try to get a development user from database
            try:
                User = get_user_model()
                dev_user = None
                
                # If a specific email is provided, use that user
                if dev_user_email:
                    dev_user = User.objects.filter(email=dev_user_email).first()
                    logger.info(f"Development mode: Requested specific user: {dev_user_email}")
                
                # If no specific email or user not found, default to a passenger user
                # to avoid always defaulting to admin
                if not dev_user:
                    # First try to find a passenger user (more realistic default)
                    dev_user = User.objects.filter(is_passenger=True, is_admin=False, is_staff=False).first()
                    if not dev_user:
                        # If no passengers, then try staff
                        dev_user = User.objects.filter(is_staff=True, is_admin=False).first()
                        if not dev_user:
                            # If no staff, try admin
                            dev_user = User.objects.filter(is_admin=True).first()
                            if not dev_user:
                                dev_user = User.objects.first()
                
                if dev_user:
                    request.user_id = dev_user.id
                    request.user = dev_user
                    # Set user attributes based on actual user data
                    request.user_type = dev_user.user_type
                    request.is_admin = dev_user.is_admin
                    request.is_staff = dev_user.is_staff
                    request.firebase_email = dev_user.email
                    logger.info(f"Development mode: Using user ID {dev_user.id} ({dev_user.email}) - Type: {dev_user.user_type}, Admin: {request.is_admin}, Staff: {request.is_staff}")
                    logger.info(f"Development mode: Final attributes - is_authenticated: {request.is_authenticated}, is_admin: {request.is_admin}, is_staff: {request.is_staff}")
                else:
                    request.user_id = None
                    request.user_type = 'passenger'
                    request.is_admin = False
                    request.is_staff = False
                    request.firebase_email = 'dev@test.com'
                    logger.info("Development mode: No users found in database")
            except Exception as e:
                logger.warning(f"Development mode: Could not fetch user - {e}")
                request.user_id = None
                request.user_type = 'passenger'
                request.is_admin = False
                request.is_staff = False
                request.firebase_email = 'dev@test.com'
            
            return self.get_response(request)
        
        # Check if Firebase is properly initialized
        if not firebase_admin._apps:
            logger.warning("Firebase not initialized")
            
            # In development, try to decode the Firebase token without verification
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                if len(token) > 100:  # Real Firebase token
                    try:
                        # Decode JWT without verification (development only!)
                        import jwt
                        decoded = jwt.decode(token, options={"verify_signature": False})
                        
                        request.firebase_user = decoded
                        request.firebase_email = decoded.get('email')
                        request.firebase_uid = decoded.get('uid') or decoded.get('user_id')
                        request.is_authenticated = True
                        
                        logger.info(f"🔍 Firebase token decoded - Email: {request.firebase_email}, UID: {request.firebase_uid}")
                        
                        # Try to find user in database
                        User = get_user_model()
                        try:
                            # Try exact match first
                            user = User.objects.get(email=request.firebase_email)
                            request.user = user
                            request.user_id = user.id
                            request.user_type = user.user_type
                            request.is_admin = user.is_admin
                            request.is_staff = user.is_staff
                            logger.info(f"✅ User found in DB: {user.email} (ID: {user.id})")
                            return self.get_response(request)
                        except User.DoesNotExist:
                            # Try case-insensitive search
                            user = User.objects.filter(email__iexact=request.firebase_email).first()
                            if user:
                                request.user = user
                                request.user_id = user.id
                                request.user_type = user.user_type
                                request.is_admin = user.is_admin
                                request.is_staff = user.is_staff
                                logger.info(f"✅ User found with case-insensitive search: {user.email} (ID: {user.id})")
                                return self.get_response(request)
                            else:
                                logger.error(f"❌ User NOT FOUND in database: {request.firebase_email}")
                                logger.error(f"   All users in DB: {[u.email for u in User.objects.all()[:10]]}")
                                
                                # DEVELOPMENT MODE FALLBACK: Try to use the newest staff user
                                logger.warning("⚠️ Development mode: Trying to use newest staff user as fallback")
                                fallback_user = User.objects.filter(is_staff=True).order_by('-id').first()
                                if fallback_user:
                                    request.user = fallback_user
                                    request.user_id = fallback_user.id
                                    request.user_type = fallback_user.user_type
                                    request.is_admin = fallback_user.is_admin
                                    request.is_staff = fallback_user.is_staff
                                    request.firebase_email = fallback_user.email
                                    logger.info(f"✅ Using fallback staff user: {fallback_user.email} (ID: {fallback_user.id})")
                                    return self.get_response(request)
                    except Exception as e:
                        logger.error(f"Failed to decode Firebase token in development: {e}")
            
            # Set default values for unauthenticated request
            request.firebase_user = None
            request.firebase_email = None
            request.firebase_uid = None
            request.user_type = 'passenger'
            request.is_authenticated = False
            request.is_admin = False
            request.is_staff = False
            request.user = None
            request.user_id = None
            return self.get_response(request)
        
        # Try to resolve the url and get the url name
        try:
            current_url_match = resolve(request.path_info)
            current_path = current_url_match.url_name
        except Resolver404:
            # If URL doesn't match any pattern, just continue
            current_path = None
        
        # Skip middleware for certain paths (like authentication endpoints)
        exempt_paths = ['login', 'signup', 'public-endpoints']
        
        if current_path in exempt_paths:
            return self.get_response(request)

        # Extract the token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        # Initialize user attributes
        request.firebase_user = None
        request.firebase_email = None
        request.firebase_uid = None
        request.user_type = 'passenger'  # Default type
        request.is_authenticated = False
        request.is_admin = False
        request.is_staff = False
        request.user = None
        request.user_id = None

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
            try:
                # Check if Firebase app is properly initialized before using auth
                if not firebase_admin._apps:
                    logger.error("Firebase auth error: The default Firebase app does not exist. Make sure to initialize the SDK by calling initialize_app().")
                    return JsonResponse({
                        'error': 'Firebase not initialized',
                        'code': 'FIREBASE_NOT_INITIALIZED'
                    }, status=401)
                
                # Verify the token with Firebase
                decoded_token = auth.verify_id_token(token)
                
                # Store Firebase user info in request
                request.firebase_user = decoded_token
                request.firebase_email = decoded_token.get('email')
                request.firebase_uid = decoded_token.get('uid')
                request.is_authenticated = True
                
                # Check if user exists in our database
                User = get_user_model()
                try:
                    user = User.objects.get(firebase_uid=request.firebase_uid)
                    
                    # Set user ID explicitly
                    request.user_id = user.id
                    
                    # Set user type and permissions based on DB values
                    request.user_type = user.user_type
                    request.is_admin = user.is_admin
                    request.is_staff = user.is_staff
                    
                    # Authenticate the request with this user
                    request.user = user
                    
                    # Log successful authentication
                    logger.info(f"✅ User authenticated: {user.email}")
                    logger.info(f"   User flags - is_admin: {user.is_admin}, is_staff: {user.is_staff}, is_passenger: {user.is_passenger}")
                    logger.info(f"   Request flags set - is_authenticated: {request.is_authenticated}, is_admin: {request.is_admin}, is_staff: {request.is_staff}")
                    
                except User.DoesNotExist:
                    # Try to find by email
                    try:
                        user = User.objects.get(email=request.firebase_email)
                        # Update firebase_uid
                        user.firebase_uid = request.firebase_uid
                        user.save()
                        
                        request.user_id = user.id
                        request.user_type = user.user_type
                        request.is_admin = user.is_admin
                        request.is_staff = user.is_staff
                        request.user = user
                        
                        logger.info(f"User authenticated: {user.email}, is_admin: {user.is_admin}, is_staff: {user.is_staff}")
                        
                    except User.DoesNotExist:
                        # User doesn't exist in DB yet - this should not happen in normal flow
                        # Users should register through the proper signup process
                        logger.warning(f"User {request.firebase_email} authenticated with Firebase but not found in database")
                        request.user_type = 'passenger'
                        request.is_admin = False
                        request.is_staff = False
                
            except auth.ExpiredIdTokenError:
                logger.error("Firebase token expired")
                return JsonResponse({
                    'error': 'Token expired. Please refresh and try again.',
                    'code': 'TOKEN_EXPIRED'
                }, status=401)
            except auth.InvalidIdTokenError:
                logger.error("Invalid Firebase token")
                return JsonResponse({
                    'error': 'Invalid authentication token',
                    'code': 'INVALID_TOKEN'
                }, status=401)
            except Exception as e:
                logger.error(f"Firebase auth error: {str(e)}")
                return JsonResponse({
                    'error': f'Authentication error: {str(e)}',
                    'code': 'AUTH_ERROR'
                }, status=401)
        
        response = self.get_response(request)
        return response