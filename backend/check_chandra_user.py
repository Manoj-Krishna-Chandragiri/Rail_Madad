import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import FirebaseUser

# Check multiple admin users
test_users = [
    '22BQ1A4225@vvit.net',
    '22bq1a4225@vvit.net',
    'chandragirimanoj999@gmail.com',
    'manojkrishnachandragiri@gmail.com',
    'adm.railmadad@gmail.com'
]

print("=" * 60, flush=True)
print("CHECKING USERS IN DATABASE", flush=True)
print("=" * 60, flush=True)

for email in test_users:
    try:
        user = FirebaseUser.objects.get(email__iexact=email)
        print(f"\n[FOUND] {user.email} (ID: {user.id})", flush=True)
        print(f"  Firebase UID: {user.firebase_uid}", flush=True)
        print(f"  is_passenger: {user.is_passenger}", flush=True)
        print(f"  is_admin: {user.is_admin}", flush=True)
        print(f"  is_staff: {user.is_staff}", flush=True)
        
        if user.is_admin:
            print(f"  [OK] CAN access Admin Portal", flush=True)
        if user.is_passenger:
            print(f"  [OK] CAN access Passenger Portal", flush=True)
            
    except FirebaseUser.DoesNotExist:
        print(f"\n[NOT FOUND] {email}", flush=True)

print("\n" + "=" * 60, flush=True)
print("NOTE: User must exist in Firebase with correct password", flush=True)
print("=" * 60, flush=True)
