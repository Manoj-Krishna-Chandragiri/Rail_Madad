import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
os.environ['USE_SQLITE'] = 'False'
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    print("accounts_admin columns:")
    cursor.execute('DESCRIBE accounts_admin')
    for row in cursor.fetchall():
        print(f'  {row[0]} - {row[1]}')
    
    print("\naccounts_staff columns:")
    cursor.execute('DESCRIBE accounts_staff')
    for row in cursor.fetchall():
        print(f'  {row[0]} - {row[1]}')
    
    print("\naccounts_passenger columns:")
    cursor.execute('DESCRIBE accounts_passenger')
    for row in cursor.fetchall():
        print(f'  {row[0]} - {row[1]}')
