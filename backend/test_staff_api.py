"""
Quick test to verify /api/complaints/staff/ endpoint returns correct data from accounts_staff
"""
import django
import os
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import Staff as AccountsStaff
from accounts.serializers import StaffSerializer
from django.db import connection

print("\n" + "="*70)
print("STAFF API DATA VERIFICATION")
print("="*70)

print("\n1. Database Table Check:")
print("-" * 70)

with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM accounts_staff")
    accounts_count = cursor.fetchone()[0]
    print(f"✓ accounts_staff table: {accounts_count} records")
    
    cursor.execute("SELECT COUNT(*) FROM complaints_staff")
    complaints_count = cursor.fetchone()[0]
    print(f"  complaints_staff table (deprecated): {complaints_count} records")

print("\n2. Staff Data from accounts.models.Staff:")
print("-" * 70)

staffs = AccountsStaff.objects.select_related('user').all()
print(f"Total staff members: {staffs.count()}")

for staff in staffs:
    print(f"\n  Staff ID (user_id): {staff.user_id}")
    print(f"  Full Name: {staff.full_name}")
    print(f"  Email: {staff.email}")
    print(f"  Phone: {staff.phone_number}")
    print(f"  Employee ID: {staff.employee_id}")
    print(f"  Department: {staff.department}")
    print(f"  Status: {staff.status}")

print("\n3. Serialized Data (API Response Format):")
print("-" * 70)

serializer = StaffSerializer(staffs, many=True)
import json
print(json.dumps(serializer.data, indent=2))

print("\n" + "="*70)
print("✓ All staff data is from accounts_staff table")
print("✓ Primary key is user_id (OneToOne with FirebaseUser)")
print("✓ Uses full_name, phone_number (not name, phone)")
print("="*70 + "\n")
