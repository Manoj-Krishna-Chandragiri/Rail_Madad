import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Complaint
from django.db import connection

print(f"Table Django is using: {Complaint._meta.db_table}")

# Check all tables in database
with connection.cursor() as cursor:
    cursor.execute('SHOW TABLES')
    tables = cursor.fetchall()
    print(f"\nAll tables in database:")
    for table in tables:
        print(f"  - {table[0]}")

# Try to get complaint count
print(f"\nQuerying Complaint.objects.count()...")
count = Complaint.objects.count()
print(f"Django ORM sees {count} complaints")

# Try raw SQL
print(f"\nDirect SQL query on complaints_complaint table:")
with connection.cursor() as cursor:
    cursor.execute('SELECT COUNT(*) FROM complaints_complaint')
    raw_count = cursor.fetchone()[0]
    print(f"Raw SQL sees {raw_count} complaints")
