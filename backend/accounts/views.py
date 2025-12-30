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
    
    AUTO-REGISTRATION: If user is authenticated with Firebase but not in DB, creates them automatically.
    """
    from django.conf import settings
    
    # First check if middleware already set the user (happens in development with JWT decode)
    if hasattr(request, 'user') and request.user is not None and hasattr(request.user, 'email'):
        try:
            # Verify it's a real User object, not AnonymousUser
            if request.user.is_authenticated or hasattr(request.user, 'firebase_uid'):
                logger.info(f"Using user from middleware: {request.user.email}, user_id: {request.user.id}")
                return request.user, False
        except AttributeError:
            pass
    
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
                return user, False
            except User.DoesNotExist:
                pass

        # Try to find user by email (case-insensitive)
        user = User.objects.filter(email__iexact=request.firebase_email).first()
        if user:
            logger.info(f"User found by email: {user.email}")
            
            # Update Firebase UID if it wasn't set
            if hasattr(request, 'firebase_uid') and request.firebase_uid and not user.firebase_uid:
                user.firebase_uid = request.firebase_uid
                user.save()
                logger.info(f"Updated Firebase UID for user: {user.email}")
            
            return user, False

        # AUTO-REGISTRATION: User authenticated with Firebase but not in DB - create them!
        logger.warning(f"User {request.firebase_email} authenticated with Firebase but not in DB - creating new user")
        
        # Extract display name from Firebase user if available
        display_name = ""
        if hasattr(request, 'firebase_user') and request.firebase_user:
            display_name = request.firebase_user.get('name', '') or request.firebase_user.get('display_name', '')
        
        # Create new user as passenger by default
        new_user = User.objects.create(
            email=request.firebase_email,
            firebase_uid=getattr(request, 'firebase_uid', ''),
            full_name=display_name or request.firebase_email.split('@')[0],
            is_passenger=True,
            is_staff=False,
            is_admin=False,
        )
        logger.info(f"✅ Auto-registered new user: {new_user.email} (ID: {new_user.id})")
        return new_user, True

    except Exception as e:
        logger.error(f"Error in get_or_create_user: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return None, False

# Development-only endpoints for user switching
@api_view(['POST'])
def dev_switch_user(request):
    """Development only: Switch to a different user for testing"""
    from django.conf import settings
    
    # Only allow in development mode
    if not (hasattr(settings, 'DEVELOPMENT_MODE') and settings.DEVELOPMENT_MODE):
        return Response({'error': 'Not available in production'}, status=403)
    
    try:
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        
        # Find the user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
        return Response({
            'message': f'Development mode: Switched to user {user.email}',
            'user': {
                'id': user.id,
                'email': user.email,
                'user_type': user.user_type,
                'is_admin': user.is_admin,
                'is_staff': user.is_staff
            },
            'instruction': 'Set X-Dev-User-Email header to this email in subsequent requests'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def dev_list_users(request):
    """Development only: List all users for switching"""
    from django.conf import settings
    
    # Only allow in development mode
    if not (hasattr(settings, 'DEVELOPMENT_MODE') and settings.DEVELOPMENT_MODE):
        return Response({'error': 'Not available in production'}, status=403)
    
    users = User.objects.all()
    user_list = []
    for user in users:
        user_list.append({
            'id': user.id,
            'email': user.email,
            'user_type': user.user_type,
            'is_admin': user.is_admin,
            'is_staff': user.is_staff,
            'full_name': user.full_name
        })
    
    return Response({
        'users': user_list,
        'instruction': 'Use /api/accounts/dev/switch-user/ to switch to any user'
    })

# Development-only endpoint for switching users
@api_view(['POST'])
def dev_switch_user(request):
    """Development only: Switch to a different user for testing"""
    from django.conf import settings
    
    # Only allow in development mode
    if not (hasattr(settings, 'DEVELOPMENT_MODE') and settings.DEVELOPMENT_MODE):
        return Response({'error': 'Not available in production'}, status=403)
    
    try:
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        
        # Find the user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
        return Response({
            'message': f'Development mode: Switched to user {user.email}',
            'user': {
                'id': user.id,
                'email': user.email,
                'user_type': user.user_type,
                'is_admin': user.is_admin,
                'is_staff': user.is_staff
            },
            'instruction': 'Set X-Dev-User-Email header to this email in subsequent requests'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def dev_list_users(request):
    """Development only: List all users for switching"""
    from django.conf import settings
    
    # Only allow in development mode
    if not (hasattr(settings, 'DEVELOPMENT_MODE') and settings.DEVELOPMENT_MODE):
        return Response({'error': 'Not available in production'}, status=403)
    
    users = User.objects.all()
    user_list = []
    for user in users:
        user_list.append({
            'id': user.id,
            'email': user.email,
            'user_type': user.user_type,
            'is_admin': user.is_admin,
            'is_staff': user.is_staff,
            'full_name': user.full_name
        })
    
    return Response({
        'users': user_list,
        'instruction': 'Use /api/accounts/dev/switch-user/ to switch to any user'
    })

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
        # Check if we're in development mode and bypass authentication
        from django.conf import settings
        import firebase_admin
        
        # Use same condition as middleware
        is_development = hasattr(settings, 'DEBUG') and settings.DEBUG and not firebase_admin._apps
        
        if is_development:
            logger.info("Development mode: bypassing authentication requirement")
            logger.info(f"Development mode active: {is_development}")
            
            # Log current attribute values from middleware
            logger.info(f"Current request attributes - is_admin: {getattr(request, 'is_admin', 'Not set')}, is_staff: {getattr(request, 'is_staff', 'Not set')}")
            
            # Set some default attributes for development only if middleware hasn't set them properly
            if not hasattr(request, 'firebase_email'):
                request.firebase_email = 'dev@test.com'
            if not hasattr(request, 'firebase_uid'):
                request.firebase_uid = 'dev-uid-12345'
            if not hasattr(request, 'is_authenticated'):
                request.is_authenticated = True
            if not hasattr(request, 'user_type'):
                request.user_type = 'passenger'
            
            # DO NOT override is_admin and is_staff - let middleware handle these
            # Only set defaults if middleware hasn't set them at all
            if not hasattr(request, 'is_admin'):
                request.is_admin = False
                logger.info("Set default is_admin=False")
            if not hasattr(request, 'is_staff'):
                request.is_staff = False  
                logger.info("Set default is_staff=False")
                
            logger.info(f"Final request attributes - is_admin: {request.is_admin}, is_staff: {request.is_staff}")
            return view_func(request, *args, **kwargs)
        
        if not hasattr(request, 'is_authenticated') or not request.is_authenticated:
            logger.info("Authentication failed - not authenticated")
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view

@api_view(['GET'])
@login_required
def user_profile(request):
    """Get the profile of the current logged-in user"""
    try:
        # Debug: Check if we're in development mode
        from django.conf import settings
        if hasattr(settings, 'DEVELOPMENT_MODE'):
            logger.info(f"Development mode active: {settings.DEVELOPMENT_MODE}")
        
        # ✅ Add debugging
        logger.info(f"user_profile called for email: {getattr(request, 'firebase_email', 'unknown')}")
        logger.info(f"Request attributes: authenticated={getattr(request, 'is_authenticated', 'not set')}")
        
        # Get or create the user in the database if needed
        user, created = get_or_create_user(request)
        
        if created:
            logger.warning(f"User was CREATED during login: {user.email if user else 'None'}")
        else:
            logger.info(f"User found in database: {user.email if user else 'None'}")
        
        if user:
            # ✅ Add debugging for user data
            logger.info(f"User data - user_type: {user.user_type}, is_admin: {user.is_admin}, is_staff: {user.is_staff}, is_passenger: {user.is_passenger}")
            
            # Use the boolean fields directly (they now control user permissions)
            is_admin = user.is_admin or user.is_super_admin
            is_staff = user.is_staff or user.is_admin or user.is_super_admin
            is_passenger = user.is_passenger
            is_super_admin = user.is_super_admin
            
            logger.info(f"Final computed values - is_admin: {is_admin}, is_staff: {is_staff}, is_passenger: {is_passenger}, is_super_admin: {is_super_admin}")
            
            data = {
                'full_name': user.full_name or "",
                'email': user.email,
                'phone_number': user.phone_number or "",
                'gender': user.gender or "",
                'address': user.address or "",
                'user_type': user.user_type,  # This is now a computed property
                'is_admin': is_admin,
                'is_staff': is_staff,
                'is_passenger': is_passenger,
                'is_super_admin': is_super_admin,
                'date_joined': user.date_joined.isoformat(),  # Include date_joined in ISO format
                'created_now': created  # Indicate if this is a newly created user
            }

            # Include staff profile details when available so staff uses the same profile endpoint
            if is_staff and hasattr(user, 'staff_profile'):
                staff = user.staff_profile
                data.update({
                    'employee_id': staff.employee_id or "",
                    'department': staff.department or "",
                    'role': staff.role or "",
                    'location': staff.location or "",
                    'status': staff.status or "",
                    'joining_date': staff.joining_date.isoformat() if staff.joining_date else "",
                    'expertise_areas': staff.expertise or [],
                    'languages_spoken': staff.languages or [],
                    'rating': staff.rating or 0.0,
                    'active_tickets': staff.active_tickets or 0,
                })
        else:
            # ❌ User not found in database - this means they haven't completed signup
            logger.error(f"User {request.firebase_email} authenticated with Firebase but not found in database")
            return Response({
                'error': 'User profile not found. Please complete your registration.',
                'code': 'PROFILE_NOT_FOUND'
            }, status=404)
            
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
        
        user_data = request.data
        
        # Get user_type from request, default to 'passenger'
        user_type = user_data.get('user_type', 'passenger')
        
        # ✅ Add debugging logs
        logger.info(f"create_profile called for email: {user_data.get('email')}")
        logger.info(f"Received user_type: {user_type}")
        logger.info(f"Full user_data: {user_data}")
        
        # ✅ Determine admin and staff status based on user_type
        is_admin = user_type == 'admin'
        is_staff = user_type == 'staff'
        is_passenger = user_type == 'passenger'
        
        logger.info(f"Setting is_admin: {is_admin}, is_staff: {is_staff}, is_passenger: {is_passenger}")
        
        # Create or update profile
        profile, created = User.objects.update_or_create(
            email=user_data.get('email'),
            defaults={
                'firebase_uid': request.firebase_uid,  # ✅ Set Firebase UID
                'full_name': user_data.get('name', ''),
                'phone_number': user_data.get('phone_number', ''),
                'gender': user_data.get('gender', ''),
                'address': user_data.get('address', ''),
                'is_admin': is_admin,      # ✅ Set admin status
                'is_staff': is_staff,      # ✅ Set staff status  
                'is_passenger': is_passenger,  # ✅ Set passenger status
            }
        )
        
        logger.info(f"Profile {'created' if created else 'updated'}: {profile.email}, user_type: {profile.user_type}, is_admin: {profile.is_admin}")
        
        return Response({
            'message': 'Profile created successfully',
            'user_type': profile.user_type,
            'is_admin': profile.is_admin  # ✅ Use actual is_admin field
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@admin_required
def list_users(request):
    """List all users (admin only)"""
    try:
        users = User.objects.all()
        data = [{
            'id': str(user.id),
            'email': user.email,
            'full_name': user.full_name or 'N/A',
            'role': 'admin' if user.is_user_admin else ('staff' if user.is_user_staff else 'passenger'),
            'status': 'active' if user.is_active else 'inactive',
            'phone_number': user.phone_number or '',
            'location': getattr(user, 'address', '') or '',
            'created_at': user.date_joined.isoformat() if user.date_joined else ''
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

@api_view(['DELETE'])
def delete_user_account(request):
    """Delete the current user's account and all associated data"""
    try:
        # Get the authenticated user
        user_email = getattr(request, 'firebase_email', None)
        user_uid = getattr(request, 'firebase_uid', None)
        
        if not user_email or not user_uid:
            return Response({'error': 'User not authenticated'}, status=401)
        
        # Find the user in database
        try:
            user = User.objects.get(firebase_uid=user_uid)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                return Response({'error': 'User not found in database'}, status=404)
        
        # Delete the user (this will cascade delete related data due to ForeignKey relationships)
        user_id = user.id
        user_email = user.email
        user.delete()
        
        logger.info(f"User account deleted: {user_email} (ID: {user_id})")
        
        return Response({
            'message': 'User account deleted successfully',
            'deleted_user_id': user_id
        }, status=200)
        
    except Exception as e:
        logger.error(f"Error in delete_user_account: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def staff_list(request):
    """Get list of all staff members"""
    try:
        from .models import Staff
        
        staff_members = Staff.objects.select_related('user').all()
        
        staff_data = [{
            'id': staff.user_id,  # Use user_id as primary key
            'user_id': staff.user_id,
            'email': staff.email,
            'full_name': staff.full_name,  # Use full_name field
            'name': staff.full_name,  # Also include as name for compatibility
            'department': staff.department,
            'role': staff.role,
            'location': staff.location,
            'status': staff.status,
            'rating': float(staff.rating),
            'active_tickets': staff.active_tickets,
            'joining_date': staff.joining_date.isoformat() if staff.joining_date else None,
        } for staff in staff_members]
        
        return Response(staff_data, status=200)
    except Exception as e:
        logger.error(f"Error in staff_list: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def staff_performance(request):
    """Get staff performance metrics"""
    try:
        from .models import StaffPerformance, Staff
        from django.db.models import Avg
        
        month = request.GET.get('month')
        year = request.GET.get('year')
        
        logger.info(f"staff_performance called - month: {month}, year: {year}")
        
        # Use accounts.Staff, select_related on 'staff__user'
        performance_query = StaffPerformance.objects.select_related('staff__user')
        
        if month:
            performance_query = performance_query.filter(month=int(month))
        if year:
            performance_query = performance_query.filter(year=int(year))
        
        logger.info(f"Found {performance_query.count()} performance records")
        
        performance_data = []
        for perf in performance_query:
            if perf.staff:  # Make sure staff is not null
                performance_data.append({
                    'staff_id': perf.staff.user_id,  # Use user_id as primary key
                    'staff_name': perf.staff.full_name,  # Use full_name field
                    'staff_email': perf.staff.email,
                    'month': perf.month,
                    'year': perf.year,
                    'tickets_resolved': perf.tickets_resolved,
                    'avg_resolution_time': float(perf.avg_resolution_time),
                    'customer_satisfaction': float(perf.customer_satisfaction),
                    'complaints_received': perf.complaints_received,
                })
        
        return Response(performance_data, status=200)
    except Exception as e:
        logger.error(f"Error in staff_performance: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def staff_register(request):
    """Register a new staff member (called during signup, before authentication)"""
    try:
        from .models import Staff, FirebaseUser
        
        logger.info("staff_register called - Starting staff registration...")
        
        # Get Firebase ID token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            logger.error("No Bearer token in Authorization header")
            return Response({'error': 'No authentication token provided'}, status=401)
        
        token = auth_header.split(' ')[1]
        logger.info(f"Token received (length: {len(token)})")
        
        # Try to verify Firebase token, but fall back to JWT decode in development mode
        firebase_uid = None
        firebase_email = None
        
        try:
            # Try Firebase admin verification first
            import firebase_admin.auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(token)
            firebase_uid = decoded_token.get('uid')
            firebase_email = decoded_token.get('email')
            logger.info(f"Firebase token verified - UID: {firebase_uid}, Email: {firebase_email}")
        except Exception as firebase_error:
            logger.warning(f"Firebase verification failed, trying JWT decode: {str(firebase_error)}")
            
            # Fall back to JWT decode (for development mode)
            try:
                import jwt
                decoded_token = jwt.decode(token, options={"verify_signature": False})
                firebase_uid = decoded_token.get('user_id') or decoded_token.get('sub')
                firebase_email = decoded_token.get('email')
                logger.info(f"JWT token decoded - UID: {firebase_uid}, Email: {firebase_email}")
            except Exception as jwt_error:
                logger.error(f"Both Firebase and JWT verification failed: {str(jwt_error)}")
                return Response({'error': f'Invalid authentication token: {str(jwt_error)}'}, status=401)
        
        if not firebase_email:
            logger.error("Could not extract email from token")
            return Response({'error': 'Email not found in token'}, status=401)
        
        # Get staff data from request
        staff_data = request.data
        
        logger.info(f"Staff registration data received:")
        logger.info(f"   Email: {firebase_email}")
        logger.info(f"   Name: {staff_data.get('name')}")
        logger.info(f"   Employee ID: {staff_data.get('employee_id')}")
        logger.info(f"   Department: {staff_data.get('department')}")
        logger.info(f"   Role: {staff_data.get('role')}")
        
        # Create FirebaseUser entry
        try:
            user, created = FirebaseUser.objects.update_or_create(
                email=firebase_email,
                defaults={
                    'firebase_uid': firebase_uid or '',
                    'full_name': staff_data.get('name', ''),
                    'phone_number': staff_data.get('phone_number', ''),
                    'gender': staff_data.get('gender', ''),
                    'address': staff_data.get('address', ''),
                    'is_staff': True,  # Boolean flag for staff
                    'is_admin': False,
                    'is_super_admin': False,
                    'is_passenger': False,
                    'is_active': True,
                }
            )
            
            logger.info(f"FirebaseUser {'created' if created else 'updated'}: {user.email} (ID: {user.id})")
        except Exception as e:
            logger.error(f"Failed to create FirebaseUser: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({'error': f'Failed to create user: {str(e)}'}, status=500)
        
        # Create Staff profile (accounts.Staff model with user FK)
        try:
            staff, staff_created = Staff.objects.update_or_create(
                user=user,  # Use user FK as primary key
                defaults={
                    'email': firebase_email,
                    'full_name': staff_data.get('name', ''),  # full_name field
                    'phone_number': staff_data.get('phone_number', ''),
                    'employee_id': staff_data.get('employee_id', ''),
                    'department': staff_data.get('department', ''),
                    'role': staff_data.get('role', ''),
                    'location': staff_data.get('location', ''),
                    'expertise': staff_data.get('expertise', []),  # JSON field, no need to dump
                    'languages': staff_data.get('languages', []),
                    'communication_preferences': staff_data.get('communication_channels', ['Chat']),
                    'status': 'active',
                }
            )
            
            logger.info(f"Staff profile {'created' if staff_created else 'updated'}: {staff.employee_id} (user_id: {staff.user_id})")
        except Exception as e:
            logger.error(f"Failed to create Staff profile: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({'error': f'Failed to create staff profile: {str(e)}'}, status=500)
        
        logger.info(f"Staff registration completed successfully for {user.email}")
        
        return Response({
            'message': 'Staff registered successfully',
            'user_id': user.id,
            'staff_id': staff.user_id,  # Staff uses user_id as primary key
            'email': user.email,
            'user_type': 'staff'
        }, status=201)
        
    except Exception as e:
        logger.error(f"Error in staff_register: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_notifications(request):
    """Get notifications for the current user based on their role"""
    try:
        role = request.GET.get('role', 'passenger')
        
        # Mock notifications data for now
        notifications = [
            {
                'id': 1,
                'title': 'Welcome to Rail Madad',
                'message': 'Your account has been created successfully',
                'type': 'info',
                'timestamp': '2025-12-27T10:00:00Z',
                'read': False,
                'priority': 'low'
            }
        ]
        
        # Role-specific notifications
        if role == 'staff':
            notifications.append({
                'id': 2,
                'title': 'New Complaint Assigned',
                'message': 'You have been assigned a new complaint to review',
                'type': 'task',
                'timestamp': '2025-12-27T11:00:00Z',
                'read': False,
                'priority': 'medium'
            })
        elif role == 'admin':
            notifications.append({
                'id': 3,
                'title': 'System Update',
                'message': 'Dashboard analytics have been updated',
                'type': 'update',
                'timestamp': '2025-12-27T12:00:00Z',
                'read': False,
                'priority': 'high'
            })
        
        return Response(notifications, status=200)
        
    except Exception as e:
        logger.error(f"Error fetching notifications: {str(e)}")
        return Response({'error': str(e)}, status=500)
