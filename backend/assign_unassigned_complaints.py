"""
Script to assign existing unassigned complaints to active staff members
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Complaint, Staff
from complaints.assignment_service import ComplaintAssignmentService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def assign_unassigned_complaints():
    """Find and assign all unassigned complaints"""
    
    # Find unassigned complaints
    unassigned = Complaint.objects.filter(
        models.Q(staff__isnull=True) | 
        models.Q(staff='') | 
        models.Q(staff='Unassigned') |
        models.Q(staff='Customer Service') |  # Legacy department assignments
        models.Q(staff='Technical Support')
    )
    
    logger.info(f"Found {unassigned.count()} unassigned complaints")
    
    assigned_count = 0
    failed_count = 0
    
    for complaint in unassigned:
        try:
            # Try smart assignment based on complaint type/category
            complaint_category = complaint.type or 'miscellaneous'
            severity = complaint.severity or 'Medium'
            
            staff_name, staff_id = ComplaintAssignmentService.assign_complaint(
                complaint_category=complaint_category,
                severity=severity
            )
            
            if staff_name:
                complaint.staff = staff_name
                complaint.save()
                logger.info(f"✅ CMP{complaint.id:03d}: Assigned to {staff_name}")
                assigned_count += 1
            else:
                # Fallback: assign to any active staff
                any_staff = Staff.objects.filter(status='active').first()
                if any_staff:
                    complaint.staff = any_staff.name
                    complaint.save()
                    logger.info(f"✅ CMP{complaint.id:03d}: Assigned to {any_staff.name} (fallback)")
                    assigned_count += 1
                else:
                    logger.warning(f"⚠️ CMP{complaint.id:03d}: No active staff available")
                    failed_count += 1
                    
        except Exception as e:
            logger.error(f"❌ CMP{complaint.id:03d}: Assignment failed - {e}")
            failed_count += 1
    
    logger.info(f"\n📊 Assignment Summary:")
    logger.info(f"  ✅ Successfully assigned: {assigned_count}")
    logger.info(f"  ❌ Failed: {failed_count}")
    logger.info(f"  📋 Total processed: {unassigned.count()}")

if __name__ == '__main__':
    from django.db import models
    assign_unassigned_complaints()
