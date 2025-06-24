from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Complaint, Staff
from .serializers import ComplaintSerializer, StaffSerializer
import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Feedback
from .serializers import FeedbackSerializer
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
 
@api_view(["POST"])
def file_complaint(request):
    try:
        photo = request.FILES.get('photos')
        data = request.data.copy()
 
        # Handle photo upload
        if photo:
            filename = os.path.basename(photo.name)
            save_path = os.path.join('backend', 'media', 'complaints', filename)
            full_path = os.path.join(settings.BASE_DIR, 'media', 'complaints', filename)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'wb+') as destination:
                for chunk in photo.chunks():
                    destination.write(chunk)
            data['photos'] = save_path.replace('\\', '/')

        # Set default priority if not provided
        if 'priority' not in data or not data['priority']:
            data['priority'] = 'Medium'

        # Handle user authentication
        user_id = None
        if hasattr(request, 'is_authenticated') and request.is_authenticated:
            if hasattr(request, 'user_id') and request.user_id is not None:
                user_id = request.user_id
            elif hasattr(request, 'user') and request.user and hasattr(request.user, 'id'):
                user_id = request.user.id
            elif hasattr(request, 'firebase_uid') and request.firebase_uid:
                from accounts.views import get_or_create_user
                user, created = get_or_create_user(request)
                if user:
                    user_id = user.id
        
        # Set user_id in data if available
        if user_id:
            data['user'] = user_id
        
        # Validate required fields
        required_fields = ['type', 'description', 'train_number', 'pnr_number', 'location', 'date_of_incident']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return JsonResponse({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=400)
        
        serializer = ComplaintSerializer(data=data)
        if serializer.is_valid():
            complaint = serializer.save()
            return JsonResponse({
                "message": "Complaint filed successfully", 
                "complaint_id": complaint.id
            }, status=201)
        
        return JsonResponse({
            "error": "Validation failed",
            "details": serializer.errors
        }, status=400)
 
    except Exception as e:
        return JsonResponse({
            "error": f"Server error: {str(e)}"
        }, status=500)
 
@api_view(['GET'])
def user_complaints(request):
    """
    Get complaints for the currently authenticated user.
    For admin/staff users, this returns all complaints.
    For regular users, this returns only their own complaints.
    """
    try:
        # Check authentication
        if not hasattr(request, 'is_authenticated') or not request.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Determine if we need to filter by user
        if request.is_admin or request.is_staff:
            # Admin and staff can see all complaints
            complaints = Complaint.objects.all().order_by('-created_at')
        else:
            # Regular users see only their own complaints
            user_id = None
            
            # First try to get user_id from request attribute
            if hasattr(request, 'user_id') and request.user_id is not None:
                user_id = request.user_id
            # Then try to get from user object
            elif hasattr(request, 'user') and request.user and hasattr(request.user, 'id'):
                user_id = request.user.id
            
            if user_id:
                complaints = Complaint.objects.filter(user=user_id).order_by('-created_at')
            else:
                # If we can't determine user_id, return empty result
                return Response({'error': 'User ID not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
 
@api_view(['GET', 'PUT'])
def complaint_detail(request, complaint_id):
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        
        # Check if user has permission to view this complaint
        if not (request.is_admin or request.is_staff):
            # Regular users can only see their own complaints
            if hasattr(request, 'user_id') and complaint.user_id != request.user_id:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
 
    if request.method == 'GET':
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)
 
    elif request.method == 'PUT':
        # Only admin/staff can update complaints
        if not (request.is_admin or request.is_staff):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        # If status is being changed to closed, record resolution details
        if 'status' in request.data and request.data['status'].lower() == 'closed':
            request.data['resolved_at'] = timezone.now()
            if hasattr(request, 'firebase_email'):
                request.data['resolved_by'] = request.firebase_email
        
        serializer = ComplaintSerializer(complaint, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
 
@api_view(['GET'])
def complaint_list(request):
    complaints = list(Complaint.objects.values())
    return JsonResponse(complaints, safe=False)
 
 
@api_view(['GET'])
def admin_profile(request):
    try:
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_staff:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
 
        token, _ = Token.objects.get_or_create(user=user)
 
        data = {
            'full_name': f"{user.first_name} {user.last_name}".strip() or "Admin User",
            'email': user.email,
            'phone_number': getattr(user, 'phone_number', ''),
            'gender': getattr(user, 'gender', ''),
            'address': getattr(user, 'address', ''),
            'token': token.key
        }
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['POST'])
def submit_feedback(request):
    serializer = FeedbackSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Feedback submitted successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'POST'])
def feedback_view(request):
    if request.method == 'POST':
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Feedback submitted successfully'}, status=201)
        return Response(serializer.errors, status=400)
 
    elif request.method == 'GET':
        complaint_id = request.GET.get('complaint_id')
        if not complaint_id:
            return Response({'error': 'complaint_id parameter is required'}, status=400)
        feedbacks = Feedback.objects.filter(complaint=complaint_id).order_by('-created_at')
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data, status=200)

