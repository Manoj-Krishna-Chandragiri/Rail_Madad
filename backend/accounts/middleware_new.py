"""
Updated middleware for role-based authentication
Attaches user profile to request based on role
"""

from django.utils.deprecation import MiddlewareMixin
from firebase_admin import auth as firebase_auth
from .models_new import FirebaseUser, Passenger, Staff, Admin


class FirebaseAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to authenticate Firebase users and attach role-based profile
    """
    
    def process_request(self, request):
        """Process incoming request to authenticate user"""
        # Get authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            request.user = None
            request.user_profile = None
            return None
        
        # Extract token
        id_token = auth_header.split('Bearer ')[1]
        
        try:
            # Verify Firebase token
            decoded_token = firebase_auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']
            
            # Get user from database
            try:
                user = FirebaseUser.objects.get(firebase_uid=firebase_uid)
                
                # Attach user to request
                request.user = user
                request.firebase_token = decoded_token
                
                # Attach role-specific profile
                if user.user_type == 'passenger':
                    try:
                        request.user_profile = user.passenger_profile
                    except Passenger.DoesNotExist:
                        request.user_profile = None
                
                elif user.user_type == 'staff':
                    try:
                        request.user_profile = user.staff_profile
                    except Staff.DoesNotExist:
                        request.user_profile = None
                
                elif user.user_type == 'admin':
                    try:
                        request.user_profile = user.admin_profile
                    except Admin.DoesNotExist:
                        request.user_profile = None
                else:
                    request.user_profile = None
                
            except FirebaseUser.DoesNotExist:
                request.user = None
                request.user_profile = None
        
        except Exception as e:
            # Invalid or expired token
            request.user = None
            request.user_profile = None
            print(f"Authentication error: {str(e)}")
        
        return None


class RoleBasedPermissionMiddleware(MiddlewareMixin):
    """
    Middleware to check role-based permissions for specific endpoints
    """
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """Check permissions before view is called"""
        
        # Skip for unauthenticated requests
        if not hasattr(request, 'user') or not request.user:
            return None
        
        # Get path
        path = request.path
        
        # Admin-only endpoints
        admin_endpoints = [
            '/api/staff/',
            '/api/staff/create/',
            '/api/admin/create/',
            '/api/users/',
        ]
        
        for endpoint in admin_endpoints:
            if path.startswith(endpoint):
                if request.user.user_type != 'admin':
                    from django.http import JsonResponse
                    return JsonResponse(
                        {'error': 'Access denied. Admin role required.'},
                        status=403
                    )
        
        # Staff-only endpoints
        staff_endpoints = [
            '/api/complaints/staff/',
        ]
        
        for endpoint in staff_endpoints:
            if path.startswith(endpoint):
                if request.user.user_type not in ['staff', 'admin']:
                    from django.http import JsonResponse
                    return JsonResponse(
                        {'error': 'Access denied. Staff or Admin role required.'},
                        status=403
                    )
        
        return None


class UserProfileMiddleware(MiddlewareMixin):
    """
    Middleware to ensure user profile exists for authenticated users
    Creates profile if missing
    """
    
    def process_request(self, request):
        """Create profile if missing"""
        
        if not hasattr(request, 'user') or not request.user:
            return None
        
        user = request.user
        
        # Check and create missing profiles
        if user.user_type == 'passenger':
            if not hasattr(user, 'passenger_profile'):
                Passenger.objects.get_or_create(
                    user=user,
                    defaults={'full_name': user.email.split('@')[0]}
                )
        
        elif user.user_type == 'staff':
            if not hasattr(user, 'staff_profile'):
                # Generate employee ID
                last_staff = Staff.objects.order_by('-employee_id').first()
                if last_staff and last_staff.employee_id.startswith('EMP'):
                    last_num = int(last_staff.employee_id[3:])
                    employee_id = f"EMP{last_num + 1:04d}"
                else:
                    employee_id = "EMP0001"
                
                Staff.objects.get_or_create(
                    user=user,
                    defaults={
                        'employee_id': employee_id,
                        'full_name': user.email.split('@')[0]
                    }
                )
        
        elif user.user_type == 'admin':
            if not hasattr(user, 'admin_profile'):
                Admin.objects.get_or_create(
                    user=user,
                    defaults={'full_name': user.email.split('@')[0]}
                )
        
        return None
