import os
import sys

# Add backend directory to Python path
sys.path.append(r'd:\Projects\Rail_Madad\backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

# Now test the AI categorizer
from ai_models.complaint_categorizer import ComplaintCategorizer

def test_ai_categorizer():
    print("🚀 Testing AI Complaint Categorizer")
    print("=" * 50)
    
    # Initialize the categorizer
    categorizer = ComplaintCategorizer()
    
    test_cases = [
        {
            "description": "The bathroom on the train was extremely dirty and smelly",
            "expected_category": "cleanliness"
        },
        {
            "description": "The food served was terrible and cold",
            "expected_category": "catering"
        },
        {
            "description": "The conductor was very rude to passengers",
            "expected_category": "staff_behavior"
        },
        {
            "description": "My train was delayed by 3 hours",
            "expected_category": "delay_cancellation"
        },
        {
            "description": "There was no water in the electrical compartment",
            "expected_category": "electrical"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        print(f"Description: {test_case['description']}")
        
        try:
            # Test the prediction
            result = categorizer.predict_category(test_case["description"])
            
            print(f"✅ Prediction successful!")
            print(f"📂 Predicted Category: {result['category']}")
            print(f"🎯 Expected Category: {test_case['expected_category']}")
            print(f"📊 Confidence: {result['confidence']:.3f}")
            print(f"🔍 Matched Keywords: {result['matched_keywords']}")
            
            if result['category'] == test_case['expected_category']:
                print("✅ Category prediction CORRECT!")
            else:
                print("❌ Category prediction INCORRECT")
                
            # Test staff assignment
            staff_assignment = categorizer.get_staff_assignment(result['category'])
            print(f"👨‍💼 Recommended Staff Role: {staff_assignment['role']}")
            print(f"🏢 Department: {staff_assignment['department']}")
            print(f"⭐ Priority Level: {staff_assignment['priority_level']}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_ai_categorizer()
    print("\n" + "=" * 50)
    print("🏁 Test Complete")