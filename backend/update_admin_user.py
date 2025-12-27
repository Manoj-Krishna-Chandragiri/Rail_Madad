"""Update admin user to have passenger access"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = '22BQ1A4225@vvit.net'

try:
    user = User.objects.get(email__iexact=email)
    print(f"Current user: {user.email}")
    print(f"  - is_passenger: {user.is_passenger}")
    print(f"  - is_admin: {user.is_admin}")
    print(f"  - is_staff: {user.is_staff}")
    print(f"  - is_super_admin: {user.is_super_admin}")
    
    # Make user both admin AND passenger (can use both portals)
    user.is_passenger = True
    user.save()
    
    print(f"\n✅ Updated user!")
    print(f"  - is_passenger: {user.is_passenger}")
    print(f"  - is_admin: {user.is_admin}")
    
except User.DoesNotExist:
    print(f"❌ User not found: {email}")
except Exception as e:
    print(f"❌ Error: {e}")
