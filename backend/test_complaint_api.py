import os
import sys
import django

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Complaint
from complaints.serializers import ComplaintSerializer

# Get all complaints for user ID 4 (chandrakiranponnapalli@gmail.com)
user_id = 4
print(f"\n[Checking complaints for user ID {user_id}]", flush=True)

complaints = Complaint.objects.filter(user_id=user_id).order_by('-created_at')
print(f"Found {complaints.count()} complaints", flush=True)

if complaints.exists():
    print("\n[Serializing complaints]", flush=True)
    serializer = ComplaintSerializer(complaints, many=True)
    data = serializer.data
    
    print(f"Serialized data type: {type(data)}", flush=True)
    print(f"Serialized data length: {len(data)}", flush=True)
    print(f"\n[First complaint data]:", flush=True)
    if data:
        import json
        print(json.dumps(data[0], indent=2, default=str), flush=True)
else:
    print("No complaints found for this user", flush=True)

# Also check all complaints
print(f"\n[All complaints in database]", flush=True)
all_complaints = Complaint.objects.all()
print(f"Total: {all_complaints.count()}", flush=True)
for c in all_complaints:
    print(f"  ID {c.id}: User {c.user_id}, Type: {c.type}, Status: {c.status}", flush=True)
