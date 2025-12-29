"""
Test staff update to see what error occurs
"""
import django
import os
import sys
import json

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import Staff
from accounts.serializers import StaffSerializer

print("\n" + "="*70)
print("TEST STAFF UPDATE")
print("="*70)

# Get staff with user_id=14
try:
    staff = Staff.objects.get(user_id=14)
    print(f"\nFound staff: {staff.full_name} (user_id: {staff.user_id})")
    print(f"Email: {staff.email}")
    print(f"Phone: {staff.phone_number}")
    print(f"Department: {staff.department}")
    print(f"Expertise: {staff.expertise}")
    print(f"Languages: {staff.languages}")
    
    # Test update with sample data
    print("\n" + "-"*70)
    print("Testing serializer update...")
    print("-"*70)
    
    test_data = {
        'full_name': 'Suzuki Updated',
        'phone_number': '8523823805',
        'department': 'Medical',
        'expertise': json.dumps(['Medical', 'Emergency']),  # JSON string like FormData sends
        'languages': json.dumps(['English', 'Hindi']),
        'communication_preferences': json.dumps(['Email', 'Phone'])
    }
    
    print(f"Test data: {test_data}")
    
    serializer = StaffSerializer(staff, data=test_data, partial=True)
    if serializer.is_valid():
        print("✓ Serializer is valid")
        updated = serializer.save()
        print(f"✓ Updated successfully: {updated.full_name}")
        print(f"  Expertise: {updated.expertise}")
        print(f"  Languages: {updated.languages}")
    else:
        print("✗ Serializer validation failed:")
        print(f"  Errors: {serializer.errors}")
        
except Staff.DoesNotExist:
    print("\n✗ Staff with user_id=14 not found")
except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70 + "\n")
