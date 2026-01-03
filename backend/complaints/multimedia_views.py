"""
Multimedia complaint submission with Gemini AI analysis
Handles images, videos, and audio files
"""
import os
import json
import logging
from typing import List, Dict, Optional, Tuple
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
import cloudinary
import cloudinary.uploader
from .models import Complaint, Staff
from .serializers import ComplaintSerializer
from .assignment_service import ComplaintAssignmentService
from ai_models.gemini_multimodal_service import get_gemini_service

logger = logging.getLogger(__name__)


def configure_cloudinary():
    """Configure Cloudinary with environment variables"""
    if not cloudinary.config().cloud_name:  # Only configure if not already done
        cloudinary_cloud_name = settings.CLOUDINARY_CLOUD_NAME
        cloudinary_api_key = settings.CLOUDINARY_API_KEY
        cloudinary_api_secret = settings.CLOUDINARY_API_SECRET
        
        if cloudinary_cloud_name and cloudinary_api_key and cloudinary_api_secret:
            cloudinary.config(
                cloud_name=cloudinary_cloud_name,
                api_key=cloudinary_api_key,
                api_secret=cloudinary_api_secret
            )
            logger.info(f"🔧 Cloudinary configured: {cloudinary_cloud_name}")
            return True
        else:
            logger.error(f"❌ Cloudinary credentials missing! cloud={cloudinary_cloud_name}, key={'SET' if cloudinary_api_key else 'MISSING'}, secret={'SET' if cloudinary_api_secret else 'MISSING'}")
            return False
    return True


def upload_file_to_cloudinary(file, resource_type='auto') -> Optional[str]:
    """
    Upload file to Cloudinary and return secure URL
    
    Args:
        file: Django UploadedFile object
        resource_type: 'image', 'video', 'audio', or 'auto'
        
    Returns:
        Cloudinary secure URL or None if upload fails
    """
    try:
        # Ensure Cloudinary is configured
        if not configure_cloudinary():
            logger.error("❌ Cloudinary not configured")
            return None
            
        logger.info(f"📤 Uploading {file.name} ({file.size} bytes) as {resource_type}...")
        result = cloudinary.uploader.upload(
            file,
            resource_type=resource_type,
            folder='rail_madad/complaints',
            use_filename=True,
            unique_filename=True
        )
        logger.info(f"✅ Upload successful: {result['secure_url']}")
        return result['secure_url']
    except Exception as e:
        logger.error(f"❌ Cloudinary upload error for {file.name}: {e}")
        return None


def process_multimedia_files(request) -> Tuple[Dict[str, List[str]], List[Tuple[str, str]]]:
    """
    Process uploaded files and upload to Cloudinary
    
    Returns:
        Tuple of (urls_dict, files_for_analysis)
        urls_dict: {'photos': [...], 'videos': [...], 'audio_files': [...]}
        files_for_analysis: [(url, type), ...]
    """
    urls = {
        'photos': [],
        'videos': [],
        'audio_files': []
    }
    files_for_analysis = []
    
    # Process photos
    photos = request.FILES.getlist('photos')
    for photo in photos:
        url = upload_file_to_cloudinary(photo, 'image')
        if url:
            urls['photos'].append(url)
            files_for_analysis.append((url, 'image'))
            logger.info(f"✅ Photo uploaded: {url}")
    
    # Process videos
    videos = request.FILES.getlist('videos')
    for video in videos:
        url = upload_file_to_cloudinary(video, 'video')
        if url:
            urls['videos'].append(url)
            files_for_analysis.append((url, 'video'))
            logger.info(f"✅ Video uploaded: {url}")
    
    # Process audio files
    audio_files = request.FILES.getlist('audio_files')
    for audio in audio_files:
        url = upload_file_to_cloudinary(audio, 'video')  # Audio as video resource type
        if url:
            urls['audio_files'].append(url)
            files_for_analysis.append((url, 'audio'))
            logger.info(f"✅ Audio uploaded: {url}")
    
    return urls, files_for_analysis


