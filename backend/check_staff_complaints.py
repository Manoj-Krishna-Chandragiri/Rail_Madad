import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Complaint, Staff

print("\n" + "="*70)
print("STAFF COMPLAINTS CHECK")
print("="*70)

# Get all staff
staff_members = Staff.objects.filter(status='active')
print(f"\nTotal Active Staff: {staff_members.count()}")

# Check complaints assigned to staff
complaints_with_staff = Complaint.objects.exclude(staff__isnull=True).exclude(staff='')
print(f"Total Complaints with Staff Assigned: {complaints_with_staff.count()}\n")

# Show sample complaints
print("Sample Complaints:")
for complaint in complaints_with_staff[:10]:
    print(f"  ID {complaint.id}: {complaint.type[:40]}")
    print(f"    Staff: {complaint.staff}")
    print(f"    Status: {complaint.status}, Severity: {complaint.severity}")
    print()

# Count complaints per staff member
print("\nComplaints per Staff Member:")
for staff in staff_members:
    count = Complaint.objects.filter(staff=staff.name).count()
    if count > 0:
        print(f"  {staff.name}: {count} complaints")
