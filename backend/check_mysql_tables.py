import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()
cursor.execute("SHOW TABLES LIKE 'accounts_%'")
tables = cursor.fetchall()

print("Tables in MySQL database:")
print("=" * 50)
for table in tables:
    print(table[0])
