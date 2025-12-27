"""Add akram to SQLite database"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import FirebaseUser

email = 'akram.dcme@gmail.com'

try:
    user = FirebaseUser.objects.get(email__iexact=email)
    print(f"[EXISTS] {user.email}", flush=True)
    print(f"  is_admin: {user.is_admin}, is_passenger: {user.is_passenger}", flush=True)
    
    # Update permissions
    user.is_admin = True
    user.is_staff = True
    user.is_passenger = True
    user.save()
    print(f"[UPDATED] Permissions set", flush=True)
    
except FirebaseUser.DoesNotExist:
    print(f"[CREATING] {email}...", flush=True)
    user = FirebaseUser.objects.create(
        email=email,
        firebase_uid='xtDSXpZNcXTTLSGx8ZTbjTMRgXE2',
        full_name='Akram',
        phone_number='09951916519',
        gender='male',
        address='53-123,Gandhi nagar 4 th lane',
        is_admin=True,
        is_staff=True,
        is_passenger=True,
        is_active=True
    )
    print(f"[SUCCESS] Created {user.email}", flush=True)

print(f"\nFinal: is_admin={user.is_admin}, is_staff={user.is_staff}, is_passenger={user.is_passenger}", flush=True)
