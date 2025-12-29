"""
Check staff data and relationships
"""
import django
import os
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import Staff, FirebaseUser
from django.db import connection

print("\n" + "="*70)
print("STAFF DATA CHECK")
print("="*70)

print("\n1. All Staff Records:")
print("-" * 70)

for staff in Staff.objects.all():
    print(f"\nStaff user_id: {staff.user_id}")
    print(f"  Full Name: {staff.full_name}")
    print(f"  Email: {staff.email}")
    try:
        print(f"  User FK exists: {staff.user is not None}")
        print(f"  User FK id: {staff.user.id}")
        print(f"  User FK email: {staff.user.email}")
    except Exception as e:
        print(f"  ⚠️ Error accessing user FK: {str(e)}")

print("\n2. Test Serialization:")
print("-" * 70)

try:
    from accounts.serializers import StaffSerializer
    staffs = Staff.objects.select_related('user').all()
    serializer = StaffSerializer(staffs, many=True)
    print("✓ Serialization successful")
    print(f"  Serialized {len(serializer.data)} staff members")
    for staff_data in serializer.data:
        print(f"  - user_id: {staff_data.get('user_id')}, name: {staff_data.get('full_name')}")
except Exception as e:
    print(f"✗ Serialization failed: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70 + "\n")
