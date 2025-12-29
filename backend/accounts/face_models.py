"""
Facial Authentication Models
Stores facial data and authentication logs for all user types
"""
from django.db import models
from django.conf import settings
import json


class FaceProfile(models.Model):
    """
    Stores facial recognition data for users.
    Each user can have one face profile for authentication.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='face_profile',
        primary_key=True
    )
    face_image = models.ImageField(
        upload_to='face_profiles/',
        help_text="Primary face image used for enrollment"
    )
    face_encoding = models.TextField(
        help_text="JSON-encoded facial embedding vector",
        blank=True
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether the face profile has been verified"
    )
    enrollment_date = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    # Metadata
    image_quality_score = models.FloatField(
        default=0.0,
        help_text="Quality score of the enrolled face image (0-1)"
    )
    model_name = models.CharField(
        max_length=50,
        default='Facenet',
        help_text="Face recognition model used (Facenet, VGG-Face, etc.)"
    )
    
    class Meta:
        db_table = 'accounts_face_profile'
        verbose_name = 'Face Profile'
        verbose_name_plural = 'Face Profiles'
    
    def __str__(self):
        return f"Face Profile: {self.user.email}"
    
    def set_encoding(self, encoding_array):
        """Store face encoding as JSON"""
        self.face_encoding = json.dumps(encoding_array.tolist())
    
    def get_encoding(self):
        """Retrieve face encoding as numpy array"""
        import numpy as np
        return np.array(json.loads(self.face_encoding))
    
    def has_valid_encoding(self):
        """Check if face profile has a valid encoding"""
        return bool(self.face_encoding and len(self.face_encoding) > 10)


class FaceAuthLog(models.Model):
    """
    Logs all facial authentication attempts for security auditing.
    Tracks both successful and failed authentication attempts.
    """
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('no_face', 'No Face Detected'),
        ('multiple_faces', 'Multiple Faces Detected'),
        ('low_confidence', 'Low Confidence Match'),
        ('not_enrolled', 'User Not Enrolled'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='face_auth_logs',
        help_text="Identified user (null if not recognized)"
    )
    captured_image = models.ImageField(
        upload_to='face_auth_logs/',
        help_text="Image captured during authentication attempt"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='failed'
    )
    confidence_score = models.FloatField(
        default=0.0,
        help_text="Match confidence score (0-1, higher is better)"
    )
    
    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Match details
    matched_user_email = models.EmailField(
        blank=True,
        help_text="Email of matched user (for logging)"
    )
    model_used = models.CharField(
        max_length=50,
        default='Facenet',
        help_text="Face recognition model used for this attempt"
    )
    processing_time_ms = models.IntegerField(
        default=0,
        help_text="Time taken to process authentication (milliseconds)"
    )
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accounts_face_auth_log'
        verbose_name = 'Face Auth Log'
        verbose_name_plural = 'Face Auth Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['status', '-timestamp']),
        ]
    
    def __str__(self):
        user_info = self.user.email if self.user else "Unknown"
        return f"{self.status} - {user_info} at {self.timestamp}"
    
    @property
    def is_successful(self):
        """Quick check if authentication was successful"""
        return self.status == 'success'


class FaceEnrollmentSession(models.Model):
    """
    Tracks multi-photo enrollment sessions.
    Users can upload multiple photos for better face recognition accuracy.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollment_sessions'
    )
    session_id = models.CharField(max_length=100, unique=True)
    images_count = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'accounts_face_enrollment_session'
        verbose_name = 'Face Enrollment Session'
        verbose_name_plural = 'Face Enrollment Sessions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Enrollment Session: {self.user.email} - {self.session_id}"
