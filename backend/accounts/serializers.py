from rest_framework import serializers
from .models import FirebaseUser, Staff
import json

class StaffSerializer(serializers.ModelSerializer):
    """Serializer for Staff model (accounts_staff table)"""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    avatar = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    rating = serializers.FloatField(required=False, default=0.0)
    active_tickets = serializers.IntegerField(required=False, default=0)
    employee_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    location = serializers.CharField(required=False, allow_blank=True)
    shift_timings = serializers.JSONField(required=False, default=dict)
    reporting_to_id = serializers.IntegerField(required=False, allow_null=True)
    
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
            if field in data:
                value = data.get(field)
                
                # QueryDict returns values as lists, extract the first element
                if isinstance(value, list) and len(value) > 0:
                    value = value[0]
                
                # If it's already a list/dict (parsed), keep it
                if isinstance(value, (list, dict)):
                    data[field] = value
                # If it's a string, try to parse it as JSON
                elif isinstance(value, str):
                    try:
                        parsed = json.loads(value)
                        data[field] = parsed
                    except (json.JSONDecodeError, ValueError) as e:
                        print(f"[SERIALIZER] Failed to parse {field}: {value} - Error: {e}")
                        # If it's not valid JSON, set to empty list/dict
                        data[field] = [] if field != 'shift_timings' else {}
                # If it's None or empty, set default
                else:
                    data[field] = [] if field != 'shift_timings' else {}
        
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
        
        print(f"[EMAIL_VALIDATION] Validating email: {value}")
        print(f"[EMAIL_VALIDATION] Instance: {instance}")
        if instance:
            print(f"[EMAIL_VALIDATION] Instance email: {instance.email}")
            print(f"[EMAIL_VALIDATION] Instance user_id: {instance.user_id}")
        
        # If updating and email hasn't changed, no need to validate
        if instance and instance.email == value:
            print(f"[EMAIL_VALIDATION] Email unchanged, skipping validation")
            return value
        
        # Check uniqueness
        if instance:
            # For updates, exclude the current instance using user_id (the primary key)
            existing = Staff.objects.filter(email=value).exclude(user_id=instance.user_id)
            print(f"[EMAIL_VALIDATION] Existing staff with this email (excluding current): {existing.count()}")
            if existing.exists():
                raise serializers.ValidationError("Staff member with this email already exists")
        else:
            # For new staff, just check uniqueness
            if Staff.objects.filter(email=value).exists():
                raise serializers.ValidationError("Staff member with this email already exists")
        
        print(f"[EMAIL_VALIDATION] Email validation passed")
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