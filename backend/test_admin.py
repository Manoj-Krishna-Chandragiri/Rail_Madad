import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'railmadad_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.signals import create_admin_user
from accounts.apps import AccountsConfig

def test_admin_creation():
    User = get_user_model()
    
    # Check current admin users
    admin_users = User.objects.filter(user_type='admin')
    print(f"Current admin users: {admin_users.count()}")
    
    for user in admin_users:
        print(f"  - {user.email} (is_admin: {user.is_admin}, is_staff: {user.is_staff})")
    
    # Try to create admin user manually
    try:
        create_admin_user(sender=AccountsConfig)
        print("Admin user creation signal executed")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    
    # Check again
    admin_users = User.objects.filter(user_type='admin')
    print(f"Admin users after signal: {admin_users.count()}")

if __name__ == "__main__":
    test_admin_creation()
