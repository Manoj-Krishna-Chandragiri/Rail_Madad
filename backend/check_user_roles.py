import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
os.environ['USE_SQLITE'] = 'False'
django.setup()

from django.db import connection

def check_user_roles(email):
    """Check if a user exists and what roles they have"""
    with connection.cursor() as cursor:
        # Find user by email
        cursor.execute("""
            SELECT id, email, full_name, is_admin, is_super_admin, is_passenger
            FROM accounts_firebaseuser
            WHERE email = %s
        """, [email])
        
        user = cursor.fetchone()
        if not user:
            print(f"❌ User not found: {email}")
            return
        
        user_id, email, full_name, is_admin, is_super_admin, is_passenger = user
        
        print(f"\n{'='*70}")
        print(f"User: {email}")
        print(f"Name: {full_name}")
        print(f"User ID: {user_id}")
        print(f"{'='*70}")
        
        # Check if they have admin profile
        cursor.execute("""
            SELECT user_id, department, designation, super_admin
            FROM accounts_admin
            WHERE user_id = %s
        """, [user_id])
        admin = cursor.fetchone()
        
        # Check if they have staff profile
        cursor.execute("""
            SELECT user_id, department, role, location, status
            FROM accounts_staff
            WHERE user_id = %s
        """, [user_id])
        staff = cursor.fetchone()
        
        # Check if they have passenger profile
        cursor.execute("""
            SELECT user_id, city, state, total_complaints
            FROM accounts_passenger
            WHERE user_id = %s
        """, [user_id])
        passenger = cursor.fetchone()
        
        print("\nRoles:")
        if admin:
            print(f"  ✅ ADMIN - Department: {admin[1]}, Designation: {admin[2]}")
        else:
            print(f"  ❌ Not an Admin")
            
        if staff:
            print(f"  ✅ STAFF - Department: {staff[1]}, Role: {staff[2]}, Location: {staff[3]}")
        else:
            print(f"  ❌ Not Staff")
            
        if passenger:
            print(f"  ✅ PASSENGER - Location: {passenger[1]}, {passenger[2]}, Complaints: {passenger[3]}")
        else:
            print(f"  ❌ Not a Passenger")
        
        print()

# Test with sample emails
print("\n" + "="*70)
print("USER ROLE CHECKER")
print("="*70)

test_emails = [
    'akram.dcme@gmail.com',
    'manojkrishnachandragiri@gmail.com',
    'chandragirimanoj999@gmail.com'
]

for email in test_emails:
    check_user_roles(email)
