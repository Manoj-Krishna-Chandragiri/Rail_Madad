"""
Django API Views for AI-Powered Complaint Classification
Integrates BERT/DistilBERT model with Django REST Framework
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
import json
import logging

logger = logging.getLogger(__name__)


# Import classification service
try:
    from ai_models.complaint_classification_service import (
        get_classification_service,
        classify_complaint
    )
    CLASSIFICATION_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Classification service not available: {e}")
    CLASSIFICATION_AVAILABLE = False


@api_view(['POST'])
@permission_classes([AllowAny])
def classify_complaint_view(request):
    """
    Classify a complaint description using AI model
    
    POST /api/complaints/classify/
    Body: {
        "description": "The toilet is dirty and smells bad"
    }
    
    Returns: {
        "success": true,
        "category": "Coach - Cleanliness",
        "staff_assignment": "Housekeeping Staff",
        "priority": "High",
        "severity": "High",
        "confidence_scores": {
            "category": 0.95,
            "staff": 0.92,
            "priority": 0.88,
            "severity": 0.90
        }
    }
    """
    try:
        # Check if classification is available
        if not CLASSIFICATION_AVAILABLE:
            return Response({
                'success': False,
                'error': 'AI classification service is not available',
                'category': 'Miscellaneous',
                'staff_assignment': 'Station Master',
                'priority': 'Medium',
                'severity': 'Medium'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Get complaint description
        description = request.data.get('description', '')
        
        if not description or not description.strip():
            return Response({
                'success': False,
                'error': 'Complaint description is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Classify complaint
        result = classify_complaint(description)
        
        # Check for errors in classification
        if 'error' in result:
            logger.error(f"Classification error: {result['error']}")
            return Response({
                'success': False,
                'error': result.get('error', 'Classification failed'),
                'category': result.get('category', 'Miscellaneous'),
                'staff_assignment': result.get('staff_assignment', 'Station Master'),
                'priority': result.get('priority', 'Medium'),
                'severity': result.get('severity', 'Medium')
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Return successful classification
        return Response({
            'success': True,
            'category': result['category'],
            'staff_assignment': result['staff_assignment'],
            'priority': result['priority'],
            'severity': result['severity'],
            'confidence_scores': result.get('confidence_scores', {})
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.exception("Error in classify_complaint_view")
        return Response({
            'success': False,
            'error': str(e),
            'category': 'Miscellaneous',
            'staff_assignment': 'Station Master',
            'priority': 'Medium',
            'severity': 'Medium'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def classify_batch_complaints_view(request):
    """
    Classify multiple complaints in batch
    
    POST /api/complaints/classify-batch/
    Body: {
        "complaints": [
            {"id": 1, "description": "Toilet is dirty"},
            {"id": 2, "description": "AC not working"}
        ]
    }
    
    Returns: {
        "success": true,
        "results": [
            {
                "id": 1,
                "category": "Coach - Cleanliness",
                "staff_assignment": "Housekeeping Staff",
                "priority": "High",
                "severity": "High"
            },
            ...
        ]
    }
    """
    try:
        if not CLASSIFICATION_AVAILABLE:
            return Response({
                'success': False,
                'error': 'AI classification service is not available'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        complaints = request.data.get('complaints', [])
        
        if not complaints or not isinstance(complaints, list):
            return Response({
                'success': False,
                'error': 'Complaints array is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = []
        service = get_classification_service()
        
        if service is None:
            return Response({
                'success': False,
                'error': 'Classification service initialization failed'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        for item in complaints:
            complaint_id = item.get('id')
            description = item.get('description', '')
            
            if not description:
                results.append({
                    'id': complaint_id,
                    'success': False,
                    'error': 'Description is empty'
                })
                continue
            
            try:
                classification = classify_complaint(description)
                results.append({
                    'id': complaint_id,
                    'success': True,
                    'category': classification['category'],
                    'staff_assignment': classification['staff_assignment'],
                    'priority': classification['priority'],
                    'severity': classification['severity'],
                    'confidence_scores': classification.get('confidence_scores', {})
                })
            except Exception as e:
                logger.error(f"Error classifying complaint {complaint_id}: {e}")
                results.append({
                    'id': complaint_id,
                    'success': False,
                    'error': str(e)
                })
        
        return Response({
            'success': True,
            'results': results,
            'total': len(results)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.exception("Error in classify_batch_complaints_view")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_classification_info(request):
    """
    Get information about the classification model
    
    GET /api/complaints/classification-info/
    
    Returns: {
        "success": true,
        "model_type": "distilbert",
        "categories": [...],
        "staff_types": [...],
        "priority_levels": [...],
        "severity_levels": [...]
    }
    """
    try:
        if not CLASSIFICATION_AVAILABLE:
            return Response({
                'success': False,
                'error': 'AI classification service is not available'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        service = get_classification_service()
        
        if service is None:
            return Response({
                'success': False,
                'error': 'Classification service initialization failed'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        info = service.get_model_info()
        
        return Response({
            'success': True,
            **info
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.exception("Error in get_classification_info")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auto_assign_complaint(request, complaint_id):
    """
    Auto-assign staff to a complaint based on AI classification
    
    POST /api/complaints/<id>/auto-assign/
    
    Returns: {
        "success": true,
        "message": "Complaint automatically assigned",
        "assigned_to": "Housekeeping Staff",
        "priority": "High",
        "severity": "High"
    }
    """
    try:
        from complaints.models import Complaint
        
        if not CLASSIFICATION_AVAILABLE:
            return Response({
                'success': False,
                'error': 'AI classification service is not available'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Get complaint
        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Complaint not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Classify complaint
        description = complaint.description
        classification = classify_complaint(description)
        
        # Update complaint with classification results
        complaint.complaint_type = classification['category']
        complaint.priority_level = classification['priority']
        complaint.severity_level = classification['severity']
        
        # TODO: Assign to appropriate staff based on staff_assignment
        # This requires staff user lookup based on role
        
        complaint.save()
        
        return Response({
            'success': True,
            'message': 'Complaint automatically classified and updated',
            'category': classification['category'],
            'staff_type': classification['staff_assignment'],
            'priority': classification['priority'],
            'severity': classification['severity'],
            'confidence_scores': classification.get('confidence_scores', {})
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.exception(f"Error in auto_assign_complaint for complaint {complaint_id}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for classification service
    
    GET /api/complaints/ai-health/
    """
    try:
        if not CLASSIFICATION_AVAILABLE:
            return Response({
                'status': 'unavailable',
                'message': 'AI classification service is not installed'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        service = get_classification_service()
        
        if service is None:
            return Response({
                'status': 'error',
                'message': 'Classification service failed to initialize'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Test classification
        test_result = classify_complaint("Test complaint for health check")
        
        return Response({
            'status': 'healthy',
            'message': 'AI classification service is running',
            'model_type': service.config['model_type'],
            'device': str(service.device),
            'test_result': test_result
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.exception("Error in health_check")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
