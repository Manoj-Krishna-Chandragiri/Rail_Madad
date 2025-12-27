"""
New role-based user models for Rail Madad
Replace the content in accounts/models.py with this after testing
"""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class FirebaseUserManager(BaseUserManager):
    """Custom manager for FirebaseUser"""
    
    def create_user(self, email, firebase_uid, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        if not firebase_uid:
            raise ValueError('Users must have a Firebase UID')
        
        email = self.normalize_email(email)
        user = self.model(email=email, firebase_uid=firebase_uid, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, firebase_uid, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        return self.create_user(email, firebase_uid, password, **extra_fields)


class FirebaseUser(AbstractBaseUser, PermissionsMixin):
    """
    Core authentication user model - Firebase integration
    This is the base user table that links to role-specific tables
    """
    email = models.EmailField(unique=True, max_length=254)
    firebase_uid = models.CharField(max_length=128, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Django admin access
    is_superuser = models.BooleanField(default=False)  # Django superuser
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    objects = FirebaseUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firebase_uid']
    
    class Meta:
        db_table = 'accounts_firebaseuser'
        verbose_name = 'Firebase User'
        verbose_name_plural = 'Firebase Users'
    
    def __str__(self):
        return self.email
    
    def get_role(self):
        """Get the user's role by checking which profile exists"""
        if hasattr(self, 'admin_profile'):
            return 'admin'
        elif hasattr(self, 'staff_profile'):
            return 'staff'
        elif hasattr(self, 'passenger_profile'):
            return 'passenger'
        return None
    
    def get_profile(self):
        """Get the user's role-specific profile"""
        role = self.get_role()
        if role == 'admin':
            return self.admin_profile
        elif role == 'staff':
            return self.staff_profile
        elif role == 'passenger':
            return self.passenger_profile
        return None


class Admin(models.Model):
    """Admin user profile with admin-specific attributes"""
    
    user = models.OneToOneField(
        FirebaseUser, 
        on_delete=models.CASCADE, 
        related_name='admin_profile',
        primary_key=True
    )
    email = models.EmailField(max_length=254)  # Denormalized for easier querying
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    super_admin = models.BooleanField(default=False)
    permissions = models.JSONField(default=list, blank=True)  # Array of permission strings
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_admin'
        verbose_name = 'Admin'
        verbose_name_plural = 'Admins'
    
    def __str__(self):
        return f"{self.full_name} ({self.user.email})"
    
    def has_permission(self, permission):
        """Check if admin has specific permission"""
        if self.super_admin:
            return True
        return permission in self.permissions


class Staff(models.Model):
    """Staff member profile with staff-specific attributes"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('on_leave', 'On Leave'),
    ]
    
    user = models.OneToOneField(
        FirebaseUser, 
        on_delete=models.CASCADE, 
        related_name='staff_profile',
        primary_key=True
    )
    email = models.EmailField(max_length=254)  # Denormalized for easier querying
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True)
    employee_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    department = models.CharField(max_length=100)
    role = models.CharField(max_length=100)  # cleaning_supervisor, catering_manager, etc.
    location = models.CharField(max_length=255, blank=True)
    avatar = models.CharField(max_length=255, blank=True)  # Path to avatar
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    joining_date = models.DateField(default=timezone.now)
    expertise = models.JSONField(default=list, blank=True)  # Array of expertise areas
    languages = models.JSONField(default=list, blank=True)  # Array of language codes
    communication_preferences = models.JSONField(default=list, blank=True)  # ['Chat', 'Voice', 'Video']
    rating = models.FloatField(default=0.0)
    active_tickets = models.IntegerField(default=0)
    shift_timings = models.JSONField(default=dict, blank=True)  # {"start": "09:00", "end": "17:00"}
    reporting_to_id = models.IntegerField(null=True, blank=True)  # FK to Admin
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_staff'
        verbose_name = 'Staff'
        verbose_name_plural = 'Staff Members'
    
    def __str__(self):
        return f"{self.full_name} - {self.role}"
    
    def is_available(self):
        """Check if staff is currently available"""
        return self.status == 'active' and self.active_tickets < 10


class Passenger(models.Model):
    """Passenger profile with passenger-specific attributes"""
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]
    
    user = models.OneToOneField(
        FirebaseUser, 
        on_delete=models.CASCADE, 
        related_name='passenger_profile',
        primary_key=True
    )
    email = models.EmailField(max_length=254, blank=True)  # Denormalized for easier querying
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    preferred_language = models.CharField(max_length=10, default='en')
    notification_preferences = models.JSONField(default=dict, blank=True)
    frequent_routes = models.JSONField(default=list, blank=True)
    total_complaints = models.IntegerField(default=0)
    resolved_complaints = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_passenger'
        verbose_name = 'Passenger'
        verbose_name_plural = 'Passengers'
    
    def __str__(self):
        return f"{self.full_name} ({self.user.email})"
    
    @property
    def resolution_rate(self):
        """Calculate percentage of resolved complaints"""
        if self.total_complaints == 0:
            return 0
        return (self.resolved_complaints / self.total_complaints) * 100


class StaffAvailability(models.Model):
    """Track staff availability and shifts"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('on_duty', 'On Duty'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    staff_id = models.IntegerField()  # FK to Staff
    date = models.DateField()
    shift_start = models.TimeField()
    shift_end = models.TimeField()
    is_available = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'accounts_staff_availability'
        verbose_name = 'Staff Availability'
        verbose_name_plural = 'Staff Availability'
        unique_together = [['staff_id', 'date', 'shift_start']]
    
    def __str__(self):
        return f"Staff {self.staff_id} - {self.date} ({self.shift_start} to {self.shift_end})"


class StaffPerformance(models.Model):
    """Track staff performance metrics"""
    
    staff_id = models.IntegerField()  # FK to Staff
    month = models.IntegerField()  # 1-12
    year = models.IntegerField()
    tickets_resolved = models.IntegerField(default=0)
    avg_resolution_time = models.FloatField(default=0.0)  # in hours
    customer_satisfaction = models.FloatField(default=0.0)  # 0-5 rating
    complaints_received = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_staff_performance'
        verbose_name = 'Staff Performance'
        verbose_name_plural = 'Staff Performance Records'
        unique_together = [['staff_id', 'month', 'year']]
    
    def __str__(self):
        return f"Staff {self.staff_id} - {self.month}/{self.year}"
