"""
Direct test of Gemini API without Django
"""
import os
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai

# Load .env
BASE_DIR = Path(__file__).resolve().parent
dotenv_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=dotenv_path)

print("=" * 80)
print("🔍 GEMINI API TEST")
print("=" * 80)

# Check API key
api_key = os.getenv('GEMINI_MULTIMODAL_API_KEY')
print(f"\n📋 API Key loaded: {'YES' if api_key else 'NO'}")
if api_key:
    print(f"   First 10 chars: {api_key[:10]}...")

# Configure Gemini
if api_key:
    genai.configure(api_key=api_key)
    print("\n✅ Gemini configured")
    
    # List available models
    print("\n📦 Available models:")
    try:
        for model in genai.list_models():
            if 'generateContent' in model.supported_generation_methods:
                print(f"   - {model.name}")
    except Exception as e:
        print(f"   ❌ Error listing models: {e}")
    
    # Try to use gemini-1.5-flash-latest
    print("\n🧪 Testing gemini-1.5-flash-latest...")
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content("Say 'Hello from Gemini!'")
        print(f"   ✅ Success: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
else:
    print("\n❌ No API key found!")

print("\n" + "=" * 80)
