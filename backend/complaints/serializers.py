from rest_framework import serializers
from .models import Complaint, Feedback, Staff

class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = '__all__'
 
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