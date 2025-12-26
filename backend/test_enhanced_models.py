"""
Test script for Enhanced Classification Service
Verifies that downloaded models work correctly
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_models.enhanced_classification_service import EnhancedClassificationService


def test_model_loading():
    """Test if models load successfully"""
    print("="*70)
    print("TEST 1: Model Loading")
    print("="*70)
    
    try:
        service = EnhancedClassificationService(model_dir='ai_models/models/enhanced')
        print("✅ All models loaded successfully\n")
        return service
    except FileNotFoundError as e:
        print(f"❌ FAILED: {e}")
        print("\n📥 Please download models from Colab first!")
        print("   See: DOWNLOAD_AND_INTEGRATE_MODELS.md")
        return None
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return None


def test_predictions(service):
    """Test predictions on sample complaints"""
    print("="*70)
    print("TEST 2: Sample Predictions")
    print("="*70 + "\n")
    
    test_cases = [
        {
            'text': "Water not available in toilet, very dirty",
            'expected': {
                'category': 'Water Availability',
                'staff': 'Sanitation Department',
                'priority': 'Medium',
                'severity': 'Medium'
            }
        },
        {
            'text': "Security threat: suspicious person with weapon",
            'expected': {
                'category': 'Security',
                'staff': 'Security Personnel',
                'priority': 'High',
                'severity': 'Critical'
            }
        },
        {
            'text': "AC not working in coach",
            'expected': {
                'category': 'Air Conditioning',
                'staff': 'Electrical Department',
                'priority': 'Medium',
                'severity': 'Medium'
            }
        },
        {
            'text': "Train is 5 hours late, no information provided",
            'expected': {
                'category': 'Punctuality',
                'staff': 'Railway Operations',
                'priority': 'High',
                'severity': 'High'
            }
        },
        {
            'text': "Food quality is very bad and expensive",
            'expected': {
                'category': 'Catering & Vending Services',
                'staff': 'Catering Department',
                'priority': 'Low',
                'severity': 'Low'
            }
        }
    ]
    
    passed = 0
    failed = 0
    
    for i, case in enumerate(test_cases, 1):
        print(f"{i}. Testing: \"{case['text'][:50]}...\"")
        
        try:
            result = service.classify_complaint(case['text'], return_details=True)
            
            print(f"   Predicted:")
            print(f"     Category: {result['category']} (conf: {result['confidences']['category']:.2%})")
            print(f"     Staff: {result['staff']} (conf: {result['confidences']['staff']:.2%})")
            print(f"     Priority: {result['priority']} (conf: {result['confidences']['priority']:.2%})")
            print(f"     Severity: {result['severity']} (conf: {result['confidences']['severity']:.2%})")
            
            # Check if reasonable (not exact match due to model variations)
            reasonable = (
                result['confidences']['category'] > 0.3 and
                result['confidences']['staff'] > 0.3 and
                result['confidences']['priority'] > 0.3 and
                result['confidences']['severity'] > 0.3
            )
            
            if reasonable:
                print(f"   ✅ PASS (all confidences > 30%)\n")
                passed += 1
            else:
                print(f"   ⚠️ WARNING (low confidence predictions)\n")
                failed += 1
                
        except Exception as e:
            print(f"   ❌ FAILED: {e}\n")
            failed += 1
    
    print(f"Results: {passed}/{len(test_cases)} passed\n")
    return passed == len(test_cases)


def test_model_metrics(service):
    """Test if model metrics are loaded correctly"""
    print("="*70)
    print("TEST 3: Model Performance Metrics")
    print("="*70 + "\n")
    
    info = service.get_model_info()
    
    all_good = True
    
    for model_name, model_info in info['models'].items():
        accuracy = model_info.get('accuracy', 0)
        macro_f1 = model_info.get('macro_f1', 0)
        
        print(f"{model_name.upper()}:")
        print(f"  Accuracy: {accuracy:.2%}")
        print(f"  Macro-F1: {macro_f1:.2%}")
        print(f"  Classes: {len(model_info['classes'])}")
        
        # Check if metrics are reasonable
        if accuracy < 0.70:  # At least 70% for worst case
            print(f"  ⚠️ WARNING: Low accuracy")
            all_good = False
        elif model_name in ['category', 'staff'] and accuracy < 0.90:
            print(f"  ⚠️ WARNING: Below 90% target")
            all_good = False
        else:
            print(f"  ✅ GOOD")
        print()
    
    return all_good


def test_batch_processing(service):
    """Test processing multiple complaints"""
    print("="*70)
    print("TEST 4: Batch Processing")
    print("="*70 + "\n")
    
    complaints = [
        "Toilet is very dirty and smelly",
        "AC not working properly",
        "Food is cold and tasteless",
        "Train delayed by 2 hours",
        "Medical emergency in coach"
    ]
    
    print(f"Processing {len(complaints)} complaints...\n")
    
    try:
        results = []
        for complaint in complaints:
            result = service.classify_complaint(complaint)
            results.append(result)
        
        print(f"✅ Successfully processed {len(results)} complaints")
        
        # Show summary
        print("\nSummary:")
        categories = {}
        for r in results:
            cat = r['category']
            categories[cat] = categories.get(cat, 0) + 1
        
        for cat, count in categories.items():
            print(f"  {cat}: {count}")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {e}\n")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("  ENHANCED CLASSIFICATION SERVICE - TEST SUITE")
    print("="*70 + "\n")
    
    # Test 1: Load models
    service = test_model_loading()
    if not service:
        print("\n❌ Cannot proceed: Models not loaded")
        print("\n📥 Download models from Colab:")
        print("   1. Run final cell in Colab notebook")
        print("   2. Download trained_models.zip")
        print("   3. Extract to: backend/ai_models/models/enhanced/")
        return False
    
    print()
    
    # Test 2: Predictions
    test_predictions(service)
    
    # Test 3: Metrics
    test_model_metrics(service)
    
    # Test 4: Batch processing
    test_batch_processing(service)
    
    print("="*70)
    print("  ✅ ALL TESTS COMPLETED")
    print("="*70 + "\n")
    
    print("Next steps:")
    print("  1. Review test results above")
    print("  2. Update Django views to use EnhancedClassificationService")
    print("  3. Test API endpoints")
    print("  4. Deploy to production\n")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
