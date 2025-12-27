import os
import django
import sys

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import FirebaseUser, Staff

# Check the staff user
email = 'corilen856@nctime.com'

print(f"\n🔍 Checking user: {email}\n")

try:
    user = FirebaseUser.objects.get(email=email)
    print(f"✅ FirebaseUser found:")
    print(f"   ID: {user.id}")
    print(f"   Email: {user.email}")
    print(f"   Firebase UID: {user.firebase_uid}")
    print(f"   is_staff: {user.is_staff}")
    print(f"   is_admin: {user.is_admin}")
    print(f"   is_passenger: {user.is_passenger}")
    print(f"   user_type property: {user.user_type}")
    
    # Check Staff profile
    try:
        staff = Staff.objects.get(user=user)
        print(f"\n✅ Staff profile found:")
        print(f"   ID: {staff.user_id}")
        print(f"   Full Name: {staff.full_name}")
        print(f"   Employee ID: {staff.employee_id}")
        print(f"   Department: {staff.department}")
        print(f"   Role: {staff.role}")
    except Staff.DoesNotExist:
        print(f"\n❌ No Staff profile found for this user")
        
except FirebaseUser.DoesNotExist:
    print(f"❌ FirebaseUser not found with email: {email}")
    print(f"\n📋 All users in database:")
    for u in FirebaseUser.objects.all():
        print(f"   - {u.email} (is_staff={u.is_staff}, is_admin={u.is_admin})")
