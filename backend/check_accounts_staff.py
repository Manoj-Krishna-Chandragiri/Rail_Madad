import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

print('accounts_staff table structure:')
cursor.execute('DESCRIBE accounts_staff')
for row in cursor.fetchall():
    print(f'  {row[0]}: {row[1]}')

print('\naccounts_staff records:')
cursor.execute('SELECT * FROM accounts_staff LIMIT 5')
columns = [desc[0] for desc in cursor.description]
print(f'  Columns: {", ".join(columns)}')
for row in cursor.fetchall():
    print(f'  {row}')
