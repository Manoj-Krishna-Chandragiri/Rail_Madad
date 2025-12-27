import os
import sys
import django
from django.db import connection

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
os.environ['USE_SQLITE'] = 'False'
django.setup()

print("="*70)
print("MIGRATION VERIFICATION - MySQL Database")
print("="*70)
print()

with connection.cursor() as cursor:
    # Count records in each table
    cursor.execute("SELECT COUNT(*) FROM accounts_firebaseuser")
    firebase_users = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM accounts_admin")
    admin_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM accounts_staff")
    staff_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM accounts_passenger")
    passenger_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM complaints_complaint")
    complaint_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM complaints_assignment")
    assignment_count = cursor.fetchone()[0]
    
    print("User Accounts:")
    print(f"  FirebaseUser accounts: {firebase_users}")
    print(f"  Admin profiles: {admin_count}")
    print(f"  Staff profiles: {staff_count}")
    print(f"  Passenger profiles: {passenger_count}")
    print()
    
    print("Complaints:")
    print(f"  Total complaints: {complaint_count}")
    print(f"  Complaint assignments: {assignment_count}")
    print()
    
    # Sample admin users
    print("Sample Admin Users:")
    cursor.execute("""
        SELECT a.user_id, u.email, u.full_name
        FROM accounts_admin a
        JOIN accounts_firebaseuser u ON a.user_id = u.id
        LIMIT 3
    """)
    for row in cursor.fetchall():
        print(f"  - {row[1]} (Admin ID: {row[0]})")
    print()
    
    # Sample staff members
    print("Sample Staff Members:")
    cursor.execute("""
        SELECT s.user_id, u.email, u.full_name, s.department, s.location
        FROM accounts_staff s
        JOIN accounts_firebaseuser u ON s.user_id = u.id
    """)
    for row in cursor.fetchall():
        name = row[2] or row[1]
        print(f"  - {name} (Staff ID: {row[0]})")
        print(f"    Department: {row[3]}, Location: {row[4]}")
    print()
    
    # Sample passengers
    print("Sample Passengers:")
    cursor.execute("""
        SELECT p.user_id, u.email, u.full_name
        FROM accounts_passenger p
        JOIN accounts_firebaseuser u ON p.user_id = u.id
        LIMIT 3
    """)
    for row in cursor.fetchall():
        print(f"  - {row[1]} (Passenger ID: {row[0]})")
    print()

print("="*70)
print("✓ MIGRATION VERIFICATION COMPLETE")
print("="*70)
