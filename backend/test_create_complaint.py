import os
import sys
import django
from datetime import datetime

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Complaint
from accounts.models import FirebaseUser

# Check user ID 4
try:
    user = FirebaseUser.objects.get(id=4)
    print(f"✓ User found: {user.email} (ID: {user.id})", flush=True)
    
    # Create a test complaint
    complaint = Complaint.objects.create(
        user_id=4,
        type='coach-cleanliness',
        description='Test complaint from script',
        train_number='12345',
        pnr_number='1234567890',
        location='Test Station',
        date_of_incident=datetime.now(),
        status='Open',
        priority='Medium'
    )
    print(f"✓ Created complaint #{complaint.id}", flush=True)
    
    # Verify it was saved
    saved = Complaint.objects.filter(user_id=4)
    print(f"✓ User 4 now has {saved.count()} complaint(s)", flush=True)
    
except FirebaseUser.DoesNotExist:
    print("✗ User ID 4 not found!", flush=True)
except Exception as e:
    print(f"✗ Error: {e}", flush=True)
