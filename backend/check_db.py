import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from complaints.models import Complaint
from accounts.models import FirebaseUser

print(f"Database Engine: {connection.settings_dict['ENGINE']}")
print(f"Database Host: {connection.settings_dict.get('HOST', 'N/A')}")
print(f"Database Name: {connection.settings_dict.get('NAME', 'N/A')}")

# Test connection
with connection.cursor() as cursor:
    cursor.execute("SELECT 1")
    print("✅ Database connection successful!")

# Count records
complaint_count = Complaint.objects.count()
user_count = FirebaseUser.objects.count()

print(f"\n📊 Database Statistics:")
print(f"  Total Complaints: {complaint_count}")
print(f"  Total Users: {user_count}")

# Show some sample data
if complaint_count > 0:
    print(f"\nFirst 5 complaints:")
    for c in Complaint.objects.all()[:5]:
        print(f"  - ID:{c.id} | Type:{c.type} | Status:{c.status} | Severity:{c.severity}")
