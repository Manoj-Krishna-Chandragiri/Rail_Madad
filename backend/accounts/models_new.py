"""
Restructured user models with role-based tables.
This provides better separation of concerns and cleaner authorization.
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import json


class FirebaseUserManager(BaseUserManager):
    def create_user(self, email, firebase_uid, password=None, user_type='passenger', **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        
        email = self.normalize_email(email)
        extra_fields.setdefault('user_type', user_type)
        
        user = self.model(email=email, firebase_uid=firebase_uid, **extra_fields)
        
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, firebase_uid, password=None, **extra_fields):
        extra_fields.setdefault('user_type', 'admin')
        extra_fields.setdefault('is_superuser', True)
        
        user = self.create_user(email, firebase_uid, password, **extra_fields)
        
        # Create admin profile automatically
        Admin.objects.create(
            user=user,
            full_name=extra_fields.get('full_name', email.split('@')[0]),
            phone_number=extra_fields.get('phone_number', ''),
            admin_level='super_admin',
            can_manage_staff=True,
            can_manage_complaints=True,
            can_view_analytics=True,
            can_manage_users=True
        )
        
        return user


class FirebaseUser(AbstractBaseUser, PermissionsMixin):
    """
    Base user model for Firebase authentication.
    Contains only essential authentication fields.
    Role-specific data is stored in related tables.
    """
    USER_TYPE_CHOICES = [
        ('passenger', 'Passenger'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(unique=True, db_index=True)
    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='passenger')
    
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = FirebaseUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firebase_uid']

    class Meta:
        db_table = 'accounts_firebaseuser'
        verbose_name = 'Firebase User'
        verbose_name_plural = 'Firebase Users'
        indexes = [
            models.Index(fields=['email', 'user_type']),
            models.Index(fields=['firebase_uid']),
        ]

    def __str__(self):
        return f"{self.email} ({self.get_user_type_display()})"
    
    @property
    def is_staff(self):
        """For Django admin compatibility"""
        return self.user_type in ['staff', 'admin'] or self.is_superuser
    
    @property
    def is_admin(self):
        """Check if user is admin"""
        return self.user_type == 'admin'
    
    @property
    def is_passenger_user(self):
        """Check if user is passenger"""
        return self.user_type == 'passenger'
    
    def get_profile(self):
        """Get the appropriate profile based on user_type"""
        if self.user_type == 'passenger':
            return getattr(self, 'passenger_profile', None)
        elif self.user_type == 'staff':
            return getattr(self, 'staff_profile', None)
        elif self.user_type == 'admin':
            return getattr(self, 'admin_profile', None)
        return None


class Passenger(models.Model):
    """Passenger-specific profile information"""
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
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    address = models.TextField(max_length=500, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    aadhar_number = models.CharField(max_length=12, blank=True, help_text="Aadhaar number (optional)")
    
    # Preferences
    preferred_language = models.CharField(max_length=50, default='en')
    notification_preferences = models.JSONField(
        default=dict,
        help_text="Notification settings: {'email': True, 'sms': False, 'push': True}"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_passenger'
        verbose_name = 'Passenger'
        verbose_name_plural = 'Passengers'
    
    def __str__(self):
        return f"{self.full_name or self.user.email} - Passenger"


class Staff(models.Model):
    """Staff member profile with work-related information"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('on_leave', 'On Leave'),
        ('suspended', 'Suspended'),
    ]
    
    user = models.OneToOneField(
        FirebaseUser, 
        on_delete=models.CASCADE, 
        related_name='staff_profile',
        primary_key=True
    )
    
    # Basic Info
    employee_id = models.CharField(max_length=50, unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    
    # Work Info
    department = models.CharField(max_length=100, db_index=True, help_text="e.g., Cleanliness, Catering, Technical")
    designation = models.CharField(max_length=100, help_text="e.g., Supervisor, Manager, Technician")
    location = models.CharField(max_length=200, blank=True, help_text="Primary work location")
    avatar = models.ImageField(upload_to='staff_avatars/', null=True, blank=True)
    
    # Skills & Capabilities
    expertise = models.JSONField(
        default=list,
        help_text="List of expertise areas: ['Cleanliness', 'Electrical', 'Catering']"
    )
    languages = models.JSONField(
        default=list,
        help_text="Languages spoken: ['English', 'Hindi', 'Telugu']"
    )
    communication_preferences = models.JSONField(
        default=list,
        help_text="Preferred communication methods: ['Chat', 'Voice', 'Video']"
    )
    certifications = models.JSONField(
        default=list,
        help_text="Professional certifications: ['First Aid', 'Fire Safety']"
    )
    
    # Work Details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    joining_date = models.DateField()
    work_schedule = models.JSONField(
        default=dict,
        help_text="Weekly schedule: {'monday': '9:00-17:00', 'tuesday': '9:00-17:00', ...}"
    )
    assigned_zones = models.JSONField(
        default=list,
        help_text="Assigned work zones: ['Zone A', 'Platform 1', 'Coach AC1']"
    )
    
    # Performance Metrics
    rating = models.FloatField(default=0.0, help_text="Average rating from 0-5")
    active_tickets = models.IntegerField(default=0)
    resolved_tickets = models.IntegerField(default=0)
    average_resolution_time = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Average resolution time in minutes"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_staff'
        verbose_name = 'Staff Member'
        verbose_name_plural = 'Staff Members'
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['department', 'status']),
            models.Index(fields=['status', 'location']),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.employee_id}) - {self.department}"
    
    def increment_active_tickets(self):
        """Increment active tickets count"""
        self.active_tickets += 1
        self.save(update_fields=['active_tickets', 'updated_at'])
    
    def resolve_ticket(self):
        """Mark a ticket as resolved"""
        if self.active_tickets > 0:
            self.active_tickets -= 1
        self.resolved_tickets += 1
        self.save(update_fields=['active_tickets', 'resolved_tickets', 'updated_at'])


