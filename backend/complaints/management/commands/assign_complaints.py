"""
Management command to assign unassigned complaints
"""

from django.core.management.base import BaseCommand
from django.db import models
from complaints.models import Complaint, Staff
from complaints.assignment_service import ComplaintAssignmentService


class Command(BaseCommand):
    help = 'Assign all unassigned complaints to active staff members'

    def handle(self, *args, **options):
        # Find unassigned complaints
        unassigned = Complaint.objects.filter(
            models.Q(staff__isnull=True) | 
            models.Q(staff='') | 
            models.Q(staff='Unassigned')
        )
        
        self.stdout.write(f'Found {unassigned.count()} unassigned complaints')
        
        assigned_count = 0
        
        for complaint in unassigned:
            try:
                # Try smart assignment
                complaint_category = complaint.type or 'miscellaneous'
                severity = complaint.severity or 'Medium'
                
                staff_name, staff_id = ComplaintAssignmentService.assign_complaint(
                    complaint_category=complaint_category,
                    severity=severity
                )
                
                if staff_name:
                    complaint.staff = staff_name
                    complaint.save()
                    self.stdout.write(self.style.SUCCESS(
                        f'✅ CMP{complaint.id:03d}: Assigned to {staff_name}'
                    ))
                    assigned_count += 1
                else:
                    # Fallback
                    any_staff = Staff.objects.filter(status='active').first()
                    if any_staff:
                        complaint.staff = any_staff.name
                        complaint.save()
                        self.stdout.write(self.style.SUCCESS(
                            f'✅ CMP{complaint.id:03d}: Assigned to {any_staff.name} (fallback)'
                        ))
                        assigned_count += 1
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f'❌ CMP{complaint.id:03d}: {e}'
                ))
        
        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Successfully assigned {assigned_count}/{unassigned.count()} complaints'
        ))
