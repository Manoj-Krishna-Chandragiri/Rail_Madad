import requests
import json

# Test the AI categorization endpoint
def test_ai_categorization():
    url = "http://localhost:8001/api/complaints/ai/categorize/"
    
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
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        print(f"Description: {test_case['description']}")
        
        try:
            response = requests.post(
                url, 
                json={"description": test_case["description"]},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Status: {response.status_code}")
                print(f"📂 Predicted Category: {result.get('category')}")
                print(f"🎯 Expected Category: {test_case['expected_category']}")
                print(f"📊 Confidence: {result.get('confidence', 'N/A')}")
                print(f"👨‍💼 Assigned Staff: {result.get('assigned_staff', 'N/A')}")
                
                if result.get('category') == test_case['expected_category']:
                    print("✅ Category prediction CORRECT!")
                else:
                    print("❌ Category prediction INCORRECT")
            else:
                print(f"❌ Status: {response.status_code}")
                print(f"Error: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Server might not be running")
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Testing AI Complaint Categorization System")
    print("=" * 50)
    test_ai_categorization()
    print("\n" + "=" * 50)
    print("🏁 Test Complete")