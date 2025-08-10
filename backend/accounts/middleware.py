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