"""
Manually migrate data to role tables for MySQL using direct SQL
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
os.environ['USE_SQLITE'] = 'False'
django.setup()

from django.db import connection
from accounts.models import FirebaseUser
from complaints.models import Staff as OldStaff

print("=" * 70)
print("MANUAL DATA MIGRATION TO ROLE TABLES (MySQL)")
print("=" * 70)

cursor = connection.cursor()

# 1. Migrate Admin Users
print("\n1. Migrating Admin Users...")
admin_users = FirebaseUser.objects.filter(is_admin=True)
print(f"Found {admin_users.count()} admin users")

for user in admin_users:
    # Check if exists
    cursor.execute("SELECT COUNT(*) FROM accounts_admin WHERE user_id = %s", [user.id])
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO accounts_admin 
            (user_id, full_name, phone_number, department, designation, employee_id, super_admin, permissions, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, [
            user.id,
            user.full_name or user.email.split('@')[0],
            user.phone_number or '',
            '',
            '',
            None,
            user.is_super_admin,
            '["all"]' if user.is_super_admin else '[]'
        ])
        print(f"   ✓ Created admin profile for: {user.email}")
    else:
        print(f"   - Admin profile already exists for: {user.email}")

# 2. Migrate Staff
print("\n2. Migrating Staff Members...")
old_staff = OldStaff.objects.all()
print(f"Found {old_staff.count()} staff members")

for staff in old_staff:
    # Get or create FirebaseUser
    user, created = FirebaseUser.objects.get_or_create(
        email=staff.email,
        defaults={
            'firebase_uid': f'staff_{staff.id}_{staff.email}',
            'is_active': True,
        }
    )
    
    if created:
        print(f"   + Created FirebaseUser for: {staff.email}")
    
    # Check if staff profile exists
    cursor.execute("SELECT COUNT(*) FROM accounts_staff WHERE user_id = %s", [user.id])
    if cursor.fetchone()[0] == 0:
        import json
        expertise_str = json.dumps(json.loads(staff.expertise) if isinstance(staff.expertise, str) else (staff.expertise or []))
        languages_str = json.dumps(json.loads(staff.languages) if isinstance(staff.languages, str) else (staff.languages or []))
        comm_prefs = staff.communication_preferences
        comm_prefs_str = json.dumps(json.loads(comm_prefs) if isinstance(comm_prefs, str) else (comm_prefs or ['Chat']))
        
        cursor.execute("""
            INSERT INTO accounts_staff 
            (user_id, full_name, phone_number, employee_id, department, role, location, avatar, status,
             joining_date, expertise, languages, communication_preferences, rating, active_tickets, 
             shift_timings, reporting_to_id, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, [
            user.id,
            staff.name,
            staff.phone or '',
            f'EMP{staff.id:04d}',
            staff.department or 'General',
            staff.role or 'staff',
            staff.location or '',
            staff.avatar or '',
            staff.status or 'active',
            staff.joining_date,
            expertise_str,
            languages_str,
            comm_prefs_str,
            staff.rating or 0.0,
            staff.active_tickets or 0,
            '{}',
            None
        ])
        print(f"   ✓ Created staff profile for: {staff.name} ({staff.email})")
    else:
        print(f"   - Staff profile already exists for: {staff.email}")

# 3. Migrate Passengers
print("\n3. Migrating Passenger Users...")
passenger_users = FirebaseUser.objects.filter(is_passenger=True)
print(f"Found {passenger_users.count()} passenger users")

for user in passenger_users:
    cursor.execute("SELECT COUNT(*) FROM accounts_passenger WHERE user_id = %s", [user.id])
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO accounts_passenger 
            (user_id, full_name, phone_number, gender, date_of_birth, address, city, state, pincode,
             preferred_language, notification_preferences, frequent_routes, total_complaints, 
             resolved_complaints, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, [
            user.id,
            user.full_name or '',
            user.phone_number or '',
            user.gender or '',
            None,
            user.address or '',
            '',
            '',
            '',
            'en',
            '{}',
            '[]',
            0,
            0
        ])
        print(f"   ✓ Created passenger profile for: {user.email}")
    else:
        print(f"   - Passenger profile already exists for: {user.email}")

# 4. Verification
print("\n" + "=" * 70)
print("MIGRATION SUMMARY")
print("=" * 70)

cursor.execute("SELECT COUNT(*) FROM accounts_firebaseuser")
print(f"Total FirebaseUsers: {cursor.fetchone()[0]}")

cursor.execute("SELECT COUNT(*) FROM accounts_admin")
print(f"Admin Profiles: {cursor.fetchone()[0]}")

cursor.execute("SELECT COUNT(*) FROM accounts_staff")
print(f"Staff Profiles: {cursor.fetchone()[0]}")

cursor.execute("SELECT COUNT(*) FROM accounts_passenger")
print(f"Passenger Profiles: {cursor.fetchone()[0]}")

print("\n✓ DATA MIGRATION COMPLETE!")
print("✓ Using MySQL database: defaultdb")

