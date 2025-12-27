import os
import sys
import django

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Complaint

# Delete test complaint #12
try:
    complaint = Complaint.objects.get(id=12)
    print(f"Deleting: {complaint.description}", flush=True)
    complaint.delete()
    print("✓ Deleted complaint #12", flush=True)
except Complaint.DoesNotExist:
    print("Complaint #12 doesn't exist", flush=True)

# Show remaining complaints for user 4
user4_complaints = Complaint.objects.filter(user_id=4)
print(f"\nUser 4 now has {user4_complaints.count()} complaints", flush=True)
