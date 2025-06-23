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

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'