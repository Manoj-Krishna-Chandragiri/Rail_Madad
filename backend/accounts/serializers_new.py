"""
Updated serializers for role-based user models
"""

from rest_framework import serializers
from .models_new import (
    FirebaseUser, Passenger, Staff, Admin,
    StaffShift, StaffPerformance
)


class FirebaseUserSerializer(serializers.ModelSerializer):
    """Base serializer for FirebaseUser"""
    
    class Meta:
        model = FirebaseUser
        fields = [
            'id', 'firebase_uid', 'email', 'user_type',
            'is_active', 'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PassengerSerializer(serializers.ModelSerializer):
    """Serializer for Passenger profile"""
    email = serializers.EmailField(source='user.email', read_only=True)
    firebase_uid = serializers.CharField(source='user.firebase_uid', read_only=True)
    
    class Meta:
        model = Passenger
        fields = [
            'id', 'email', 'firebase_uid', 'full_name', 'phone_number',
            'gender', 'address', 'date_of_birth', 'aadhar_number',
            'preferred_language', 'notification_preferences',
            'travel_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits")
        if value and len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits")
        return value
    
    def validate_aadhar_number(self, value):
        """Validate Aadhar number format"""
        if value and (not value.isdigit() or len(value) != 12):
            raise serializers.ValidationError("Aadhar number must be 12 digits")
        return value


class StaffShiftSerializer(serializers.ModelSerializer):
    """Serializer for Staff Shifts"""
    
    class Meta:
        model = StaffShift
        fields = [
            'id', 'staff', 'shift_date', 'shift_start', 'shift_end',
            'shift_type', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StaffPerformanceSerializer(serializers.ModelSerializer):
    """Serializer for Staff Performance metrics"""
    
    class Meta:
        model = StaffPerformance
        fields = [
            'id', 'staff', 'month', 'year', 'total_tickets_handled',
            'tickets_resolved', 'tickets_escalated', 'average_satisfaction_rating',
            'average_response_time_minutes', 'average_resolution_time_hours',
            'commendations_received', 'complaints_received', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StaffSerializer(serializers.ModelSerializer):
    """Serializer for Staff profile"""
    email = serializers.EmailField(source='user.email', read_only=True)
    firebase_uid = serializers.CharField(source='user.firebase_uid', read_only=True)
    shifts = StaffShiftSerializer(many=True, read_only=True)
    performance_records = StaffPerformanceSerializer(many=True, read_only=True)
    
    # Add computed fields
    efficiency_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Staff
        fields = [
            'id', 'email', 'firebase_uid', 'employee_id', 'full_name',
            'phone_number', 'department', 'designation', 'location', 'avatar',
            'expertise', 'languages', 'communication_preferences',
            'certifications', 'status', 'joining_date', 'work_schedule',
            'assigned_zones', 'rating', 'active_tickets', 'resolved_tickets',
            'average_resolution_time', 'total_experience_years',
            'emergency_contact_name', 'emergency_contact_phone',
            'reporting_manager', 'shifts', 'performance_records',
            'efficiency_score', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'employee_id', 'rating', 'active_tickets',
            'resolved_tickets', 'created_at', 'updated_at'
        ]
    
    def get_efficiency_score(self, obj):
        """Calculate efficiency score from performance metrics"""
        return obj.calculate_efficiency_score()
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits")
        if value and len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits")
        return value


class StaffListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for staff listings"""
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Staff
        fields = [
            'id', 'email', 'employee_id', 'full_name', 'department',
            'designation', 'location', 'avatar', 'status', 'rating',
            'active_tickets'
        ]


class AdminSerializer(serializers.ModelSerializer):
    """Serializer for Admin profile"""
    email = serializers.EmailField(source='user.email', read_only=True)
    firebase_uid = serializers.CharField(source='user.firebase_uid', read_only=True)
    
    # Add computed field
    permission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Admin
        fields = [
            'id', 'email', 'firebase_uid', 'full_name', 'phone_number',
            'admin_level', 'department', 'can_manage_staff',
            'can_manage_complaints', 'can_view_analytics',
            'can_manage_users', 'can_access_reports', 'can_modify_settings',
            'reporting_to', 'managed_zones', 'permission_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_permission_count(self, obj):
        """Count active permissions"""
        permissions = [
            obj.can_manage_staff,
            obj.can_manage_complaints,
            obj.can_view_analytics,
            obj.can_manage_users,
            obj.can_access_reports,
            obj.can_modify_settings
        ]
        return sum(permissions)


class UserProfileSerializer(serializers.Serializer):
    """
    Unified serializer that returns appropriate profile based on user_type
    """
    user_type = serializers.CharField()
    user_data = serializers.SerializerMethodField()
    
    def get_user_data(self, obj):
        """Return serialized data based on user type"""
        if obj.user_type == 'passenger':
            try:
                profile = obj.passenger_profile
                return PassengerSerializer(profile).data
            except Passenger.DoesNotExist:
                return None
        
        elif obj.user_type == 'staff':
            try:
                profile = obj.staff_profile
                return StaffSerializer(profile).data
            except Staff.DoesNotExist:
                return None
        
        elif obj.user_type == 'admin':
            try:
                profile = obj.admin_profile
                return AdminSerializer(profile).data
            except Admin.DoesNotExist:
                return None
        
        return None


# Serializers for creating users
class PassengerCreateSerializer(serializers.Serializer):
    """Serializer for creating a new passenger"""
    email = serializers.EmailField()
    firebase_uid = serializers.CharField()
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=15, required=False)
    gender = serializers.ChoiceField(
        choices=['male', 'female', 'other', 'prefer_not_to_say'],
        required=False
    )
    address = serializers.CharField(required=False, allow_blank=True)
    
    def create(self, validated_data):
        """Create FirebaseUser and Passenger profile"""
        email = validated_data.pop('email')
        firebase_uid = validated_data.pop('firebase_uid')
        
        # Create or get FirebaseUser
        user, created = FirebaseUser.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={
                'email': email,
                'user_type': 'passenger'
            }
        )
        
        # Create Passenger profile
        passenger, _ = Passenger.objects.get_or_create(
            user=user,
            defaults=validated_data
        )
        
        return passenger


class StaffCreateSerializer(serializers.Serializer):
    """Serializer for creating a new staff member"""
    email = serializers.EmailField()
    firebase_uid = serializers.CharField(required=False)
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=15)
    department = serializers.CharField(max_length=100)
    designation = serializers.CharField(max_length=100)
    location = serializers.CharField(max_length=200, required=False)
    expertise = serializers.ListField(child=serializers.CharField(), required=False)
    languages = serializers.ListField(child=serializers.CharField(), required=False)
    
    def create(self, validated_data):
        """Create FirebaseUser and Staff profile"""
        import uuid
        
        email = validated_data.pop('email')
        firebase_uid = validated_data.pop('firebase_uid', f"staff_{uuid.uuid4().hex[:20]}")
        
        # Create or get FirebaseUser
        user, created = FirebaseUser.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={
                'email': email,
                'user_type': 'staff'
            }
        )
        
        # Generate employee ID
        last_staff = Staff.objects.order_by('-employee_id').first()
        if last_staff and last_staff.employee_id.startswith('EMP'):
            last_num = int(last_staff.employee_id[3:])
            employee_id = f"EMP{last_num + 1:04d}"
        else:
            employee_id = "EMP0001"
        
        # Create Staff profile
        validated_data['employee_id'] = employee_id
        staff, _ = Staff.objects.get_or_create(
            user=user,
            defaults=validated_data
        )
        
        return staff


class AdminCreateSerializer(serializers.Serializer):
    """Serializer for creating a new admin"""
    email = serializers.EmailField()
    firebase_uid = serializers.CharField()
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=15, required=False)
    admin_level = serializers.ChoiceField(
        choices=['super_admin', 'admin', 'moderator'],
        default='admin'
    )
    department = serializers.CharField(max_length=100, required=False)
    
    def create(self, validated_data):
        """Create FirebaseUser and Admin profile"""
        email = validated_data.pop('email')
        firebase_uid = validated_data.pop('firebase_uid')
        
        # Create or get FirebaseUser
        user, created = FirebaseUser.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={
                'email': email,
                'user_type': 'admin'
            }
        )
        
        # Create Admin profile
        admin, _ = Admin.objects.get_or_create(
            user=user,
            defaults=validated_data
        )
        
        return admin
