from rest_framework import serializers
from .models import FirebaseUser

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