"""
Check if environment variables are loading properly
"""
import os
from dotenv import load_dotenv
from django.conf import settings

# Load .env file
load_dotenv()

print("="*80)
print("🔍 ENVIRONMENT VARIABLES CHECK")
print("="*80)

# Check via os.getenv
print("\n📋 Via os.getenv():")
print(f"CLOUDINARY_CLOUD_NAME: {os.getenv('CLOUDINARY_CLOUD_NAME')}")
print(f"CLOUDINARY_API_KEY: {os.getenv('CLOUDINARY_API_KEY')}")
print(f"CLOUDINARY_API_SECRET: {os.getenv('CLOUDINARY_API_SECRET')[:10] if os.getenv('CLOUDINARY_API_SECRET') else 'None'}...")

# Check via Django settings
print("\n⚙️ Via Django settings:")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from django.conf import settings as django_settings

print(f"CLOUDINARY_CLOUD_NAME: {django_settings.CLOUDINARY_CLOUD_NAME}")
print(f"CLOUDINARY_API_KEY: {django_settings.CLOUDINARY_API_KEY}")
print(f"CLOUDINARY_API_SECRET: {django_settings.CLOUDINARY_API_SECRET[:10] if django_settings.CLOUDINARY_API_SECRET else 'None'}...")

print("\n" + "="*80)
