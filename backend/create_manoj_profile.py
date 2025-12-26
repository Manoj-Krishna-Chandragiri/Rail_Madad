import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import FirebaseUser

# Create profile for manojkrishnachandragiri@gmail.com
user, created = FirebaseUser.objects.get_or_create(
    email='manojkrishnachandragiri@gmail.com',
    defaults={
        'full_name': 'Manoj Krishna',
        'phone_number': '',
        'gender': '',
        'address': '',
        'is_admin': True,
        'is_staff': False,
        'is_passenger': False,
        'firebase_uid': ''
    }
)

print(f"✅ User: {user.email}")
print(f"   Created: {created}")
print(f"   Type: {user.user_type}")
print(f"   Admin: {user.is_admin}")
