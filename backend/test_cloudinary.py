"""
Test Cloudinary configuration and connection
"""
import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Load environment variables
load_dotenv()

# Get credentials
cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
api_key = os.getenv('CLOUDINARY_API_KEY')
api_secret = os.getenv('CLOUDINARY_API_SECRET')

print("="*80)
print("🔧 CLOUDINARY CONFIGURATION TEST")
print("="*80)
print(f"Cloud Name: {cloud_name}")
print(f"API Key: {api_key}")
print(f"API Secret: {api_secret[:10]}...{api_secret[-5:] if api_secret else 'None'}")
print("="*80)

# Configure Cloudinary
cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret
)

# Test connection
print("\n📡 Testing Cloudinary connection...")
try:
    # Try to get account details
    result = cloudinary.api.ping()
    print("✅ Connection successful!")
    print(f"   Status: {result.get('status', 'unknown')}")
except Exception as e:
    print(f"❌ Connection failed: {e}")

print("\n" + "="*80)
