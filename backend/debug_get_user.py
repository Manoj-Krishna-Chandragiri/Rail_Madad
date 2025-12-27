"""Debug the get_or_create_user function"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.test import RequestFactory

User = get_user_model()

# Create a fake request with the expected attributes
factory = RequestFactory()
request = factory.get('/api/accounts/profile/')

# Simulate what middleware sets in development mode
request.firebase_email = 'manojkrishnachandragiri@gmail.com'
request.firebase_uid = '7NvmGiBdysY7abCdtDJXkuzXZcO2'
request.is_authenticated = True

# Get user
user = User.objects.get(email=request.firebase_email)
request.user = user
request.user_id = user.id

print("Request attributes:")
print(f"  - firebase_email: {request.firebase_email}")
print(f"  - firebase_uid: {request.firebase_uid}")
print(f"  - is_authenticated: {request.is_authenticated}")
print(f"  - user: {request.user}")
print(f"  - user_id: {request.user_id}")

# Now test get_or_create_user
from accounts.views import get_or_create_user

result_user, created = get_or_create_user(request)
print(f"\nget_or_create_user result:")
print(f"  - User: {result_user}")
print(f"  - Created: {created}")
if result_user:
    print(f"  - Email: {result_user.email}")
    print(f"  - User type: {result_user.user_type}")
