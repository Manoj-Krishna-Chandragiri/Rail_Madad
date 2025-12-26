#!/usr/bin/env python3
"""
Test script to verify backend environment variables are properly configured
"""
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(backend_dir / '.env')

def test_env_variable(var_name, is_secret=False):
    """Test if an environment variable is set and display its status"""
    value = os.getenv(var_name)
    if value:
        if is_secret:
            return f"- {var_name}: ***CONFIGURED***"
        else:
            return f"- {var_name}: {value}"
    else:
        return f"- {var_name}: NOT SET"

print("=== Rail Madad Backend Environment Configuration Test ===\n")

print("Django Configuration:")
print(test_env_variable('DJANGO_SECRET_KEY', True))
print(test_env_variable('DJANGO_DEBUG'))
print(test_env_variable('DJANGO_SETTINGS_MODULE'))
print(test_env_variable('DJANGO_ALLOWED_HOSTS'))
print(test_env_variable('PORT'))

print("\nDatabase Configuration:")
print(test_env_variable('USE_SQLITE'))
print(test_env_variable('MYSQL_DATABASE'))
print(test_env_variable('MYSQL_HOST'))
print(test_env_variable('MYSQL_USER'))
print(test_env_variable('MYSQL_PASSWORD', True))
print(test_env_variable('MYSQL_PORT'))

print("\nFirebase Configuration:")
print(test_env_variable('FIREBASE_TYPE'))
print(test_env_variable('FIREBASE_PROJECT_ID'))
print(test_env_variable('FIREBASE_PRIVATE_KEY_ID', True))
print(test_env_variable('FIREBASE_PRIVATE_KEY', True))
print(test_env_variable('FIREBASE_CLIENT_EMAIL'))

print("\n=== Backend Environment Configuration Test Complete ===")

# Test Django settings loading
print("\nTesting Django settings loading...")
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    import django
    from django.conf import settings
    django.setup()
    
    print("✅ Django settings loaded successfully")
    print(f"✅ Database Engine: {settings.DATABASES['default']['ENGINE']}")
    print(f"✅ Database Name: {settings.DATABASES['default']['NAME']}")
    print(f"✅ Debug Mode: {settings.DEBUG}")
    print(f"✅ Allowed Hosts: {settings.ALLOWED_HOSTS}")
    
except Exception as e:
    print(f"❌ Error loading Django settings: {str(e)}")
