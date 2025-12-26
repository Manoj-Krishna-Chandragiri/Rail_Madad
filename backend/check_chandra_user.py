import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import FirebaseUser

user = FirebaseUser.objects.get(email='chandrakiranponnapalli@gmail.com')
print(f"✅ User: {user.email}")
print(f"   Type: {user.user_type}")
print(f"   Admin: {user.is_admin}")
print(f"   Staff: {user.is_staff}")
print(f"   Passenger: {user.is_passenger}")