class Admin(models.Model):
    """Admin user profile with permissions"""
    ADMIN_LEVEL_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
    ]
    
    user = models.OneToOneField(
        FirebaseUser, 
        on_delete=models.CASCADE, 
        related_name='admin_profile',
        primary_key=True
    )
    
    # Basic Info
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    
    # Admin Level & Permissions
    admin_level = models.CharField(max_length=20, choices=ADMIN_LEVEL_CHOICES, default='admin')
    department = models.CharField(max_length=100, blank=True)
    
    # Granular Permissions
    can_manage_staff = models.BooleanField(default=True)
    can_manage_complaints = models.BooleanField(default=True)
    can_view_analytics = models.BooleanField(default=True)
    can_manage_users = models.BooleanField(default=False, help_text="Create/delete users")
    
    # Custom permissions (JSON for flexibility)
    custom_permissions = models.JSONField(
        default=dict,
        help_text="Additional custom permissions"
    )
    
    # Hierarchy
    created_by = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_admins'
    )
    
    # Activity Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_action_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'accounts_admin'
        verbose_name = 'Admin'
        verbose_name_plural = 'Admins'
        indexes = [
            models.Index(fields=['admin_level']),
        ]
    
    def __str__(self):
        return f"{self.full_name} - {self.get_admin_level_display()}"
    
    def update_last_action(self):
        """Update last action timestamp"""
        self.last_action_at = timezone.now()
        self.save(update_fields=['last_action_at'])


class StaffShift(models.Model):
    """Track staff shifts and schedules"""
    SHIFT_TYPE_CHOICES = [
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('evening', 'Evening'),
        ('night', 'Night'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('missed', 'Missed'),
        ('cancelled', 'Cancelled'),
    ]
    
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='shifts')
    shift_date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    shift_type = models.CharField(max_length=20, choices=SHIFT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_staff_shift'
        verbose_name = 'Staff Shift'
        verbose_name_plural = 'Staff Shifts'
        unique_together = [['staff', 'shift_date', 'start_time']]
        indexes = [
            models.Index(fields=['staff', 'shift_date']),
            models.Index(fields=['shift_date', 'status']),
        ]
    
    def __str__(self):
        return f"{self.staff.full_name} - {self.shift_date} ({self.shift_type})"


class StaffPerformance(models.Model):
    """Monthly performance tracking for staff"""
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='performance_records')
    month = models.DateField(help_text="First day of the month")
    
    # Performance Metrics
    tickets_resolved = models.IntegerField(default=0)
    average_resolution_time = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Average time in minutes"
    )
    customer_satisfaction = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Average rating 0-5"
    )
    response_time = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Average response time in minutes"
    )
    
    # Incidents
    escalations = models.IntegerField(default=0, help_text="Cases escalated to higher authority")
    commendations = models.IntegerField(default=0, help_text="Positive recognitions")
    warnings = models.IntegerField(default=0, help_text="Disciplinary warnings")
    
    # Notes
    performance_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_staff_performance'
        verbose_name = 'Staff Performance'
        verbose_name_plural = 'Staff Performance Records'
        unique_together = [['staff', 'month']]
        indexes = [
            models.Index(fields=['staff', 'month']),
            models.Index(fields=['month']),
        ]
    
    def __str__(self):
        return f"{self.staff.full_name} - {self.month.strftime('%B %Y')}"
