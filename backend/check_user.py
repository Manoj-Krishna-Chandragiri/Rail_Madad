import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Check for the user
email = 'manojkrishnachandragiri@gmail.com'
try:
    user = User.objects.get(email=email)
    print(f"✅ User found: {user.email}")
    print(f"   - Full name: {user.full_name}")
    print(f"   - User type: {user.user_type}")
    print(f"   - Is passenger: {user.is_passenger}")
    print(f"   - Is staff: {user.is_staff}")
    print(f"   - Is admin: {user.is_admin}")
    print(f"   - Firebase UID: {user.firebase_uid}")
except User.DoesNotExist:
    print(f"❌ User NOT FOUND: {email}")
    print("\nAll users in database:")
    for u in User.objects.all()[:5]:
        print(f"  - {u.email} ({u.user_type})")
