from rest_framework import serializers
from .models import Complaint, Feedback, Staff

class ComplaintSerializer(serializers.ModelSerializer):
    passenger_name = serializers.SerializerMethodField()
    passenger_email = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = '__all__'
 
    def get_passenger_name(self, obj):
        """Get passenger name from the user relationship"""
        if obj.user:
            # Try to get from FirebaseUser
            if hasattr(obj.user, 'full_name') and obj.user.full_name:
                return obj.user.full_name
            # Try to get from Passenger profile
            if hasattr(obj.user, 'passenger_profile'):
                return obj.user.passenger_profile.full_name
            # Fallback to email
            return obj.user.email
        return 'Unknown'
    
    def get_passenger_email(self, obj):
        """Get passenger email from the user relationship"""
        if obj.user:
            return obj.user.email
        return None
    
    def validate_photos(self, value):
        # Allow both string (filepath) and None values
        if value and not isinstance(value, str):
            raise serializers.ValidationError("Photos must be a valid file path")
        return value
 
    def create(self, validated_data):
        return Complaint.objects.create(**validated_data)

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ['sentiment', 'sentiment_confidence']

class StaffSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def to_representation(self, instance):
        """Custom representation to include both avatar field and avatar_url"""
        data = super().to_representation(instance)
        # Replace avatar field with the full URL in the response
        data['avatar'] = self.get_avatar_url(instance)
        return data
    
    def validate_email(self, value):
        """Ensure email is unique (except for the current instance during updates)"""
        instance = getattr(self, 'instance', None)
        if instance and instance.email == value:
            return value
        if Staff.objects.filter(email=value).exists():
            raise serializers.ValidationError("A staff member with this email already exists.")
        return value