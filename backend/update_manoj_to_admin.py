import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import FirebaseUser

# Update user to admin
user = FirebaseUser.objects.get(email='manojkrishnachandragiri@gmail.com')
user.is_admin = True
user.is_staff = False
user.is_passenger = False
user.save()

print(f"✅ Updated user: {user.email}")
print(f"   Type: {user.user_type}")
print(f"   Admin: {user.is_admin}")
print(f"   Staff: {user.is_staff}")
print(f"   Passenger: {user.is_passenger}")
