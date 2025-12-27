"""Update user to have passenger access"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = 'manojkrishnachandragiri@gmail.com'

try:
    user = User.objects.get(email=email)
    print(f"Current user: {user.email}")
    print(f"  - is_passenger: {user.is_passenger}")
    print(f"  - is_admin: {user.is_admin}")
    print(f"  - is_staff: {user.is_staff}")
    
    # Make user both admin AND passenger
    user.is_passenger = True
    user.save()
    
    print(f"\n✅ Updated user to be passenger!")
    print(f"  - is_passenger: {user.is_passenger}")
    print(f"  - is_admin: {user.is_admin}")
    print(f"  - is_staff: {user.is_staff}")
    
except User.DoesNotExist:
    print(f"❌ User not found: {email}")
except Exception as e:
    print(f"❌ Error: {e}")
