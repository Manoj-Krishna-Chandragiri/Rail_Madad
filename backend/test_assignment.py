"""
Test script to verify smart assignment system
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Complaint, Staff
from complaints.assignment_service import ComplaintAssignmentService

print("\n" + "="*70)
print("SMART COMPLAINT ASSIGNMENT SYSTEM TEST")
print("="*70)

# Show all staff members
print("\n📋 Available Staff Members:")
print("-" * 70)
staff_members = Staff.objects.filter(status='active')
for staff in staff_members:
    complaints = Complaint.objects.filter(staff=staff.name, status__in=['Open', 'In Progress']).count()
    expertise = ComplaintAssignmentService.get_staff_expertise(staff)
    print(f"  • {staff.name:25} | Complaints: {complaints:2} | Expertise: {', '.join(expertise[:2])}")

# Test assignment for different categories
test_categories = [
    ('security', 'High'),
    ('medical', 'High'),
    ('coach-cleanliness', 'Medium'),
    ('electrical', 'Medium'),
    ('catering', 'Low'),
]

print("\n\n🧪 Testing Assignment Algorithm:")
print("-" * 70)
for category, severity in test_categories:
    staff_name, staff_id = ComplaintAssignmentService.assign_complaint(category, severity)
    print(f"  Category: {category:20} Severity: {severity:8} → Assigned to: {staff_name}")

print("\n✅ Test Complete!\n")
