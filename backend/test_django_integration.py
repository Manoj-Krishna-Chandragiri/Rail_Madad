"""
Test Enhanced AI Classifier Integration with Django
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.views import get_ai_classifier

def test_integration():
    """Test the AI classifier integration"""
    
    print("\n" + "="*70)
    print("  TESTING ENHANCED AI CLASSIFIER INTEGRATION")
    print("="*70 + "\n")
    
    # Test 1: Initialize classifier
    print("Test 1: Initializing classifier...")
    classifier = get_ai_classifier()
    
    if classifier is None:
        print("❌ FAILED: Classifier initialization failed")
        return False
    print("✅ PASSED: Classifier initialized successfully\n")
    
    # Test 2: Medical Emergency
    print("Test 2: Medical Emergency Detection...")
    result = classifier.classify_complaint(
        "Passenger has suffered heart attack in AC coach. Need immediate medical help!",
        return_details=True
    )
    print(f"  Category: {result['category']}")
    print(f"  Priority: {result['priority']} (Confidence: {result['confidences']['priority']:.1%})")
    print(f"  Severity: {result['severity']} (Confidence: {result['confidences']['severity']:.1%})")
    print(f"  Staff: {result['staff']}")
    
    is_critical = (
        result['priority'] == 'High' and 
        result['severity'] == 'Critical' and
        result['confidences']['severity'] > 0.95
    )
    
    if is_critical:
        print("  🚨 CRITICAL EMERGENCY DETECTED - Notification would be sent")
        print("✅ PASSED: Medical emergency correctly identified\n")
    else:
        print("❌ FAILED: Medical emergency not detected as critical\n")
        return False
    
    # Test 3: Normal Complaint
    print("Test 3: Normal Complaint Classification...")
    result = classifier.classify_complaint(
        "Toilet is dirty and needs cleaning",
        return_details=True
    )
    print(f"  Category: {result['category']}")
    print(f"  Priority: {result['priority']} (Confidence: {result['confidences']['priority']:.1%})")
    print(f"  Severity: {result['severity']} (Confidence: {result['confidences']['severity']:.1%})")
    print(f"  Staff: {result['staff']}")
    
    if result['priority'] in ['Medium', 'Low'] and result['severity'] in ['Medium', 'Low']:
        print("✅ PASSED: Normal complaint correctly classified\n")
    else:
        print("⚠️ WARNING: Normal complaint classified as urgent\n")
    
    # Test 4: Theft Case
    print("Test 4: Theft Case Detection...")
    result = classifier.classify_complaint(
        "My bag containing laptop was stolen while I was sleeping in the train",
        return_details=True
    )
    print(f"  Category: {result['category']}")
    print(f"  Priority: {result['priority']} (Confidence: {result['confidences']['priority']:.1%})")
    print(f"  Severity: {result['severity']} (Confidence: {result['confidences']['severity']:.1%})")
    print(f"  Staff: {result['staff']}")
    print(f"  Decision Source: Priority={result.get('decision_details', {}).get('priority_source', 'N/A')}")
    
    if result['priority'] == 'High':
        print("✅ PASSED: Theft correctly classified as high priority\n")
    else:
        print("❌ FAILED: Theft not classified as high priority\n")
        return False
    
    print("="*70)
    print("  ✅ ALL TESTS PASSED - Integration Successful!")
    print("="*70)
    print("\nNext Steps:")
    print("1. Start Django server: python manage.py runserver")
    print("2. Submit test complaints through the frontend")
    print("3. Check logs for AI classification details")
    print("4. Verify urgent notifications for critical cases")
    
    return True

if __name__ == "__main__":
    try:
        success = test_integration()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
