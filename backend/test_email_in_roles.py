import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
os.environ['USE_SQLITE'] = 'False'
django.setup()

from django.db import connection

print("\n" + "="*70)
print("DIRECT ROLE TABLE QUERIES (WITH EMAIL)")
print("="*70)

with connection.cursor() as cursor:
    print("\n1. ADMINS (from accounts_admin table only):")
    print("-" * 70)
    cursor.execute("""
        SELECT email, full_name, department, designation, super_admin
        FROM accounts_admin
        LIMIT 5
    """)
    print(f"{'Email':<35} {'Name':<20} {'Department':<15}")
    print("-" * 70)
    for row in cursor.fetchall():
        email, name, dept, desig, super_admin = row
        role = "Super Admin" if super_admin else "Admin"
        print(f"{email:<35} {name:<20} {dept or 'N/A':<15}")
    
    print("\n2. STAFF (from accounts_staff table only):")
    print("-" * 70)
    cursor.execute("""
        SELECT email, full_name, department, role, location, status
        FROM accounts_staff
    """)
    print(f"{'Email':<35} {'Name':<20} {'Department':<20}")
    print("-" * 70)
    for row in cursor.fetchall():
        email, name, dept, role, location, status = row
        print(f"{email:<35} {name:<20} {dept:<20}")
    
    print("\n3. PASSENGERS (from accounts_passenger table only):")
    print("-" * 70)
    cursor.execute("""
        SELECT email, full_name, city, state, total_complaints
        FROM accounts_passenger
        LIMIT 5
    """)
    print(f"{'Email':<35} {'Name':<20} {'Location':<20}")
    print("-" * 70)
    for row in cursor.fetchall():
        email, name, city, state, complaints = row
        location = f"{city or ''}, {state or ''}" if (city or state) else "N/A"
        print(f"{email:<35} {name or 'N/A':<20} {location:<20}")

print("\n" + "="*70)
print("✓ Email field is now available in all role tables!")
print("✓ You can query role tables directly without joining FirebaseUser")
print("="*70)
