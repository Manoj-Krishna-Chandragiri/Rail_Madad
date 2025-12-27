"""Check complaints in SQLite database"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Complaint
from accounts.models import FirebaseUser

print("=" * 70, flush=True)
print("CHECKING COMPLAINTS DATABASE", flush=True)
print("=" * 70, flush=True)

# Check users
print("\n[USERS]", flush=True)
users = FirebaseUser.objects.all()
for user in users:
    print(f"  ID {user.id}: {user.email} (is_passenger={user.is_passenger})", flush=True)

# Check complaints
print("\n[COMPLAINTS]", flush=True)
complaints = Complaint.objects.all().order_by('-created_at')[:10]
print(f"Total complaints: {Complaint.objects.count()}", flush=True)

if complaints:
    for c in complaints:
        print(f"\n  Complaint #{c.id}", flush=True)
        print(f"    User ID: {c.user_id}", flush=True)
        print(f"    Type: {c.type}", flush=True)
        print(f"    Status: {c.status}", flush=True)
        print(f"    Description: {c.description[:50] if c.description else 'N/A'}...", flush=True)
        print(f"    Created: {c.created_at}", flush=True)
else:
    print("  No complaints found!", flush=True)

print("\n" + "=" * 70, flush=True)
