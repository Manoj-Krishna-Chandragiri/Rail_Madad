"""
Add this to complaints/models.py for complaint-staff assignment tracking
"""

from django.db import models
from django.utils import timezone


class ComplaintAssignment(models.Model):
    """Track complaint assignments to staff members"""
    
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('escalated', 'Escalated'),
        ('completed', 'Completed'),
        ('reassigned', 'Reassigned'),
    ]
    
    complaint_id = models.IntegerField()  # FK to Complaint
    staff_id = models.IntegerField()  # FK to Staff
    assigned_by_id = models.IntegerField(null=True, blank=True)  # FK to Admin
    assigned_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    notes = models.TextField(blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'complaints_assignment'
        verbose_name = 'Complaint Assignment'
        verbose_name_plural = 'Complaint Assignments'
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"Complaint {self.complaint_id} -> Staff {self.staff_id} ({self.status})"
