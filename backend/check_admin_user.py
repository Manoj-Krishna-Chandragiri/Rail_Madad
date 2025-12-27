"""Check admin user status"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = '22BQ1A4225@vvit.net'

try:
    user = User.objects.get(email__iexact=email)
    print(f"✅ Found user: {user.email} (ID: {user.id})")
    print(f"  - is_passenger: {user.is_passenger}")
    print(f"  - is_admin: {user.is_admin}")
    print(f"  - is_staff: {user.is_staff}")
    print(f"  - is_super_admin: {user.is_super_admin}")
    
    if not user.is_passenger:
        print(f"\n⚠️ User is admin but NOT passenger, updating...")
        user.is_passenger = True
        user.save()
        print(f"✅ Updated! is_passenger = {user.is_passenger}")
    else:
        print(f"\n✅ User already has passenger access!")
    
except User.DoesNotExist:
    print(f"❌ User NOT found in database: {email}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
