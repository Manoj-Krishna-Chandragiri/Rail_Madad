"""
Role-based API views for new user models
Add these to your accounts/views.py or create as views_roles.py
"""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models_new_roles import FirebaseUser, Admin, Staff, Passenger
from .serializers_roles import (
    AdminSerializer, StaffSerializer, PassengerSerializer, UserProfileSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get unified user profile with role-specific data
    Replaces old /api/profile endpoint
    """
    try:
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update user profile based on role
    """
    try:
        user = request.user
        role = user.get_role()
        
        if role == 'admin':
            profile = user.admin_profile
            serializer = AdminSerializer(profile, data=request.data, partial=True)
        elif role == 'staff':
            profile = user.staff_profile
            serializer = StaffSerializer(profile, data=request.data, partial=True)
        elif role == 'passenger':
            profile = user.passenger_profile
            serializer = PassengerSerializer(profile, data=request.data, partial=True)
        else:
            return Response(
                {'error': 'User has no role profile'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== ADMIN VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_admins(request):
    """List all admins - Super admin only"""
    try:
        user = request.user
        if not hasattr(user, 'admin_profile') or not user.admin_profile.super_admin:
            return Response(
                {'error': 'Permission denied. Super admin only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        admins = Admin.objects.all()
        serializer = AdminSerializer(admins, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_admin(request):
    """Create new admin - Super admin only"""
    try:
        user = request.user
        if not hasattr(user, 'admin_profile') or not user.admin_profile.super_admin:
            return Response(
                {'error': 'Permission denied. Super admin only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create Firebase user
        email = request.data.get('email')
        firebase_uid = request.data.get('firebase_uid')
        
        firebase_user, created = FirebaseUser.objects.get_or_create(
            email=email,
            defaults={'firebase_uid': firebase_uid}
        )
        
        # Create admin profile
        admin_data = request.data.copy()
        admin_data['user'] = firebase_user.id
        
        serializer = AdminSerializer(data=admin_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== STAFF VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_staff(request):
    """List all staff members with optional filters"""
    try:
        staff = Staff.objects.all()
        
        # Filter by department
        department = request.query_params.get('department')
        if department:
            staff = staff.filter(department__icontains=department)
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            staff = staff.filter(status=status_filter)
        
        # Filter by availability
        available = request.query_params.get('available')
        if available == 'true':
            staff = staff.filter(status='active', active_tickets__lt=10)
        
        serializer = StaffSerializer(staff, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_staff_detail(request, staff_id):
    """Get detailed staff information"""
    try:
        staff = get_object_or_404(Staff, user_id=staff_id)
        serializer = StaffSerializer(staff)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_staff(request):
    """Create new staff member - Admin only"""
    try:
        user = request.user
        if not hasattr(user, 'admin_profile'):
            return Response(
                {'error': 'Permission denied. Admin only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create Firebase user
        email = request.data.get('email')
        firebase_uid = request.data.get('firebase_uid', f'staff_{email}')
        
        firebase_user, created = FirebaseUser.objects.get_or_create(
            email=email,
            defaults={'firebase_uid': firebase_uid}
        )
        
        # Create staff profile
        staff_data = request.data.copy()
        staff_data['user'] = firebase_user.id
        
        serializer = StaffSerializer(data=staff_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_staff(request, staff_id):
    """Update staff member - Admin or self"""
    try:
        staff = get_object_or_404(Staff, user_id=staff_id)
        
        # Check permission: admin or self
        user = request.user
        is_admin = hasattr(user, 'admin_profile')
        is_self = user.id == staff_id
        
        if not (is_admin or is_self):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = StaffSerializer(staff, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_staff(request):
    """Get list of available staff for assignment"""
    try:
        # Get staff with active status and capacity
        available_staff = Staff.objects.filter(
            status='active',
            active_tickets__lt=10
        ).order_by('active_tickets', '-rating')
        
        # Optional: filter by expertise
        expertise = request.query_params.get('expertise')
        if expertise:
            available_staff = available_staff.filter(
                expertise__contains=expertise
            )
        
        # Optional: filter by language
        language = request.query_params.get('language')
        if language:
            available_staff = available_staff.filter(
                languages__contains=language
            )
        
        serializer = StaffSerializer(available_staff, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== PASSENGER VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_passengers(request):
    """List all passengers - Admin only"""
    try:
        user = request.user
        if not hasattr(user, 'admin_profile'):
            return Response(
                {'error': 'Permission denied. Admin only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        passengers = Passenger.objects.all()
        
        # Optional filters
        city = request.query_params.get('city')
        if city:
            passengers = passengers.filter(city__icontains=city)
        
        serializer = PassengerSerializer(passengers, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_passenger_detail(request, passenger_id):
    """Get passenger details - Admin or self"""
    try:
        passenger = get_object_or_404(Passenger, user_id=passenger_id)
        
        # Check permission
        user = request.user
        is_admin = hasattr(user, 'admin_profile')
        is_self = user.id == passenger_id
        
        if not (is_admin or is_self):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PassengerSerializer(passenger)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_404_NOT_FOUND
        )


# ==================== STATISTICS VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """Get dashboard statistics - Admin only"""
    try:
        user = request.user
        if not hasattr(user, 'admin_profile'):
            return Response(
                {'error': 'Permission denied. Admin only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = {
            'total_admins': Admin.objects.count(),
            'total_staff': Staff.objects.count(),
            'active_staff': Staff.objects.filter(status='active').count(),
            'total_passengers': Passenger.objects.count(),
            'staff_by_department': {},
            'staff_by_status': {
                'active': Staff.objects.filter(status='active').count(),
                'inactive': Staff.objects.filter(status='inactive').count(),
                'on_leave': Staff.objects.filter(status='on_leave').count(),
            }
        }
        
        # Staff by department
        from django.db.models import Count
        dept_counts = Staff.objects.values('department').annotate(count=Count('user_id'))
        for item in dept_counts:
            stats['staff_by_department'][item['department']] = item['count']
        
        return Response(stats)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
