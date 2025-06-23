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
        # Initialize Firebase Admin SDK if not already initialized
        try:
            firebase_admin.get_app()
        except ValueError:
            # Use the service account credentials from your Firebase project
            cred = credentials.Certificate("path/to/serviceAccountKey.json")
            firebase_admin.initialize_app(cred)

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
        request.user_type = 'user'  # Default type
        request.is_authenticated = False
        request.is_admin = False
        request.is_staff = False
        request.user = None  # Ensure user is initially None
        request.user_id = None  # Initialize user_id attribute

        if auth_header:
            # Properly extract the token - typically in format "Bearer <token>"
            token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
            
            logger.debug(f"Processing auth token: {token[:10]}...")
            try:
                # Verify the token with Firebase
                decoded_token = auth.verify_id_token(token)
                logger.debug(f"Token decoded successfully for: {decoded_token.get('email')}")
                
                # Store Firebase user info in request
                request.firebase_user = decoded_token
                request.firebase_email = decoded_token.get('email')
                request.firebase_uid = decoded_token.get('uid')
                request.is_authenticated = True
                
                # Enhanced user data extraction for Google Auth
                if 'name' in decoded_token:
                    request.firebase_name = decoded_token.get('name')
                elif 'display_name' in decoded_token:
                    request.firebase_name = decoded_token.get('display_name')
                
                # Store provider data
                request.firebase_provider = decoded_token.get('firebase', {}).get('sign_in_provider', 'unknown') if 'firebase' in decoded_token else 'unknown'
                
                # Check if user exists in our database
                User = get_user_model()
                try:
                    # Try to find by firebase_uid first
                    user = User.objects.get(firebase_uid=request.firebase_uid)
                    logger.debug(f"Found existing user: {user.email}")
                    
                    # Set user ID explicitly
                    request.user_id = user.id
                    
                    # Set user type and permissions based on DB values
                    request.user_type = user.user_type
                    request.is_admin = user.is_user_admin
                    request.is_staff = user.is_user_staff
                    
                    # Authenticate the request with this user
                    request.user = user
                    
                except User.DoesNotExist:
                    # Try to find by email (for cases where firebase_uid wasn't set initially)
                    try:
                        user = User.objects.get(email=request.firebase_email)
                        # Update firebase_uid
                        user.firebase_uid = request.firebase_uid
                        user.save()
                        
                        request.user_id = user.id
                        request.user_type = user.user_type
                        request.is_admin = user.is_user_admin
                        request.is_staff = user.is_user_staff
                        request.user = user
                        
                    except User.DoesNotExist:
                        # User doesn't exist in DB, set defaults
                        logger.debug(f"User {request.firebase_email} authenticated via Firebase but not in database")
                        
                        # For users not in database, we'll create them when needed
                        # but for now, set basic attributes
                        request.user_id = None  # Will be created when filing complaint
                        
                        # Check if this is admin by email
                        admin_emails = ['adm.railmadad@gmail.com', 'admin@railmadad.in']
                        if request.firebase_email in admin_emails:
                            request.user_type = 'admin'
                            request.is_admin = True
                            request.is_staff = True
                        else:
                            request.user_type = 'passenger'
                            request.is_admin = False
                            request.is_staff = False
                
            except ValueError as e:
                logger.error(f"Invalid token format: {str(e)}")
                return JsonResponse({'error': 'Invalid token format'}, status=401)
            except auth.InvalidIdTokenError as e:
                logger.error(f"Invalid Firebase token: {str(e)}")
                return JsonResponse({'error': 'Invalid or expired Firebase token'}, status=401)
            except Exception as e:
                logger.error(f"Firebase auth error: {str(e)}")
                return JsonResponse({'error': f'Authentication error: {str(e)}'}, status=401)
        
        response = self.get_response(request)
        return response