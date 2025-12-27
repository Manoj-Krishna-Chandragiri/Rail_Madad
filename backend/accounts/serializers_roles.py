"""
Role-based serializers for new user models
"""

from rest_framework import serializers
from .models_new_roles import FirebaseUser, Admin, Staff, Passenger


class AdminSerializer(serializers.ModelSerializer):
    """Serializer for Admin profile"""
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Admin
        fields = [
            'user', 'email', 'full_name', 'phone_number', 
            'department', 'designation', 'employee_id', 
            'super_admin', 'permissions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class StaffSerializer(serializers.ModelSerializer):
    """Serializer for Staff profile"""
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Staff
        fields = [
            'user', 'email', 'full_name', 'phone_number', 'employee_id',
            'department', 'role', 'location', 'avatar', 'status',
            'joining_date', 'expertise', 'languages', 'communication_preferences',
            'rating', 'active_tickets', 'shift_timings', 'reporting_to_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'rating', 'active_tickets', 'created_at', 'updated_at']


class PassengerSerializer(serializers.ModelSerializer):
    """Serializer for Passenger profile"""
    email = serializers.EmailField(source='user.email', read_only=True)
    resolution_rate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Passenger
        fields = [
            'user', 'email', 'full_name', 'phone_number', 'gender',
            'date_of_birth', 'address', 'city', 'state', 'pincode',
            'preferred_language', 'notification_preferences', 'frequent_routes',
            'total_complaints', 'resolved_complaints', 'resolution_rate',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'user', 'total_complaints', 'resolved_complaints', 
            'resolution_rate', 'created_at', 'updated_at'
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    """Unified serializer for user profile with role-specific data"""
    role = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = FirebaseUser
        fields = ['id', 'email', 'firebase_uid', 'is_active', 'date_joined', 'last_login', 'role', 'profile']
        read_only_fields = ['id', 'email', 'firebase_uid', 'date_joined', 'last_login', 'role', 'profile']
    
    def get_role(self, obj):
        """Get user's role"""
        return obj.get_role()
    
    def get_profile(self, obj):
        """Get role-specific profile data"""
        role = obj.get_role()
        if role == 'admin':
            return AdminSerializer(obj.admin_profile).data
        elif role == 'staff':
            return StaffSerializer(obj.staff_profile).data
        elif role == 'passenger':
            return PassengerSerializer(obj.passenger_profile).data
        return None
