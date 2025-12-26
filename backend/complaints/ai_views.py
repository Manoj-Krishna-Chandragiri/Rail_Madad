"""
AI-powered views for complaint categorization and staff assignment
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from .models import Complaint, Staff
from ai_models.complaint_categorizer import complaint_categorizer
import logging
import json

logger = logging.getLogger(__name__)

@api_view(['POST'])
def categorize_complaint(request):
    """
    Automatically categorize a complaint based on its description
    """
    try:
        complaint_text = request.data.get('description', '')
        location = request.data.get('location', '')
        
        if not complaint_text:
            return Response({
                'error': 'Complaint description is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get AI prediction
        prediction = complaint_categorizer.predict_category(complaint_text)
        
        # Get staff assignment
        staff_assignment = complaint_categorizer.get_staff_assignment(
            prediction['category'], 
            location
        )
        
        return Response({
            'prediction': prediction,
            'staff_assignment': staff_assignment,
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in categorize_complaint: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def create_smart_complaint(request):
    """
    Create a complaint with automatic categorization and staff assignment
    """
    try:
        # Get complaint data
        data = request.data
        complaint_text = data.get('description', '')
        
        if not complaint_text:
            return Response({
                'error': 'Complaint description is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get AI categorization
        prediction = complaint_categorizer.predict_category(complaint_text)
        category = prediction['category']
        confidence = prediction['confidence']
        
        # Get staff assignment
        staff_assignment = complaint_categorizer.get_staff_assignment(
            category, 
            data.get('location', '')
        )
        
        # Create complaint with AI-generated data
        complaint = Complaint.objects.create(
            type=prediction['category_info'].get('name', category.replace('_', ' ').title()),
            description=complaint_text,
            location=data.get('location', ''),
            train_number=data.get('train_number', ''),
            pnr_number=data.get('pnr_number', ''),
            date_of_incident=data.get('date_of_incident'),
            priority=staff_assignment.get('priority', 'Medium'),
            staff=staff_assignment.get('staff_name', 'Unassigned'),
            photos=data.get('photos', ''),
            user_id=data.get('user_id'),
            resolution_notes=f"Auto-categorized as '{category}' with {confidence:.2%} confidence. Assigned to {staff_assignment.get('staff_role', 'customer_service')} department."
        )
        
        # Store AI metadata
        ai_metadata = {
            'ai_category': category,
            'confidence': confidence,
            'top_predictions': prediction.get('top_predictions', []),
            'assigned_staff_id': staff_assignment.get('staff_id'),
            'expected_resolution': staff_assignment.get('expected_resolution'),
            'auto_assigned': True,
            'categorization_timestamp': timezone.now().isoformat()
        }
        
        return Response({
            'complaint_id': complaint.id,
            'complaint': {
                'id': complaint.id,
                'type': complaint.type,
                'description': complaint.description,
                'status': complaint.status,
                'priority': complaint.priority,
                'staff': complaint.staff,
                'created_at': complaint.created_at
            },
            'ai_analysis': ai_metadata,
            'message': f'Complaint automatically categorized as "{category}" and assigned to {staff_assignment.get("staff_name", "customer service")}'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error in create_smart_complaint: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def staff_dashboard(request):
    """
    Get dashboard data for staff members
    """
    try:
        staff_id = request.query_params.get('staff_id')
        staff_email = request.query_params.get('staff_email')
        
        # Find staff member
        staff = None
        if staff_id:
            staff = get_object_or_404(Staff, id=staff_id)
        elif staff_email:
            staff = get_object_or_404(Staff, email=staff_email)
        else:
            return Response({
                'error': 'staff_id or staff_email parameter required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get assigned complaints
        assigned_complaints = Complaint.objects.filter(
            staff=staff.name,
            status__in=['Open', 'In Progress']
        ).order_by('-created_at')
        
        # Get completed complaints for performance metrics
        completed_complaints = Complaint.objects.filter(
            resolved_by=staff.name,
            status='Closed'
        ).order_by('-resolved_at')[:10]
        
        # Calculate performance metrics
        total_assigned = Complaint.objects.filter(staff=staff.name).count()
        total_resolved = completed_complaints.count()
        resolution_rate = (total_resolved / total_assigned * 100) if total_assigned > 0 else 0
        
        # Get complaints by category for this staff
        category_stats = Complaint.objects.filter(
            staff=staff.name
        ).values('type').annotate(count=Count('type')).order_by('-count')
        
        # Prepare complaint data
        complaints_data = []
        for complaint in assigned_complaints:
            complaints_data.append({
                'id': complaint.id,
                'type': complaint.type,
                'description': complaint.description[:200] + '...' if len(complaint.description) > 200 else complaint.description,
                'priority': complaint.priority,
                'status': complaint.status,
                'location': complaint.location,
                'train_number': complaint.train_number,
                'pnr_number': complaint.pnr_number,
                'created_at': complaint.created_at,
                'date_of_incident': complaint.date_of_incident
            })
        
        completed_data = []
        for complaint in completed_complaints:
            completed_data.append({
                'id': complaint.id,
                'type': complaint.type,
                'description': complaint.description[:100] + '...' if len(complaint.description) > 100 else complaint.description,
                'resolved_at': complaint.resolved_at,
                'resolution_notes': complaint.resolution_notes
            })
        
        return Response({
            'staff_info': {
                'id': staff.id,
                'name': staff.name,
                'email': staff.email,
                'role': staff.role,
                'department': staff.department,
                'rating': staff.rating,
                'active_tickets': staff.active_tickets,
                'status': staff.status
            },
            'performance_metrics': {
                'total_assigned': total_assigned,
                'total_resolved': total_resolved,
                'resolution_rate': round(resolution_rate, 2),
                'active_complaints': len(complaints_data)
            },
            'assigned_complaints': complaints_data,
            'recent_completed': completed_data,
            'category_statistics': list(category_stats),
            'last_updated': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in staff_dashboard: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def resolve_complaint(request, complaint_id):
    """
    Mark a complaint as resolved by staff
    """
    try:
        complaint = get_object_or_404(Complaint, id=complaint_id)
        staff_name = request.data.get('staff_name')
        resolution_notes = request.data.get('resolution_notes', '')
        
        if not staff_name:
            return Response({
                'error': 'staff_name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update complaint
        complaint.status = 'Closed'
        complaint.resolved_by = staff_name
        complaint.resolved_at = timezone.now()
        complaint.resolution_notes = resolution_notes
        complaint.save()
        
        # Update staff active tickets count
        try:
            staff = Staff.objects.get(name=staff_name)
            if staff.active_tickets > 0:
                staff.active_tickets -= 1
                staff.save()
        except Staff.DoesNotExist:
            pass
        
        return Response({
            'message': 'Complaint resolved successfully',
            'complaint_id': complaint.id,
            'resolved_at': complaint.resolved_at,
            'resolved_by': complaint.resolved_by
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in resolve_complaint: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def train_ai_model(request):
    """
    Manually trigger AI model training
    """
    try:
        force_retrain = request.data.get('force_retrain', False)
        
        # Train the model
        training_result = complaint_categorizer.train_model(retrain=force_retrain)
        
        return Response({
            'training_result': training_result,
            'model_info': complaint_categorizer.get_model_info(),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in train_ai_model: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def ai_model_status(request):
    """
    Get current AI model status and information
    """
    try:
        model_info = complaint_categorizer.get_model_info()
        
        # Get some statistics about complaints and categories
        total_complaints = Complaint.objects.count()
        category_distribution = Complaint.objects.values('type').annotate(
            count=Count('type')
        ).order_by('-count')
        
        return Response({
            'model_info': model_info,
            'categories': complaint_categorizer.CATEGORIES,
            'statistics': {
                'total_complaints': total_complaints,
                'category_distribution': list(category_distribution)
            },
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in ai_model_status: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_available_staff(request):
    """
    Get list of available staff for manual assignment
    """
    try:
        category = request.query_params.get('category')
        location = request.query_params.get('location')
        
        # Base query for active staff
        staff_query = Staff.objects.filter(status='active').order_by('active_tickets', '-rating')
        
        # Filter by category if provided
        if category and category in complaint_categorizer.CATEGORIES:
            required_roles = complaint_categorizer.CATEGORIES[category].get('staff_roles', [])
            if required_roles:
                staff_query = staff_query.filter(role__in=required_roles)
        
        # Filter by location if provided
        if location:
            staff_query = staff_query.filter(location__icontains=location)
        
        staff_list = []
        for staff in staff_query[:20]:  # Limit to 20 results
            staff_list.append({
                'id': staff.id,
                'name': staff.name,
                'email': staff.email,
                'role': staff.role,
                'department': staff.department,
                'location': staff.location,
                'rating': staff.rating,
                'active_tickets': staff.active_tickets,
                'expertise': json.loads(staff.expertise) if staff.expertise else [],
                'languages': json.loads(staff.languages) if staff.languages else []
            })
        
        return Response({
            'available_staff': staff_list,
            'total_count': len(staff_list),
            'filters_applied': {
                'category': category,
                'location': location
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_available_staff: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)