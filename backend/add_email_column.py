import os
import django
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Add email column to accounts_staff table
with connection.cursor() as cursor:
    try:
        # Check if column already exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'accounts_staff' 
            AND COLUMN_NAME = 'email'
        """)
        exists = cursor.fetchone()[0]
        
        if exists:
            print("✅ Email column already exists in accounts_staff table")
        else:
            # Add email column
            cursor.execute("""
                ALTER TABLE accounts_staff 
                ADD COLUMN email VARCHAR(254) NOT NULL DEFAULT ''
            """)
            print("✅ Successfully added email column to accounts_staff table")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n📋 Current accounts_staff table structure:")
with connection.cursor() as cursor:
    cursor.execute("DESCRIBE accounts_staff")
    columns = cursor.fetchall()
    for col in columns:
        print(f"  - {col[0]}: {col[1]} {'NOT NULL' if col[2] == 'NO' else 'NULL'}")
