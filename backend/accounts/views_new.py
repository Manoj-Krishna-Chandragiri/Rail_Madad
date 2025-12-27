"""
Updated views for role-based authentication and authorization
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from firebase_admin import auth as firebase_auth

from .models_new import FirebaseUser, Passenger, Staff, Admin
from .serializers_new import (
    UserProfileSerializer, PassengerSerializer, PassengerCreateSerializer,
    StaffSerializer, StaffCreateSerializer, StaffListSerializer,
    AdminSerializer, AdminCreateSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def get_or_create_user(request):
    """
    Get or create user with role-based profile
    Called after Firebase authentication
    """
    try:
        # Get Firebase ID token from request
        id_token = request.data.get('idToken')
        if not id_token:
            return Response(
                {'error': 'ID token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify Firebase token
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email', '')
        except Exception as e:
            return Response(
                {'error': f'Invalid token: {str(e)}'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get or create FirebaseUser
        user, created = FirebaseUser.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={
                'email': email,
                'user_type': 'passenger'  # Default to passenger
            }
        )
        
        # Update last login
        user.update_last_login()
        
        # Create role-specific profile if doesn't exist
        if user.user_type == 'passenger':
            profile, profile_created = Passenger.objects.get_or_create(
                user=user,
                defaults={
                    'full_name': decoded_token.get('name', ''),
                    'phone_number': decoded_token.get('phone_number', ''),
                }
            )
        elif user.user_type == 'staff':
            profile, profile_created = Staff.objects.get_or_create(
                user=user
            )
        elif user.user_type == 'admin':
            profile, profile_created = Admin.objects.get_or_create(
                user=user
            )
        
        # Return user data
        serializer = UserProfileSerializer(user)
        return Response({
            'user': serializer.data,
            'created': created,
            'message': 'User created successfully' if created else 'User retrieved successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Get authenticated user's profile based on role"""
    try:
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Passenger Views
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def passenger_profile(request):
    """Get or update passenger profile"""
    try:
        user = request.user
        
        # Check if user is passenger
        if user.user_type != 'passenger':
            return Response(
                {'error': 'Access denied. Passenger role required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = user.passenger_profile
        except Passenger.DoesNotExist:
            return Response(
                {'error': 'Passenger profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            serializer = PassengerSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = PassengerSerializer(profile, data=request.data, partial=partial)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Staff Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_list(request):
    """List all staff members (for admin use)"""
    try:
        user = request.user
        
        # Check if user is admin
        if user.user_type != 'admin':
            return Response(
                {'error': 'Access denied. Admin role required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Filter by query parameters
        department = request.GET.get('department')
        status_filter = request.GET.get('status', 'active')
        location = request.GET.get('location')
        
        queryset = Staff.objects.all()
        
        if department:
            queryset = queryset.filter(department=department)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if location:
            queryset = queryset.filter(location=location)
        
        serializer = StaffListSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def staff_profile(request, staff_id=None):
    """Get or update staff profile"""
    try:
        user = request.user
        
        # Determine which profile to access
        if staff_id:
            # Admin accessing staff profile
            if user.user_type != 'admin':
                return Response(
                    {'error': 'Access denied. Admin role required.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            try:
                profile = Staff.objects.get(id=staff_id)
            except Staff.DoesNotExist:
                return Response(
                    {'error': 'Staff profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Staff accessing own profile
            if user.user_type != 'staff':
                return Response(
                    {'error': 'Access denied. Staff role required.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            try:
                profile = user.staff_profile
            except Staff.DoesNotExist:
                return Response(
                    {'error': 'Staff profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        if request.method == 'GET':
            serializer = StaffSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = StaffSerializer(profile, data=request.data, partial=partial)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_staff(request):
    """Create new staff member (admin only)"""
    try:
        user = request.user
        
        # Check if user is admin with staff management permission
        if user.user_type != 'admin':
            return Response(
                {'error': 'Access denied. Admin role required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            admin_profile = user.admin_profile
            if not admin_profile.can_manage_staff:
                return Response(
                    {'error': 'Access denied. Staff management permission required.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Admin.DoesNotExist:
            return Response(
                {'error': 'Admin profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = StaffCreateSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                staff = serializer.save()
                return Response(
                    StaffSerializer(staff).data,
                    status=status.HTTP_201_CREATED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Admin Views
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_profile(request, admin_id=None):
    """Get or update admin profile"""
    try:
        user = request.user
        
        # Check if user is admin
        if user.user_type != 'admin':
            return Response(
                {'error': 'Access denied. Admin role required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Determine which profile to access
        if admin_id:
            # Super admin accessing another admin's profile
            try:
                admin_profile = user.admin_profile
                if admin_profile.admin_level != 'super_admin':
                    return Response(
                        {'error': 'Access denied. Super admin role required.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Admin.DoesNotExist:
                return Response(
                    {'error': 'Admin profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            try:
                profile = Admin.objects.get(id=admin_id)
            except Admin.DoesNotExist:
                return Response(
                    {'error': 'Admin profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Admin accessing own profile
            try:
                profile = user.admin_profile
            except Admin.DoesNotExist:
                return Response(
                    {'error': 'Admin profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        if request.method == 'GET':
            serializer = AdminSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = AdminSerializer(profile, data=request.data, partial=partial)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_admin(request):
    """Create new admin (super admin only)"""
    try:
        user = request.user
        
        # Check if user is super admin
        if user.user_type != 'admin':
            return Response(
                {'error': 'Access denied. Admin role required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            admin_profile = user.admin_profile
            if admin_profile.admin_level != 'super_admin':
                return Response(
                    {'error': 'Access denied. Super admin role required.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Admin.DoesNotExist:
            return Response(
                {'error': 'Admin profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminCreateSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                admin = serializer.save()
                return Response(
                    AdminSerializer(admin).data,
                    status=status.HTTP_201_CREATED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """Delete user and associated profile (super admin only)"""
    try:
        user = request.user
        
        # Check if user is super admin
        if user.user_type != 'admin':
            return Response(
                {'error': 'Access denied. Admin role required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            admin_profile = user.admin_profile
            if not admin_profile.can_manage_users:
                return Response(
                    {'error': 'Access denied. User management permission required.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Admin.DoesNotExist:
            return Response(
                {'error': 'Admin profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get user to delete
        try:
            user_to_delete = FirebaseUser.objects.get(id=user_id)
        except FirebaseUser.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent self-deletion
        if user_to_delete.id == user.id:
            return Response(
                {'error': 'Cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete user (cascade will delete profile)
        with transaction.atomic():
            user_to_delete.delete()
        
        return Response(
            {'message': 'User deleted successfully'},
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
