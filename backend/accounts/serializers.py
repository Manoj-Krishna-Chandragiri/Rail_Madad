from rest_framework import serializers
from .models import FirebaseUser, Staff
import json

class StaffSerializer(serializers.ModelSerializer):
    """Serializer for Staff model (accounts_staff table)"""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Staff
        fields = ['user_id', 'email', 'full_name', 'phone_number', 'employee_id', 
                 'department', 'role', 'location', 'avatar', 'status', 'joining_date',
                 'expertise', 'languages', 'communication_preferences', 'rating', 
                 'active_tickets', 'shift_timings', 'reporting_to_id',
                 'created_at', 'updated_at']
        read_only_fields = ['user_id', 'created_at', 'updated_at']
    
    def to_internal_value(self, data):
        """Convert incoming data, handling JSON string fields from FormData"""
        # Make a mutable copy if it's a QueryDict
        if hasattr(data, '_mutable'):
            data._mutable = True
        
        # Handle JSON string fields from FormData
        for field in ['expertise', 'languages', 'communication_preferences', 'shift_timings']:
            if field in data and isinstance(data.get(field), str):
                try:
                    parsed = json.loads(data[field])
                    data[field] = parsed
                except (json.JSONDecodeError, ValueError):
                    # If it's not valid JSON, leave it as is and let validation catch it
                    pass
        
        return super().to_internal_value(data)
    
    def validate_employee_id(self, value):
        """Validate employee_id is unique (excluding current instance during update)"""
        if not value:  # Allow empty employee_id
            return value
            
        instance = getattr(self, 'instance', None)
        # If updating, exclude the current instance from uniqueness check
        if instance:
            if instance.employee_id == value:
                return value
            # Check if another staff member has this employee_id
            if Staff.objects.filter(employee_id=value).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError("Staff member with this employee ID already exists")
        else:
            # For new staff, just check uniqueness
            if Staff.objects.filter(employee_id=value).exists():
                raise serializers.ValidationError("Staff member with this employee ID already exists")
        return value
    
    def validate_email(self, value):
        """Validate email is unique (excluding current instance during update)"""
        instance = getattr(self, 'instance', None)
        # If updating, exclude the current instance from uniqueness check
        if instance:
            if instance.email == value:
                return value
            # Check if another staff member has this email
            if Staff.objects.filter(email=value).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError("Staff member with this email already exists")
        else:
            # For new staff, just check uniqueness
            if Staff.objects.filter(email=value).exists():
                raise serializers.ValidationError("Staff member with this email already exists")
        return value

class FirebaseUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FirebaseUser
        fields = ['uid', 'email', 'name', 'role', 'profile_picture', 'created_at', 'is_active']
        read_only_fields = ['uid', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile updates"""
    class Meta:
        model = FirebaseUser
        fields = ['name', 'profile_picture']

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    class Meta:
        model = FirebaseUser
        fields = ['uid', 'email', 'name', 'role']
        read_only_fields = ['uid']

    def create(self, validated_data):
        """Create a new user"""
        return FirebaseUser.objects.create(**validated_data)

class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin to manage users"""
    class Meta:
        model = FirebaseUser
        fields = ['uid', 'email', 'name', 'role', 'profile_picture', 'created_at', 'is_active']
        read_only_fields = ['uid', 'created_at']