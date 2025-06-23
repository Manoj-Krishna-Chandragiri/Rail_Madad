from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from functools import wraps
import firebase_admin
from firebase_admin import auth
import uuid
import logging

logger = logging.getLogger('accounts')

User = get_user_model()

def get_or_create_user(request):
    """
    Gets an existing user or creates a new one based on Firebase authentication.
    Handles both email/password and Google auth scenarios with improved logging.
    Returns both the user object and a boolean indicating whether the user was created.
    """
    # Ensure we have the necessary Firebase authentication details
    if not hasattr(request, 'firebase_email') or not request.firebase_email:
        logger.error("No Firebase email found during user creation attempt")
        return None, False

    try:
        # Try to find user by Firebase UID first (most precise)
        if hasattr(request, 'firebase_uid') and request.firebase_uid:
            try:
                user = User.objects.get(firebase_uid=request.firebase_uid)
                logger.info(f"User found by Firebase UID: {user.email}, user_id: {user.id}")
                
                # Ensure request has user_id set
                request.user_id = user.id
                
                return user, False  # Existing user
            except User.DoesNotExist:
                pass

        # Try to find by email 
        try:
            user = User.objects.get(email=request.firebase_email)
            
            # Update the firebase_uid if it's different
            if hasattr(request, 'firebase_uid') and request.firebase_uid:
                if user.firebase_uid != request.firebase_uid:
                    user.firebase_uid = request.firebase_uid
                    user.save()
            
            # Ensure request has user_id set
            request.user_id = user.id
            
            logger.info(f"User found by email: {user.email}, user_id: {user.id}")
            return user, False
        except User.DoesNotExist:
            # Create new user since they don't exist in our system yet
            # Get user type from request data or default to 'passenger'
            user_type = getattr(request, 'user_type_override', 'passenger')
            
            # Special handling for admin emails
            admin_emails = ['adm.railmadad@gmail.com', 'admin@railmadad.in']
            if request.firebase_email in admin_emails:
                user_type = 'admin'
            
            # Determine admin status
            is_admin = user_type == 'admin' or request.firebase_email in admin_emails
            
            # Try to get display name from Firebase user data
            full_name = None
            if hasattr(request, 'firebase_user'):
                full_name = (
                    request.firebase_user.get('name') or 
                    request.firebase_user.get('display_name') or 
                    request.firebase_user.get('full_name')
                )
            
            # Create the user record
            try:
                user = User.objects.create(
                    firebase_uid=request.firebase_uid or str(uuid.uuid4()),
                    email=request.firebase_email,
                    full_name=full_name,
                    is_active=True,
                    user_type=user_type,
                    is_admin=is_admin,
                    is_staff=is_admin or user_type == 'staff'
                )
                
                # Set request.user_id to the newly created user ID
                request.user_id = user.id
                
                logger.info(f"New user created: {user.email}, user_id: {user.id}, user_type: {user_type}, is_admin: {is_admin}")
                return user, True  # New user
            except Exception as create_error:
                logger.error(f"Error creating user: {str(create_error)}")
                return None, False

    except Exception as e:
        logger.error(f"Unexpected error in get_or_create_user: {str(e)}")
        return None, False

# Decorator to require admin access
def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request, 'is_authenticated') or not request.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not request.is_admin:
            return JsonResponse({'error': 'Admin access required'}, status=403)
            
        return view_func(request, *args, **kwargs)
    return _wrapped_view

# Decorator to require staff or admin access
def staff_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request, 'is_authenticated') or not request.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        if not (request.is_staff or request.is_admin):
            return JsonResponse({'error': 'Staff access required'}, status=403)
            
        return view_func(request, *args, **kwargs)
    return _wrapped_view

# Decorator to require authentication
def login_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not hasattr(request, 'is_authenticated') or not request.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view

