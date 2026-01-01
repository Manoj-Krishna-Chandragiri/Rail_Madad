from django.db import models
from django.conf import settings
from django.utils import timezone
import os

def staff_avatar_path(instance, filename):
    # Generate a unique filename
    ext = filename.split('.')[-1]
    new_filename = f"staff_{instance.id}_{timezone.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    return os.path.join('staff_avatars', new_filename)

class Complaint(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Closed', 'Closed'),
    ]
 
    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
 
    type = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True, null=True)
    train_number = models.CharField(max_length=20, blank=True, null=True)
    pnr_number = models.CharField(max_length=20, blank=True, null=True)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='Medium')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    date_of_incident = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    staff = models.CharField(max_length=255, blank=True, null=True)
    photos = models.CharField(max_length=255, blank=True, null=True)  # Increased max_length
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Add fields for admin interaction
    resolution_notes = models.TextField(blank=True, null=True)
    resolved_by = models.CharField(max_length=255, blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    has_feedback = models.BooleanField(default=False)
 
    def save(self, *args, **kwargs):
        # If status is changing to closed, record resolution time
        if self.pk:
            old_instance = Complaint.objects.get(pk=self.pk)
            if old_instance.status != 'closed' and self.status == 'closed':
                from django.utils import timezone
                self.resolved_at = timezone.now()
        
        # Don't modify the photos path as it's now handled in the view
        super().save(*args, **kwargs)
 
    def __str__(self):
        return f"{self.type} - {self.status}"

class Feedback(models.Model):
    complaint_id = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    subcategory = models.CharField(max_length=100)
    feedback_message = models.TextField()
    rating = models.IntegerField()
    name = models.CharField(max_length=100)
    email = models.EmailField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    # Sentiment analysis fields
    sentiment = models.CharField(max_length=20, blank=True, null=True)
    sentiment_confidence = models.FloatField(blank=True, null=True)
    
    # Link to staff who resolved the complaint
    staff = models.ForeignKey('Staff', on_delete=models.SET_NULL, null=True, blank=True, related_name='feedbacks')
 
    def __str__(self):
        return f"{self.name} - {self.complaint_id}"

class Staff(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    employee_id = models.CharField(max_length=50, blank=True, null=True)  # Added field
    department = models.CharField(max_length=50)
    role = models.CharField(max_length=50)
    location = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.ImageField(upload_to=staff_avatar_path, blank=True, null=True)
    status = models.CharField(
        max_length=20, 
        choices=[('active', 'Active'), ('inactive', 'Inactive'), ('on-leave', 'On Leave')],
        default='active'
    )
    joining_date = models.DateField(auto_now_add=True)
    expertise = models.TextField(blank=True, null=True)  # Stored as JSON string
    languages = models.TextField(blank=True, null=True)  # Stored as JSON string
    communication_preferences = models.TextField(blank=True, null=True, default='["Chat"]')  # Stored as JSON string
    rating = models.FloatField(default=0)
    active_tickets = models.IntegerField(default=0)
    performance_metrics = models.TextField(blank=True, null=True, default='{}')  # Stored as JSON string
    notes = models.TextField(blank=True, null=True)  # Added field
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)  # Added field

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Staff"

class QuickSolution(models.Model):
    problem = models.CharField(max_length=200)
    solution = models.TextField()
    category = models.CharField(max_length=100)
    resolution_time = models.CharField(max_length=50)
    success_rate = models.FloatField(default=0.0)
    usage_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.problem} - {self.category}"

    class Meta:
        verbose_name_plural = "Quick Solutions"


class Notification(models.Model):
    """
    Notification model for tracking user notifications
    """
    NOTIFICATION_TYPES = (
        ('complaint_assigned', 'Complaint Assigned'),
        ('complaint_resolved', 'Complaint Resolved'),
        ('status_update', 'Status Update'),
        ('feedback_request', 'Feedback Request'),
        ('system', 'System Notification'),
    )
    
    user_email = models.EmailField()
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_id = models.CharField(max_length=100, blank=True, null=True)
    action_url = models.CharField(max_length=500, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.user_email} - {self.title}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Notifications"


class NotificationPreference(models.Model):
    """Model to store user notification preferences"""
    user_email = models.EmailField(unique=True)
    email_alerts = models.BooleanField(default=True)  # Get email notifications for complaint updates
    status_updates = models.BooleanField(default=True)  # Receive updates when complaint status changes
    marketing_emails = models.BooleanField(default=False)  # Receive promotional and newsletter emails
    announcements = models.BooleanField(default=True)  # Get notifications about system announcements
    feedback_notifications = models.BooleanField(default=True)  # Get feedback received notifications
    assignment_notifications = models.BooleanField(default=True)  # Get notified when complaint assigned
    resolution_notifications = models.BooleanField(default=True)  # Get notified when complaint resolved
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification Preferences - {self.user_email}"
    
    class Meta:
        verbose_name_plural = "Notification Preferences"


# Import assignment model so Django recognizes it
from .models_assignment import ComplaintAssignment