@api_view(["POST"])
def file_complaint_with_multimedia(request):
    """
    Enhanced complaint filing with multimedia support and Gemini AI analysis
    
    Accepts:
    - Multiple photos (images)
    - Multiple videos
    - Multiple audio files
    - Text description (optional if multimedia provided)
    
    Returns:
    - Complaint with AI-extracted information
    """
    try:
        logger.info("="*80)
        logger.info("📁 NEW MULTIMEDIA COMPLAINT SUBMISSION")
        logger.info("="*80)
        
        # Process form data
        data = {}
        for key, value in request.data.items():
            if key not in ['photos', 'videos', 'audio_files']:
                data[key] = value
        
        # Set defaults
        if 'priority' not in data or not data['priority']:
            data['priority'] = 'Medium'
        if 'severity' not in data or not data['severity']:
            data['severity'] = 'Medium'
        
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
        
        if user_id:
            data['user'] = user_id
            logger.info(f"✅ User authenticated: {user_id}")
        else:
            logger.warning("⚠️ No authenticated user")
        
        # Process and upload multimedia files
        logger.info("📤 Uploading files to Cloudinary...")
        urls_dict, files_for_analysis = process_multimedia_files(request)
        
        # Store URLs as JSON in database
        if urls_dict['photos']:
            data['photos'] = json.dumps(urls_dict['photos'])
            logger.info(f"✅ {len(urls_dict['photos'])} photos uploaded")
        
        if urls_dict['videos']:
            data['videos'] = json.dumps(urls_dict['videos'])
            logger.info(f"✅ {len(urls_dict['videos'])} videos uploaded")
        
        if urls_dict['audio_files']:
            data['audio_files'] = json.dumps(urls_dict['audio_files'])
            logger.info(f"✅ {len(urls_dict['audio_files'])} audio files uploaded")
        
        # Analyze multimedia with Gemini AI
        ai_analysis = None
        if files_for_analysis:
            try:
                logger.info(f"🤖 Analyzing {len(files_for_analysis)} files with Gemini AI...")
                gemini_service = get_gemini_service()
                
                if len(files_for_analysis) == 1:
                    # Single file analysis
                    file_url, file_type = files_for_analysis[0]
                    if file_type == 'image':
                        ai_analysis = gemini_service.analyze_image(file_url)
                    elif file_type == 'video':
                        ai_analysis = gemini_service.analyze_video(file_url)
                    elif file_type == 'audio':
                        ai_analysis = gemini_service.analyze_audio(file_url)
                else:
                    # Multiple files - combined analysis
                    ai_analysis = gemini_service.analyze_multiple_files(files_for_analysis)
                
                if ai_analysis:
                    logger.info(f"✅ AI Analysis complete - Confidence: {ai_analysis.get('confidence', 0):.2f}")
                    logger.info(f"   Category: {ai_analysis.get('category')}")
                    logger.info(f"   Severity: {ai_analysis.get('severity')}")
                    
                    # Store AI-extracted data
                    data['ai_extracted_description'] = ai_analysis.get('description', '')
                    data['ai_confidence'] = ai_analysis.get('confidence', 0)
                    
                    # Use AI-detected values if not provided by user
                    if not data.get('description'):
                        data['description'] = ai_analysis.get('description', 'Complaint from multimedia')
                    else:
                        # Combine user description with AI insights
                        data['description'] = f"{data['description']}\n\n[AI Analysis]: {ai_analysis.get('description', '')}"
                    
                    # Map AI category to form category
                    if not data.get('type'):
                        ai_category = ai_analysis.get('category', 'Other')
                        category_mapping = {
                            'Cleanliness': 'coach-cleanliness',
                            'Safety': 'security',
                            'Catering': 'catering',
                            'Electrical': 'electrical',
                            'Medical': 'medical-assistance',
                            'Staff Behavior': 'staff-behaviour',
                            'Infrastructure': 'divyangjan-facilities',
                            'Security': 'security',
                            'Other': 'other'
                        }
                        data['type'] = category_mapping.get(ai_category, 'other')
                    
                    # Update severity if AI detected higher severity
                    ai_severity = ai_analysis.get('severity', 'Medium')
                    severity_levels = {'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4}
                    if severity_levels.get(ai_severity, 2) > severity_levels.get(data.get('severity', 'Medium'), 2):
                        data['severity'] = ai_severity
                        logger.info(f"⬆️ Severity upgraded to: {ai_severity}")
                    
                    # Store AI-detected train/location info
                    if ai_analysis.get('train_number') and ai_analysis['train_number'] != 'not_detected':
                        data['ai_detected_train'] = ai_analysis['train_number']
                        if not data.get('train_number'):
                            data['train_number'] = ai_analysis['train_number']
                    
                    if ai_analysis.get('coach_number') and ai_analysis['coach_number'] != 'not_detected':
                        data['ai_detected_coach'] = ai_analysis['coach_number']
                    
                    if ai_analysis.get('location') and ai_analysis['location'] != 'not_detected':
                        data['ai_detected_location'] = ai_analysis['location']
                        if not data.get('location'):
                            data['location'] = ai_analysis['location']
                    
                    # Update priority based on urgency
                    urgency = ai_analysis.get('urgency', 'normal')
                    if urgency == 'urgent':
                        data['priority'] = 'Critical'
                    elif urgency == 'high':
                        data['priority'] = 'High'
                
            except Exception as e:
                logger.error(f"❌ Gemini AI analysis failed: {e}")
                # Continue without AI analysis
        
        # Ensure description is set (either from user or AI or default)
        if not data.get('description'):
            data['description'] = 'Complaint filed with multimedia attachments'
        
        # Ensure category is set
        if not data.get('type'):
            data['type'] = 'other'
        
        # Validate required fields
        required_fields = ['type', 'description', 'date_of_incident']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return JsonResponse({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=400)
        
        # Create complaint
        serializer = ComplaintSerializer(data=data)
        if serializer.is_valid():
            complaint = serializer.save()
            
            # Auto-assign using intelligent assignment service
            # This considers: expertise match, workload balance, severity of existing complaints
            staff_name, staff_id = ComplaintAssignmentService.assign_complaint(
                complaint_category=complaint.type,
                severity=complaint.severity or 'Medium'
            )
            
            if staff_name:
                complaint.staff = staff_name
                complaint.save()
                logger.info(f"🎯 Smart-assigned to {staff_name} (ID: {staff_id})")
            else:
                logger.warning(f"⚠️ No suitable staff found for category: {complaint.type}")
            
            logger.info("="*80)
            logger.info(f"✅ COMPLAINT CREATED SUCCESSFULLY - ID: {complaint.id}")
            logger.info(f"   Category: {complaint.type}")
            logger.info(f"   Severity: {complaint.severity}")
            logger.info(f"   Priority: {complaint.priority}")
            if staff_name:
                logger.info(f"   Assigned To: {staff_name}")
            if ai_analysis:
                logger.info(f"   AI Confidence: {ai_analysis.get('confidence', 0):.2%}")
            logger.info("="*80)
            
            # Send notifications for critical complaints
            if complaint.priority == 'Critical' or complaint.severity == 'High':
                from .views import create_notification
                if user_id:
                    try:
                        from django.contrib.auth.models import User
                        user = User.objects.get(id=user_id)
                        create_notification(
                            user_email=user.email,
                            notification_type='complaint_filed',
                            title='Urgent Complaint Filed',
                            message=f'Your urgent complaint #{complaint.id} has been filed and will be prioritized.',
                            related_id=complaint.id,
                            action_url=f'/track-status?id={complaint.id}'
                        )
                    except Exception as e:
                        logger.error(f"Notification error: {e}")
            
            return JsonResponse({
                "message": "Complaint filed successfully",
                "complaint_id": complaint.id,
                "ai_analysis": ai_analysis if ai_analysis else None,
                "multimedia_uploaded": {
                    "photos": len(urls_dict['photos']),
                    "videos": len(urls_dict['videos']),
                    "audio_files": len(urls_dict['audio_files'])
                }
            }, status=201)
        else:
            logger.error(f"❌ Validation errors: {serializer.errors}")
            return JsonResponse({
                "error": "Validation failed",
                "details": serializer.errors
            }, status=400)
            
    except Exception as e:
        logger.error(f"❌ Error in file_complaint_with_multimedia: {str(e)}", exc_info=True)
        return JsonResponse({
            "error": f"Failed to file complaint: {str(e)}"
        }, status=500)
