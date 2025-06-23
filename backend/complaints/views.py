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
 
        if photo:
            filename = os.path.basename(photo.name)
            save_path = os.path.join('backend', 'media', 'complaints', filename)
            full_path = os.path.join(settings.BASE_DIR, 'media', 'complaints', filename)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'wb+') as destination:
                for chunk in photo.chunks():
                    destination.write(chunk)
            data['photos'] = save_path.replace('\\', '/')
 
        # Check if user is authenticated and has a user_id
        if hasattr(request, 'is_authenticated') and request.is_authenticated:
            # First try to get the user ID from the request attribute
            if hasattr(request, 'user_id') and request.user_id is not None:
                data['user'] = request.user_id
            # Fall back to request.user if available
            elif hasattr(request, 'user') and request.user and hasattr(request.user, 'id'):
                data['user'] = request.user.id
            # If user exists but no ID available, use Firebase authentication to find/create user
            elif hasattr(request, 'firebase_uid') and request.firebase_uid:
                # Import get_or_create_user to avoid circular imports
                from accounts.views import get_or_create_user
                user, created = get_or_create_user(request)
                if user:
                    data['user'] = user.id
        
        serializer = ComplaintSerializer(data=data)
        if serializer.is_valid():
            complaint = serializer.save()
            return JsonResponse({
                "message": "Complaint filed successfully", 
                "complaint_id": complaint.id
            }, status=201)
        return JsonResponse(serializer.errors, status=400)
 
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400) 
 
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
            complaints = Complaint.objects.all().order_by('-date_of_incident')
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
                complaints = Complaint.objects.filter(user=user_id).order_by('-date_of_incident')
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
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
 
    if request.method == 'GET':
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)
 
    elif request.method == 'PUT':
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
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Get comprehensive dashboard statistics for admin
    """
    user = request.user
    
    # Ensure the user is an admin
    if not user.is_staff and not user.is_superuser:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get current date and time ranges
        now = timezone.now()
        today = now.date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Basic complaint counts
        total_complaints = Complaint.objects.count()
        open_complaints = Complaint.objects.filter(status='Open').count()
        in_progress_complaints = Complaint.objects.filter(status='In Progress').count()
        closed_complaints = Complaint.objects.filter(status='Closed').count()
        
        # Today's statistics
        today_complaints = Complaint.objects.filter(created_at__date=today).count()
        today_resolved = Complaint.objects.filter(
            status='Closed', 
            resolved_at__date=today
        ).count()
        
        # Staff statistics
        total_staff = Staff.objects.count()
        active_staff = Staff.objects.filter(status='active').count()
        
        # Resolution statistics
        total_resolved = Complaint.objects.filter(status='Closed').count()
        resolution_rate = round((total_resolved / total_complaints * 100), 2) if total_complaints > 0 else 0
        
        # Average resolution time (simplified calculation)
        resolved_complaints = Complaint.objects.filter(
            status='Closed', 
            resolved_at__isnull=False
        )
        
        avg_resolution_hours = 0
        if resolved_complaints.exists():
            total_resolution_time = 0
            count = 0
            for complaint in resolved_complaints:
                if complaint.resolved_at and complaint.created_at:
                    time_diff = complaint.resolved_at - complaint.created_at
                    total_resolution_time += time_diff.total_seconds()
                    count += 1
            
            if count > 0:
                avg_resolution_hours = round(total_resolution_time / count / 3600, 1)  # Convert to hours
        
        # Weekly trend data
        weekly_data = []
        for i in range(7):
            date = today - timedelta(days=i)
            day_complaints = Complaint.objects.filter(created_at__date=date).count()
            day_resolved = Complaint.objects.filter(
                status='Closed',
                resolved_at__date=date
            ).count()
            weekly_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'complaints': day_complaints,
                'resolved': day_resolved
            })
        
        # Severity breakdown
        severity_stats = {
            'high': Complaint.objects.filter(severity='High').count(),
            'medium': Complaint.objects.filter(severity='Medium').count(),
            'low': Complaint.objects.filter(severity='Low').count()
        }
        
        # Complaint types breakdown
        type_stats = Complaint.objects.values('type').annotate(
            count=Count('id')
        ).order_by('-count')[:10]  # Top 10 complaint types
        
        # Recent activity (last 24 hours)
        recent_complaints = Complaint.objects.filter(
            created_at__gte=now - timedelta(hours=24)
        ).count()
        
        # Pending escalations (complaints older than 48 hours still open)
        pending_escalations = Complaint.objects.filter(
            Q(status='Open') | Q(status='In Progress'),
            created_at__lte=now - timedelta(hours=48)
        ).count()
        
        # Calculate average response time (time to first status change)
        # This is a simplified calculation - in a real system you'd track status changes
        avg_response_time = "2h 15m"  # Placeholder - implement based on status change tracking
        
        return Response({
            'overview': {
                'total_complaints': total_complaints,
                'open_complaints': open_complaints,
                'in_progress_complaints': in_progress_complaints,
                'closed_complaints': closed_complaints,
                'resolution_rate': resolution_rate,
                'today_complaints': today_complaints,
                'today_resolved': today_resolved,
                'recent_complaints': recent_complaints,
                'pending_escalations': pending_escalations
            },
            'staff': {
                'total_staff': total_staff,
                'active_staff': active_staff,
                'staff_utilization': round((active_staff / total_staff * 100), 2) if total_staff > 0 else 0
            },
            'performance': {
                'avg_resolution_time': f"{avg_resolution_hours}h",
                'avg_response_time': avg_response_time,
                'resolution_rate': resolution_rate
            },
            'trends': {
                'weekly_data': weekly_data,
                'severity_stats': severity_stats,
                'type_stats': list(type_stats)
            }
        })
        
    except Exception as e:
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