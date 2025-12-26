"""
Example Django View Integration with Enhanced Hybrid Classifier
Shows how to integrate the 95%+ accuracy classifier into your Railway Complaints system
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
import sys

# Add AI models to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'ai_models'))

from enhanced_classification_service import EnhancedClassificationService

# Initialize classifier ONCE at module level (singleton pattern)
# This avoids reloading models on every request (saves time and memory)
_classifier = None

def get_classifier():
    """Get or initialize the classifier service"""
    global _classifier
    if _classifier is None:
        model_dir = os.path.join(
            os.path.dirname(__file__),
            '..',
            'ai_models',
            'models',
            'enhanced'
        )
        _classifier = EnhancedClassificationService(
            model_dir=model_dir,
            use_hybrid=True  # ✅ Enable hybrid boost for 95%+ accuracy
        )
    return _classifier


@csrf_exempt
@require_http_methods(["POST"])
def classify_complaint_api(request):
    """
    API endpoint to classify a complaint
    
    POST /api/classify-complaint/
    Body: {"complaint_text": "Your complaint here..."}
    
    Returns:
        {
            "success": true,
            "predictions": {
                "category": "Security",
                "staff": "RPF Security",
                "priority": "High",
                "severity": "Critical"
            },
            "confidences": {
                "category": 0.96,
                "staff": 0.94,
                "priority": 0.95,
                "severity": 0.93
            },
            "decision_sources": {
                "category": "ml",
                "staff": "ml",
                "priority": "rule",
                "severity": "rule"
            },
            "is_critical": true
        }
    """
    try:
        # Parse request
        data = json.loads(request.body)
        complaint_text = data.get('complaint_text', '').strip()
        
        if not complaint_text:
            return JsonResponse({
                'success': False,
                'error': 'complaint_text is required'
            }, status=400)
        
        # Get classifier
        classifier = get_classifier()
        
        # Classify complaint
        result = classifier.classify_complaint(
            complaint_text,
            return_details=True
        )
        
        # Check if critical
        is_critical = (
            result['priority'] == 'High' and 
            result['severity'] in ['Critical', 'High']
        )
        
        # Prepare response
        response = {
            'success': True,
            'predictions': {
                'category': result['category'],
                'staff': result['staff'],
                'priority': result['priority'],
                'severity': result['severity']
            },
            'confidences': result['confidences'],
            'decision_sources': result['decision_sources'],
            'is_critical': is_critical
        }
        
        return JsonResponse(response)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def submit_complaint_with_ai(request):
    """
    Complete complaint submission with AI classification
    
    POST /api/submit-complaint/
    Body: {
        "complaint_text": "Your complaint here...",
        "user_id": 123,
        "train_number": "12345",
        "additional_info": {...}
    }
    
    Returns:
        {
            "success": true,
            "complaint_id": 456,
            "ai_classification": {
                "category": "Security",
                "priority": "High",
                ...
            },
            "message": "Complaint submitted successfully"
        }
    """
    try:
        # Parse request
        data = json.loads(request.body)
        complaint_text = data.get('complaint_text', '').strip()
        
        if not complaint_text:
            return JsonResponse({
                'success': False,
                'error': 'complaint_text is required'
            }, status=400)
        
        # Get classifier
        classifier = get_classifier()
        
        # Classify complaint
        ai_result = classifier.classify_complaint(
            complaint_text,
            return_details=True
        )
        
        # Import Django models (adjust path as needed)
        from complaints.models import Complaint
        
        # Create complaint in database
        complaint = Complaint.objects.create(
            description=complaint_text,
            user_id=data.get('user_id'),
            train_number=data.get('train_number'),
            
            # AI predictions
            category=ai_result['category'],
            assigned_staff=ai_result['staff'],
            priority=ai_result['priority'],
            severity=ai_result['severity'],
            
            # Metadata
            ai_confidence_category=ai_result['confidences']['category'],
            ai_confidence_priority=ai_result['confidences']['priority'],
            ai_confidence_severity=ai_result['confidences']['severity'],
            ai_decision_source_priority=ai_result['decision_sources']['priority'],
            ai_decision_source_severity=ai_result['decision_sources']['severity'],
            
            # Status
            status='Pending',
            is_urgent=(
                ai_result['priority'] == 'High' and 
                ai_result['severity'] in ['Critical', 'High']
            )
        )
        
        # If critical, send immediate notifications
        if complaint.is_urgent:
            send_urgent_notification(complaint)
        
        # Assign to appropriate staff
        assign_to_staff(complaint, ai_result['staff'])
        
        # Response
        return JsonResponse({
            'success': True,
            'complaint_id': complaint.id,
            'ai_classification': {
                'category': ai_result['category'],
                'staff': ai_result['staff'],
                'priority': ai_result['priority'],
                'severity': ai_result['severity'],
                'is_urgent': complaint.is_urgent
            },
            'message': 'Complaint submitted successfully' + (
                ' - URGENT complaint flagged for immediate attention!' 
                if complaint.is_urgent else ''
            )
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def send_urgent_notification(complaint):
    """
    Send immediate notifications for critical complaints
    """
    # Email to relevant staff
    from django.core.mail import send_mail
    
    send_mail(
        subject=f'URGENT: {complaint.category} - {complaint.severity}',
        message=f'''
        URGENT COMPLAINT ALERT
        
        Complaint ID: {complaint.id}
        Category: {complaint.category}
        Priority: {complaint.priority}
        Severity: {complaint.severity}
        
        Description: {complaint.description}
        
        IMMEDIATE ACTION REQUIRED!
        ''',
        from_email='alerts@railwaycomplaints.in',
        recipient_list=['urgent@railwaycomplaints.in'],
        fail_silently=False
    )
    
    # SMS to on-duty staff (if integrated)
    # send_sms(complaint.assigned_staff.phone, f"URGENT: Complaint #{complaint.id}")
    
    # Push notification to mobile app
    # send_push_notification(complaint.assigned_staff.device_token, {...})


def assign_to_staff(complaint, staff_type):
    """
    Assign complaint to appropriate staff member
    """
    # Find available staff of the required type
    from complaints.models import StaffMember
    
    staff_member = StaffMember.objects.filter(
        department=staff_type,
        is_available=True
    ).order_by('current_workload').first()
    
    if staff_member:
        complaint.assigned_to = staff_member
        complaint.save()
        
        # Increment staff workload
        staff_member.current_workload += 1
        staff_member.save()
        
        # Notify staff member
        notify_staff(staff_member, complaint)


def notify_staff(staff_member, complaint):
    """Send notification to assigned staff member"""
    from django.core.mail import send_mail
    
    urgency_prefix = "URGENT: " if complaint.is_urgent else ""
    
    send_mail(
        subject=f'{urgency_prefix}New Complaint Assigned - {complaint.category}',
        message=f'''
        New complaint has been assigned to you.
        
        Complaint ID: {complaint.id}
        Category: {complaint.category}
        Priority: {complaint.priority}
        Severity: {complaint.severity}
        
        Description: {complaint.description}
        
        Please review and take appropriate action.
        ''',
        from_email='notifications@railwaycomplaints.in',
        recipient_list=[staff_member.email],
        fail_silently=False
    )


@require_http_methods(["GET"])
def get_model_info(request):
    """
    Get information about the loaded AI models
    
    GET /api/model-info/
    
    Returns model performance metrics and configuration
    """
    try:
        classifier = get_classifier()
        info = classifier.get_model_info()
        
        return JsonResponse({
            'success': True,
            'model_info': info
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


# URL Configuration (add to your urls.py)
"""
from django.urls import path
from .views_ai_integration import (
    classify_complaint_api,
    submit_complaint_with_ai,
    get_model_info
)

urlpatterns = [
    path('api/classify-complaint/', classify_complaint_api, name='classify_complaint'),
    path('api/submit-complaint/', submit_complaint_with_ai, name='submit_complaint'),
    path('api/model-info/', get_model_info, name='model_info'),
]
"""
