import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

# Check accounts_staff
cursor.execute('SELECT COUNT(*) FROM accounts_staff')
accounts_count = cursor.fetchone()[0]

# Check complaints_staff  
cursor.execute('SELECT COUNT(*) FROM complaints_staff')
complaints_count = cursor.fetchone()[0]

print(f'accounts_staff table: {accounts_count} records')
print(f'complaints_staff table: {complaints_count} records')
print()

print('Records in complaints_staff:')
cursor.execute('SELECT id, name, email, role FROM complaints_staff LIMIT 10')
for row in cursor.fetchall():
    print(f'  ID: {row[0]}, Name: {row[1]}, Email: {row[2]}, Role: {row[3]}')

print()
print('Records in accounts_staff:')
cursor.execute('SELECT user_id, full_name, phone_number, role, email FROM accounts_staff LIMIT 10')
for row in cursor.fetchall():
    print(f'  User ID: {row[0]}, Name: {row[1]}, Phone: {row[2]}, Role: {row[3]}, Email: {row[4]}')