@api_view(['GET'])
@login_required
def user_profile(request):
    """Get the profile of the current logged-in user"""
    try:
        # Get or create the user in the database if needed
        user, created = get_or_create_user(request)
        
        if user:
            # Determine admin status properly
            is_admin = (
                user.user_type == 'admin' or 
                user.is_admin or 
                user.email == 'adm.railmadad@gmail.com' or
                user.email == 'admin@railmadad.in'
            )
            
            # Determine staff status
            is_staff = (
                user.user_type in ['admin', 'staff'] or 
                user.is_staff or 
                is_admin
            )
            
            data = {
                'full_name': user.full_name or "",
                'email': user.email,
                'phone_number': user.phone_number or "",
                'gender': user.gender or "",
                'address': user.address or "",
                'user_type': user.user_type,
                'is_admin': is_admin,
                'is_staff': is_staff,
                'created_now': created  # Indicate if this is a newly created user
            }
        else:
            # User is authenticated with Firebase but not in our database
            # Return basic Firebase info
            admin_emails = ['adm.railmadad@gmail.com', 'admin@railmadad.in']
            user_type = 'admin' if request.firebase_email in admin_emails else 'passenger'
            is_admin = user_type == 'admin'
            
            data = {
                'full_name': "",
                'email': request.firebase_email,
                'phone_number': "",
                'gender': "",
                'address': "",
                'user_type': user_type,
                'is_admin': is_admin,
                'is_staff': is_admin,
                'created_now': False
            }
            
        return Response(data)
    except Exception as e:
        logger.error(f"Error in user_profile: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@login_required
def create_profile(request):
    """Create or update a user profile from Firebase Sign-In data"""
    try:
        # Ensure we have Firebase authentication
        if not hasattr(request, 'firebase_uid') or not request.firebase_uid:
            return Response({'error': 'Authentication required'}, status=401)
        
        # Set user type from request data
        user_type = request.data.get('user_type', 'passenger')
        request.user_type_override = user_type
        
        # Get or create user in the database
        user, created = get_or_create_user(request)
        
        if not user:
            return Response({'error': 'Failed to create or find user record'}, status=500)
        
        # Update user data from request
        update_fields = {
            'full_name': request.data.get('name'),
            'phone_number': request.data.get('phone_number'),
            'gender': request.data.get('gender'),
            'address': request.data.get('address'),
            'user_type': user_type
        }
        
        # Remove None values and update only provided fields
        update_fields = {k: v for k, v in update_fields.items() if v is not None}
        
        for field, value in update_fields.items():
            setattr(user, field, value)
        
        # Update admin/staff status based on user type
        if user_type == 'admin':
            user.is_admin = True
            user.is_staff = True
        elif user_type == 'staff':
            user.is_staff = True
        
        user.save()
        
        return Response({
            'message': 'Profile created/updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'user_type': user.user_type,
                'is_admin': user.is_user_admin,
                'created_now': created
            }
        }, status=201 if created else 200)
        
    except Exception as e:
        logger.error(f"Error in create_profile: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@admin_required
def list_users(request):
    """List all users (admin only)"""
    try:
        users = User.objects.all()
        data = [{
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'phone_number': user.phone_number,
            'user_type': user.user_type,
            'is_admin': user.is_user_admin,
            'is_staff': user.is_user_staff,
            'date_joined': user.date_joined
        } for user in users]
        
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PUT'])
@login_required
def update_profile(request):
    """Update the current user's profile"""
    try:
        # Ensure user exists in database before updating profile
        user, created = get_or_create_user(request)
        
        if not user:
            return Response({'error': 'Failed to create or find user record'}, status=500)
        
        # Update user fields if they exist in the request
        for field in ['full_name', 'phone_number', 'gender', 'address']:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'phone_number': user.phone_number,
                'gender': user.gender,
                'address': user.address,
                'user_type': user.user_type
            }
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Staff creation by admin (kept from previous version)
@api_view(['POST'])
@admin_required
def create_staff(request):
    """Create a new staff member (admin only)"""
    try:
        # Extract data from request
        email = request.data.get('email')
        password = request.data.get('password')
        full_name = request.data.get('full_name')
        phone_number = request.data.get('phone_number')
        
        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)
        
        # Check if a user with this email already exists
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'User with this email already exists'}, status=400)
        
        # Create the user in Firebase
        try:
            firebase_user = auth.create_user(
                email=email,
                password=password,
                email_verified=True
            )
            firebase_uid = firebase_user.uid
        except firebase_admin.exceptions.FirebaseError as e:
            return JsonResponse({'error': f'Firebase error: {str(e)}'}, status=400)
        
        # Create the Django user
        user = User.objects.create(
            email=email,
            firebase_uid=firebase_uid,
            full_name=full_name,
            phone_number=phone_number,
            user_type='staff',
            is_staff=True
        )
        
        return JsonResponse({
            'message': 'Staff user created successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'user_type': user.user_type
            }
        }, status=201)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
