"""
Serializers for Facial Authentication
"""
from rest_framework import serializers
from .face_models import FaceProfile, FaceAuthLog, FaceEnrollmentSession
from .models import FirebaseUser


class FaceProfileSerializer(serializers.ModelSerializer):
    """Serializer for FaceProfile model"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    has_encoding = serializers.SerializerMethodField()
    
    class Meta:
        model = FaceProfile
        fields = [
            'user', 'user_email', 'user_name', 'face_image', 
            'is_verified', 'enrollment_date', 'last_updated',
            'image_quality_score', 'model_name', 'has_encoding'
        ]
        read_only_fields = ['enrollment_date', 'last_updated', 'is_verified']
    
    def get_has_encoding(self, obj):
        """Check if face profile has valid encoding"""
        return obj.has_valid_encoding()


class FaceEnrollmentSerializer(serializers.Serializer):
    """Serializer for face enrollment request"""
    image = serializers.CharField(
        help_text="Base64 encoded image string"
    )
    
    def validate_image(self, value):
        """Validate that image is properly encoded"""
        if not value or len(value) < 100:
            raise serializers.ValidationError("Invalid image data")
        return value


class FaceAuthLoginSerializer(serializers.Serializer):
    """Serializer for face authentication login"""
    image = serializers.CharField(
        help_text="Base64 encoded image captured from webcam"
    )
    
    def validate_image(self, value):
        """Validate image data"""
        if not value or len(value) < 100:
            raise serializers.ValidationError("Invalid image data")
        return value


class FaceAuthLogSerializer(serializers.ModelSerializer):
    """Serializer for FaceAuthLog model"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = FaceAuthLog
        fields = [
            'id', 'user', 'user_email', 'captured_image', 'status',
            'confidence_score', 'ip_address', 'matched_user_email',
            'model_used', 'processing_time_ms', 'timestamp', 'is_successful'
        ]
        read_only_fields = fields  # All fields are read-only for logs


class FaceEnrollmentSessionSerializer(serializers.ModelSerializer):
    """Serializer for FaceEnrollmentSession model"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = FaceEnrollmentSession
        fields = [
            'user', 'user_email', 'session_id', 'images_count',
            'completed', 'created_at', 'completed_at'
        ]
        read_only_fields = ['created_at', 'completed_at']
