import os
import sys
import django
import json

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Staff
from complaints.serializers import StaffSerializer

print("\n[STAFF DATA IN DATABASE]", flush=True)
print("=" * 60, flush=True)

staff_members = Staff.objects.all()
print(f"Total staff members: {staff_members.count()}", flush=True)

if staff_members.exists():
    for staff in staff_members:
        print(f"\nID: {staff.id}", flush=True)
        print(f"Name: {staff.name}", flush=True)
        print(f"Email: {staff.email}", flush=True)
        print(f"Phone: {staff.phone}", flush=True)
        print(f"Role: {staff.role}", flush=True)
        print(f"Department: {staff.department}", flush=True)
        print(f"Location: {staff.location}", flush=True)
        print(f"Status: {staff.status}", flush=True)
        print(f"Expertise: {staff.expertise}", flush=True)
        print(f"Languages: {staff.languages}", flush=True)
        
    print("\n[SERIALIZED DATA (API Response)]", flush=True)
    print("=" * 60, flush=True)
    serializer = StaffSerializer(staff_members, many=True)
    print(json.dumps(serializer.data, indent=2), flush=True)
else:
    print("No staff members found in database!", flush=True)
