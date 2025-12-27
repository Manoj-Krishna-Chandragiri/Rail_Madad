"""Manually add is_passenger column using Django's raw SQL"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    try:
        # Try to add the column
        print("Attempting to add is_passenger column...")
        cursor.execute('''
            ALTER TABLE accounts_firebaseuser 
            ADD COLUMN is_passenger TINYINT(1) NOT NULL DEFAULT 1
        ''')
        print("[SUCCESS] Column added successfully!")
        
    except Exception as e:
        if '1060' in str(e) or 'Duplicate column' in str(e):
            print("[INFO] Column already exists!")
        else:
            print(f"[ERROR] {e}")
            raise
    
    # Verify the column exists
    print("\nVerifying table structure...")
    cursor.execute("SHOW COLUMNS FROM accounts_firebaseuser")
    columns = cursor.fetchall()
    print("\nTable columns:")
    for col in columns:
        print(f"  - {col[0]}: {col[1]}")
    
    # Check if is_passenger is there
    has_is_passenger = any(col[0] == 'is_passenger' for col in columns)
    if has_is_passenger:
        print("\n[SUCCESS] is_passenger column verified!")
    else:
        print("\n[ERROR] is_passenger column NOT found!")