import firebase_admin
from firebase_admin import auth as firebase_auth
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

@api_view(['POST'])
def verify_admin(request):
    """
    Verify if the authenticated user has admin privileges
    """
    try:
        # Get the Firebase ID token from the request header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith(('Bearer ', 'Token ')):
            return Response({
                'is_admin': False,
                'error': 'Invalid authorization header'
            }, status=status.HTTP_401_UNAUTHORIZED)

        token = auth_header.split(' ')[1]
        
        try:
            # Verify the ID token
            decoded_token = firebase_auth.verify_id_token(token)
            uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            
            # Check admin emails
            admin_emails = ['admin@railmadad.in', 'adm.railmadad@gmail.com']
            is_admin_email = email in admin_emails
            
            # Check if user is an admin in Firebase custom claims
            is_admin_in_firebase = False
            
            # Check direct admin claim
            if decoded_token.get('admin', False):
                is_admin_in_firebase = True
            
            # Also check in the claims object
            if 'claims' in decoded_token and decoded_token['claims'].get('admin', False):
                is_admin_in_firebase = True
                
            # For admin emails, consider them as admins
            if is_admin_email:
                is_admin_in_firebase = True
                
                # Make sure to set this user as an admin in Firebase as well
                try:
                    # Set custom claims to mark as admin
                    firebase_auth.set_custom_user_claims(uid, {'admin': True})
                    logger.info(f"Set admin claim for user {email} with uid {uid}")
                except Exception as e:
                    logger.error(f"Failed to set admin claim: {str(e)}")
                
            # Check if user exists in our database
            try:
                user = User.objects.get(email=email)
                # Update admin status in our database if they're an admin
                if is_admin_in_firebase and not user.is_admin:
                    user.is_admin = True
                    user.is_staff = True
                    user.user_type = 'admin'
                    user.save()
                    logger.info(f"Updated user {email} to admin in database")
                
                # Use the database value for final determination
                is_admin = user.is_admin or user.user_type == 'admin' or is_admin_email
                
            except User.DoesNotExist:
                # Create new user if they're an admin
                if is_admin_in_firebase or is_admin_email:
                    user = User.objects.create(
                        firebase_uid=uid,
                        email=email,
                        user_type='admin',
                        is_admin=True,
                        is_staff=True
                    )
                    logger.info(f"Created new admin user {email} in database")
                    is_admin = True
                else:
                    is_admin = False
            
            return Response({
                'is_admin': is_admin,
                'user_id': uid,
                'email': email
            })
            
        except Exception as e:
            logger.error(f"Admin verification error: {str(e)}")
            return Response({
                'is_admin': False,
                'error': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Unexpected error in verify_admin: {str(e)}")
        return Response({
            'is_admin': False,
            'error': 'Server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_profile(request):
    """
    Get the authenticated admin's profile information
    """
    user = request.user
    
    # Ensure the user is an admin
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not an admin user'}, status=status.HTTP_403_FORBIDDEN)
    
    # Return admin profile data
    return Response({
        'id': user.id,
        'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
        'email': user.email,
        'phone_number': getattr(user, 'phone_number', ''),
        'gender': getattr(user, 'gender', ''),
        'address': getattr(user, 'address', '')
    })

@api_view(['POST'])
def register_user(request):
    """Register a new user with user type selection"""
    try:
        email = request.data.get('email')
        user_type = request.data.get('user_type', 'passenger')
        full_name = request.data.get('full_name', '')
        phone_number = request.data.get('phone_number', '')
        
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=400)
        
        # For now, we'll create a placeholder user that will be updated when they sign in with Firebase
        user = User.objects.create(
            email=email,
            firebase_uid='',  # Will be updated on first login
            full_name=full_name,
            phone_number=phone_number,
            user_type=user_type,
            is_admin=user_type == 'admin',
            is_staff=user_type in ['admin', 'staff']
        )
        
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'user_type': user.user_type
            }
        }, status=201)
        
    except Exception as e:
        logger.error(f"Error in register_user: {str(e)}")
        return Response({'error': str(e)}, status=500)