@api_view(['GET', 'POST'])
def staff_list(request):
    if request.method == 'GET':
        staffs = Staff.objects.all()
        serializer = StaffSerializer(staffs, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        print("Received staff data:", request.data)
        serializer = StaffSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            staff = serializer.save()
            # Return the serialized data with context for absolute URLs
            response_serializer = StaffSerializer(staff, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def staff_detail(request, pk):
    try:
        staff = Staff.objects.get(pk=pk)
    except Staff.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StaffSerializer(staff, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = StaffSerializer(staff, data=request.data, context={'request': request})
        if serializer.is_valid():
            updated_staff = serializer.save()
            # Return updated data with context
            response_serializer = StaffSerializer(updated_staff, context={'request': request})
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        staff.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Admin Complaints Management API Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_all_complaints(request):
    """
    Admin endpoint to get all complaints
    """
    user = request.user
    
    # Ensure the user is an admin
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get query parameters for filtering
    status_filter = request.query_params.get('status')
    severity_filter = request.query_params.get('severity')
    type_filter = request.query_params.get('type')
    
    # Start with all complaints
    complaints = Complaint.objects.all()
    
    # Apply filters if provided
    if status_filter:
        complaints = complaints.filter(status=status_filter)
    
    if severity_filter:
        complaints = complaints.filter(severity=severity_filter)
        
    if type_filter:
        complaints = complaints.filter(type=type_filter)
    
    # Order by most recent first
    complaints = complaints.order_by('-created_at')
    
    # Serialize and return the data
    serializer = ComplaintSerializer(complaints, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_complaint_status(request, complaint_id):
    """
    Admin endpoint to update a complaint's status
    """
    user = request.user
    
    # Ensure the user is an admin
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    complaint = get_object_or_404(Complaint, id=complaint_id)
    
    # Check if status is provided
    new_status = request.data.get('status')
    if not new_status:
        return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate status value
    valid_statuses = ['open', 'in_progress', 'closed', 'pending']
    if new_status not in valid_statuses:
        return Response({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Update the status
    complaint.status = new_status
    
    # Add resolution details if provided
    if new_status == 'closed':
        resolution_notes = request.data.get('resolution_notes')
        if resolution_notes:
            complaint.resolution_notes = resolution_notes
        
        # Record admin who closed the complaint
        complaint.resolved_by = user.username
    
    complaint.save()
    
    # Return updated complaint
    serializer = ComplaintSerializer(complaint)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_staff_list(request):
    """
    List all staff or create a new staff member
    """
    user = request.user
    
    # Ensure the user is an admin
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        staff = Staff.objects.all()
        serializer = StaffSerializer(staff, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = StaffSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            staff = serializer.save()
            response_serializer = StaffSerializer(staff, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_staff_detail(request, pk):
    """
    Retrieve, update or delete a staff member
    """
    user = request.user
    
    # Ensure the user is an admin
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    staff = get_object_or_404(Staff, pk=pk)
    
    if request.method == 'GET':
        serializer = StaffSerializer(staff, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = StaffSerializer(staff, data=request.data, context={'request': request})
        if serializer.is_valid():
            updated_staff = serializer.save()
            response_serializer = StaffSerializer(updated_staff, context={'request': request})
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        staff.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Admin Dashboard Statistics API View
@api_view(['GET'])
def admin_dashboard_stats(request):
    """
    Get dashboard statistics for admin
    """
    # Check authentication using custom middleware attributes
    if not hasattr(request, 'is_authenticated') or not request.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not (request.is_admin or request.is_staff):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from django.db.models import Count
        from datetime import timedelta
        import logging
        
        logger = logging.getLogger(__name__)
        logger.info(f"Admin dashboard stats requested by user: {request.firebase_email}")
        
        # Basic complaint counts
        total_complaints = Complaint.objects.count()
        open_complaints = Complaint.objects.filter(status='Open').count()
        in_progress_complaints = Complaint.objects.filter(status='In Progress').count()
        closed_complaints = Complaint.objects.filter(status='Closed').count()
        
        # Today's statistics
        today = timezone.now().date()
        today_complaints = Complaint.objects.filter(created_at__date=today).count()
        today_resolved = Complaint.objects.filter(
            status='Closed', 
            resolved_at__date=today
        ).count()
        
        # Staff statistics - fetch from Staff model and User model
        from .models import Staff
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Get staff count from Staff model
        total_staff_from_staff_model = Staff.objects.count()
        active_staff_from_staff_model = Staff.objects.filter(status='active').count()
        
        # Get staff count from User model (users with staff or admin role)
        total_staff_from_users = User.objects.filter(
            user_type__in=['admin', 'staff']
        ).count()
        active_staff_from_users = User.objects.filter(
            user_type__in=['admin', 'staff'],
            is_active=True
        ).count()
        
        # Use the higher count between both models
        total_staff = max(total_staff_from_staff_model, total_staff_from_users, 1)  # Ensure at least 1
        active_staff = max(active_staff_from_staff_model, active_staff_from_users, 1)  # Ensure at least 1
        
        # Resolution statistics
        resolution_rate = round((closed_complaints / total_complaints * 100), 2) if total_complaints > 0 else 0
        
        # Calculate average resolution time
        resolved_complaints = Complaint.objects.filter(
            status='Closed',
            resolved_at__isnull=False,
            created_at__isnull=False
        )
        
        if resolved_complaints.exists():
            total_resolution_time = 0
            count = 0
            for complaint in resolved_complaints:
                if complaint.resolved_at and complaint.created_at:
                    diff = complaint.resolved_at - complaint.created_at
                    total_resolution_time += diff.total_seconds()
                    count += 1
            
            if count > 0:
                avg_seconds = total_resolution_time / count
                avg_hours = avg_seconds / 3600
                average_resolution_time = f"{avg_hours:.1f}h"
            else:
                average_resolution_time = "0h"
        else:
            average_resolution_time = "0h"
        
        # Pending escalations (complaints open for more than 48 hours)
        forty_eight_hours_ago = timezone.now() - timedelta(hours=48)
        pending_escalations = Complaint.objects.filter(
            status__in=['Open', 'In Progress'],
            created_at__lt=forty_eight_hours_ago
        ).count()
        
        # Generate complaint trends data for the last 30 days
        complaint_trends = []
        for i in range(30):
            date = today - timedelta(days=29-i)
            day_open = Complaint.objects.filter(
                created_at__date=date,
                status='Open'
            ).count()
            day_progress = Complaint.objects.filter(
                created_at__date=date,
                status='In Progress'
            ).count()
            day_closed = Complaint.objects.filter(
                resolved_at__date=date,
                status='Closed'
            ).count()
            
            complaint_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': day_open,
                'in_progress': day_progress,
                'closed': day_closed
            })
        
        response_data = {
            'totalComplaints': total_complaints,
            'openComplaints': open_complaints,
            'inProgressComplaints': in_progress_complaints,
            'closedComplaints': closed_complaints,
            'todayComplaints': today_complaints,
            'todayResolved': today_resolved,
            'totalStaff': total_staff,
            'activeStaff': active_staff,
            'resolutionRate': resolution_rate,
            'averageResolutionTime': average_resolution_time,
            'pendingEscalations': pending_escalations,
            'complaintTrends': complaint_trends
        }
        
        logger.info(f"Dashboard stats response: {response_data}")
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error in admin_dashboard_stats: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Additional admin utility endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_complaint_types(request):
    """
    Get all unique complaint types for filtering
    """
    user = request.user
    
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    complaint_types = Complaint.objects.values_list('type', flat=True).distinct().order_by('type')
    return Response(list(complaint_types))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recent_activity(request):
    """
    Get recent complaint activity for admin dashboard
    """
    user = request.user
    
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get recent complaints (last 24 hours)
    from django.utils import timezone
    from datetime import timedelta
    
    recent_time = timezone.now() - timedelta(hours=24)
    
    recent_complaints = Complaint.objects.filter(
        created_at__gte=recent_time
    ).order_by('-created_at')[:10]
    
    recent_resolved = Complaint.objects.filter(
        resolved_at__gte=recent_time,
        status='Closed'
    ).order_by('-resolved_at')[:10]
    
    activity_data = []
    
    # Add recent complaints
    for complaint in recent_complaints:
        activity_data.append({
            'type': 'new_complaint',
            'complaint_id': complaint.id,
            'description': complaint.description[:100] + '...' if len(complaint.description) > 100 else complaint.description,
            'severity': complaint.severity,
            'timestamp': complaint.created_at,
            'status': complaint.status
        })
    
    # Add recent resolutions
    for complaint in recent_resolved:
        activity_data.append({
            'type': 'resolved_complaint',
            'complaint_id': complaint.id,
            'description': complaint.description[:100] + '...' if len(complaint.description) > 100 else complaint.description,
            'resolved_by': complaint.resolved_by,
            'timestamp': complaint.resolved_at,
            'status': complaint.status
        })
    
    # Sort by timestamp
    activity_data.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return Response(activity_data[:15])  # Return top 15 activities

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_performance_metrics(request):
    """
    Get detailed performance metrics for admin
    """
    user = request.user
    
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Time periods
    now = timezone.now()
    today = now.date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Daily stats for the last 30 days
    daily_stats = []
    for i in range(30):
        date = today - timedelta(days=i)
        day_complaints = Complaint.objects.filter(created_at__date=date).count()
        day_resolved = Complaint.objects.filter(resolved_at__date=date).count()
        daily_stats.append({
            'date': date.strftime('%Y-%m-%d'),
            'new_complaints': day_complaints,
            'resolved_complaints': day_resolved
        })
    
    # Staff performance
    staff_performance = []
    for staff in Staff.objects.filter(status='active'):
        assigned_complaints = Complaint.objects.filter(staff=staff.name).count()
        resolved_complaints = Complaint.objects.filter(
            staff=staff.name, 
            status='Closed'
        ).count()
        
        resolution_rate = 0
        if assigned_complaints > 0:
            resolution_rate = round((resolved_complaints / assigned_complaints) * 100, 2)
        
        staff_performance.append({
            'name': staff.name,
            'id': staff.id,
            'assigned_complaints': assigned_complaints,
            'resolved_complaints': resolved_complaints,
            'resolution_rate': resolution_rate,
            'department': staff.department,
            'rating': staff.rating
        })
    
    # Sort by resolution rate
    staff_performance.sort(key=lambda x: x['resolution_rate'], reverse=True)
    
    # Department performance
    departments = Staff.objects.values_list('department', flat=True).distinct()
    department_stats = []
    
    for dept in departments:
        dept_staff = Staff.objects.filter(department=dept)
        total_staff = dept_staff.count()
        active_staff = dept_staff.filter(status='active').count()
        
        # Get complaints handled by this department
        dept_complaints = 0
        dept_resolved = 0
        for staff in dept_staff:
            dept_complaints += Complaint.objects.filter(staff=staff.name).count()
            dept_resolved += Complaint.objects.filter(staff=staff.name, status='Closed').count()
        
        dept_resolution_rate = 0
        if dept_complaints > 0:
            dept_resolution_rate = round((dept_resolved / dept_complaints) * 100, 2)
        
        department_stats.append({
            'department': dept,
            'total_staff': total_staff,
            'active_staff': active_staff,
            'complaints_handled': dept_complaints,
            'complaints_resolved': dept_resolved,
            'resolution_rate': dept_resolution_rate
        })
    
    return Response({
        'daily_stats': daily_stats,
        'staff_performance': staff_performance[:10],  # Top 10 performers
        'department_stats': department_stats
    })

# Add a simple admin settings endpoint
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_settings(request):
    """
    Get or update admin settings
    """
    user = request.user
    
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # Return current system settings
        settings_data = {
            'auto_assignment': True,
            'email_notifications': True,
            'escalation_timeout': 48,  # hours
            'max_resolution_time': 72,  # hours
            'notification_frequency': 'immediate',
            'backup_frequency': 'daily',
            'system_maintenance_mode': False,
            'max_file_upload_size': 10,  # MB
            'allowed_file_types': ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
            'complaint_categories': [
                'Technical Issues',
                'Service Quality',
                'Staff Behavior', 
                'Cleanliness',
                'Security',
                'Infrastructure',
                'Accessibility',
                'Ticketing',
                'Food Services',
                'Other'
            ]
        }
        return Response(settings_data)
    
    elif request.method == 'POST':
        # In a real application, you would save these settings to a database
        # For now, just return success
        return Response({'message': 'Settings updated successfully'})

@api_view(['GET'])
def admin_complaint_trends(request):
    """
    Get complaint trends data for charts
    """
    # Check authentication using custom middleware attributes
    if not hasattr(request, 'is_authenticated') or not request.is_authenticated:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not (request.is_admin or request.is_staff):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from datetime import timedelta
        
        # Get date range from query params (default to 30 days)
        days = int(request.GET.get('days', 30))
        today = timezone.now().date()
        
        # Generate trends data
        trends_data = []
        for i in range(days):
            date = today - timedelta(days=days-1-i)
            
            # Count complaints created on this date by status
            day_complaints = Complaint.objects.filter(created_at__date=date)
            day_resolved = Complaint.objects.filter(resolved_at__date=date, status='Closed')
            
            open_count = day_complaints.filter(status='Open').count()
            progress_count = day_complaints.filter(status='In Progress').count()
            closed_count = day_resolved.count()
            
            trends_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': open_count,
                'in_progress': progress_count,
                'closed': closed_count,
                'total_created': day_complaints.count()
            })
        
        # Also get complaint type distribution
        type_distribution = list(
            Complaint.objects.values('type')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        # Get status distribution over time
        status_distribution = {
            'open': Complaint.objects.filter(status='Open').count(),
            'in_progress': Complaint.objects.filter(status='In Progress').count(),
            'closed': Complaint.objects.filter(status='Closed').count()
        }
        
        return Response({
            'trends': trends_data,
            'type_distribution': type_distribution,
            'status_distribution': status_distribution,
            'total_complaints': Complaint.objects.count()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)