"""
Script to create a Django profile for a Firebase user that doesn't exist in the database yet.
Run with: python create_missing_profile.py <email> <user_type>
Example: python create_missing_profile.py tobiwex105@fftube.com admin
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import FirebaseUser

def create_profile(email, user_type='passenger'):
    """Create a Django profile for a Firebase user"""
    
    # Validate user_type
    valid_types = ['admin', 'staff', 'passenger']
    if user_type not in valid_types:
        print(f"❌ Invalid user_type: {user_type}")
        print(f"   Valid types: {', '.join(valid_types)}")
        return False
    
    # Check if user already exists
    if FirebaseUser.objects.filter(email=email).exists():
        print(f"❌ User {email} already exists in database")
        return False
    
    # Determine role flags
    is_admin = user_type == 'admin'
    is_staff = user_type == 'staff'
    is_passenger = user_type == 'passenger'
    
    # Create the user
    user = FirebaseUser.objects.create(
        email=email,
        full_name='',  # Can be updated later
        phone_number='',
        gender='',
        address='',
        is_admin=is_admin,
        is_staff=is_staff,
        is_passenger=is_passenger,
        firebase_uid=''  # Will be updated on first login
    )
    
    print(f"✅ Successfully created profile for {email}")
    print(f"   User type: {user.user_type}")
    print(f"   Is admin: {user.is_admin}")
    print(f"   Is staff: {user.is_staff}")
    print(f"   Is passenger: {user.is_passenger}")
    print(f"\n   User can now log in and their Firebase UID will be synced automatically.")
    
    return True

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python create_missing_profile.py <email> [user_type]")
        print("Example: python create_missing_profile.py tobiwex105@fftube.com admin")
        sys.exit(1)
    
    email = sys.argv[1]
    user_type = sys.argv[2] if len(sys.argv) > 2 else 'passenger'
    
    create_profile(email, user_type)
