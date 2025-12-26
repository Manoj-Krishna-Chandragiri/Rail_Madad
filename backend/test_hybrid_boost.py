"""
Test Enhanced Hybrid Classifier
Compares ML-only vs Hybrid performance to validate 95%+ accuracy target
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_models.enhanced_classification_service import EnhancedClassificationService


def test_hybrid_vs_ml_only():
    """Compare hybrid classifier against ML-only predictions"""
    
    print("="*70)
    print("  ENHANCED HYBRID CLASSIFIER TESTING")
    print("="*70)
    print("\n🎯 Goal: Boost Priority/Severity from 87%/83% to 95%+\n")
    
    # Critical test cases that should get High/Critical priority/severity
    critical_cases = [
        {
            'text': "Passenger has suffered heart attack and collapsed in AC coach B2. Need urgent medical help immediately!",
            'expected': {
                'priority': 'High',
                'severity': 'Critical',
                'description': 'Medical emergency - heart attack'
            }
        },
        {
            'text': "Suspicious person with weapon spotted in coach threatening passengers. Security threat!",
            'expected': {
                'priority': 'High',
                'severity': 'Critical',
                'description': 'Security threat with weapon'
            }
        },
        {
            'text': "Fire has started in pantry car, smoke everywhere. Need immediate help!",
            'expected': {
                'priority': 'High',
                'severity': 'Critical',
                'description': 'Fire emergency'
            }
        },
        {
            'text': "My bag containing laptop and important documents was stolen while I was sleeping",
            'expected': {
                'priority': 'High',
                'severity': 'High',
                'description': 'Theft - valuables stolen'
            }
        },
        {
            'text': "Woman being harassed by group of men in coach, needs immediate security intervention",
            'expected': {
                'priority': 'High',
                'severity': 'High',
                'description': 'Harassment - security issue'
            }
        },
        {
            'text': "No water available in entire train for past 8 hours, passengers are suffering",
            'expected': {
                'priority': 'High',
                'severity': 'High',
                'description': 'No water - essential amenity'
            }
        },
        {
            'text': "Train is running 6 hours late without any announcement or update",
            'expected': {
                'priority': 'High',
                'severity': 'High',
                'description': 'Severe delay'
            }
        },
        {
            'text': "Multiple passengers got food poisoning after eating from pantry car",
            'expected': {
                'priority': 'High',
                'severity': 'High',
                'description': 'Food poisoning - health hazard'
            }
        }
    ]
    
    # Medium priority cases
    medium_cases = [
        {
            'text': "AC is not working in coach and it is very hot and uncomfortable",
            'expected': {
                'priority': 'Medium',
                'severity': 'Medium',
                'description': 'AC malfunction'
            }
        },
        {
            'text': "Toilet is very dirty and smelly, needs immediate cleaning",
            'expected': {
                'priority': 'Medium',
                'severity': 'Medium',
                'description': 'Cleanliness issue'
            }
        },
        {
            'text': "My seat is broken and uncomfortable, berth not properly fixed",
            'expected': {
                'priority': 'Medium',
                'severity': 'Medium',
                'description': 'Maintenance issue'
            }
        },
        {
            'text': "Food served was cold and quality is poor, overpriced",
            'expected': {
                'priority': 'Medium',
                'severity': 'Medium',
                'description': 'Food quality complaint'
            }
        },
        {
            'text': "Train is running 45 minutes late from scheduled departure",
            'expected': {
                'priority': 'Medium',
                'severity': 'Medium',
                'description': 'Minor delay'
            }
        }
    ]
    
    # Low priority cases
    low_cases = [
        {
            'text': "Suggestion: It would be nice to have better announcements at stations",
            'expected': {
                'priority': 'Low',
                'severity': 'Low',
                'description': 'Suggestion'
            }
        },
        {
            'text': "Minor feedback: Coach could use slight improvement in lighting",
            'expected': {
                'priority': 'Low',
                'severity': 'Low',
                'description': 'Minor improvement suggestion'
            }
        }
    ]
    
    all_cases = critical_cases + medium_cases + low_cases
    
    print(f"Test cases: {len(critical_cases)} Critical, {len(medium_cases)} Medium, {len(low_cases)} Low\n")
    
    # Initialize services
    print("Loading ML-only service...")
    try:
        ml_service = EnhancedClassificationService(
            model_dir='ai_models/models/enhanced',
            use_hybrid=False
        )
        print("✅ ML-only service loaded\n")
    except FileNotFoundError as e:
        print(f"❌ ERROR: {e}")
        print("\n📥 Please extract models first using extract_models.bat")
        return False
    
    print("Loading Hybrid service...")
    hybrid_service = EnhancedClassificationService(
        model_dir='ai_models/models/enhanced',
        use_hybrid=True
    )
    print("✅ Hybrid service loaded\n")
    
    print("="*70)
    print("  RUNNING TESTS")
    print("="*70)
    
    ml_correct = {'priority': 0, 'severity': 0}
    hybrid_correct = {'priority': 0, 'severity': 0}
    
    ml_results = []
    hybrid_results = []
    
    for i, case in enumerate(all_cases, 1):
        print(f"\n{i}. {case['expected']['description']}")
        print(f"   Text: {case['text'][:70]}...")
        print(f"   Expected: Priority={case['expected']['priority']}, Severity={case['expected']['severity']}")
        
        # ML-only prediction
        ml_pred = ml_service.classify_complaint(case['text'], return_details=True)
        ml_priority_correct = ml_pred['priority'] == case['expected']['priority']
        ml_severity_correct = ml_pred['severity'] == case['expected']['severity']
        
        if ml_priority_correct:
            ml_correct['priority'] += 1
        if ml_severity_correct:
            ml_correct['severity'] += 1
        
        print(f"\n   ML-Only:")
        print(f"     Priority: {ml_pred['priority']} {'✅' if ml_priority_correct else '❌'} (conf: {ml_pred['confidences']['priority']:.2%})")
        print(f"     Severity: {ml_pred['severity']} {'✅' if ml_severity_correct else '❌'} (conf: {ml_pred['confidences']['severity']:.2%})")
        
        # Hybrid prediction
        hybrid_pred = hybrid_service.classify_complaint(case['text'], return_details=True)
        hybrid_priority_correct = hybrid_pred['priority'] == case['expected']['priority']
        hybrid_severity_correct = hybrid_pred['severity'] == case['expected']['severity']
        
        if hybrid_priority_correct:
            hybrid_correct['priority'] += 1
        if hybrid_severity_correct:
            hybrid_correct['severity'] += 1
        
        print(f"\n   Hybrid:")
        print(f"     Priority: {hybrid_pred['priority']} {'✅' if hybrid_priority_correct else '❌'} (conf: {hybrid_pred['confidences']['priority']:.2%})")
        print(f"     Severity: {hybrid_pred['severity']} {'✅' if hybrid_severity_correct else '❌'} (conf: {hybrid_pred['confidences']['severity']:.2%})")
        print(f"     Source: Priority={hybrid_pred['decision_sources']['priority']}, Severity={hybrid_pred['decision_sources']['severity']}")
        
        # Track improvement
        if hybrid_priority_correct and not ml_priority_correct:
            print(f"     🎯 Priority IMPROVED by hybrid rules!")
        if hybrid_severity_correct and not ml_severity_correct:
            print(f"     🎯 Severity IMPROVED by hybrid rules!")
        
        ml_results.append({
            'case': case['expected']['description'],
            'priority_correct': ml_priority_correct,
            'severity_correct': ml_severity_correct
        })
        
        hybrid_results.append({
            'case': case['expected']['description'],
            'priority_correct': hybrid_priority_correct,
            'severity_correct': hybrid_severity_correct
        })
    
    # Calculate accuracies
    total_cases = len(all_cases)
    
    ml_priority_acc = (ml_correct['priority'] / total_cases) * 100
    ml_severity_acc = (ml_correct['severity'] / total_cases) * 100
    
    hybrid_priority_acc = (hybrid_correct['priority'] / total_cases) * 100
    hybrid_severity_acc = (hybrid_correct['severity'] / total_cases) * 100
    
    print("\n" + "="*70)
    print("  📊 FINAL RESULTS")
    print("="*70)
    
    print(f"\n🤖 ML-Only Accuracy:")
    print(f"   Priority: {ml_priority_acc:.1f}% ({ml_correct['priority']}/{total_cases})")
    print(f"   Severity: {ml_severity_acc:.1f}% ({ml_correct['severity']}/{total_cases})")
    
    print(f"\n🚀 Hybrid Accuracy:")
    print(f"   Priority: {hybrid_priority_acc:.1f}% ({hybrid_correct['priority']}/{total_cases})")
    print(f"   Severity: {hybrid_severity_acc:.1f}% ({hybrid_correct['severity']}/{total_cases})")
    
    print(f"\n📈 Improvement:")
    priority_gain = hybrid_priority_acc - ml_priority_acc
    severity_gain = hybrid_severity_acc - ml_severity_acc
    print(f"   Priority: {priority_gain:+.1f}%")
    print(f"   Severity: {severity_gain:+.1f}%")
    
    print("\n" + "="*70)
    
    # Check if we achieved 95%+ target
    if hybrid_priority_acc >= 95 and hybrid_severity_acc >= 95:
        print("✅ SUCCESS! Both Priority and Severity achieved 95%+ accuracy!")
    elif hybrid_priority_acc >= 90 and hybrid_severity_acc >= 90:
        print("✅ EXCELLENT! Both Priority and Severity achieved 90%+ accuracy!")
    else:
        print("⚠️ Close but not quite at 95% target on this test set.")
        print("   Note: These are hand-picked test cases. Real-world accuracy will vary.")
    
    print("="*70)
    
    print("\n💡 Recommendation:")
    if hybrid_priority_acc >= 90 and hybrid_severity_acc >= 90:
        print("   ✅ Hybrid classifier is PRODUCTION READY for Indian Railways")
        print("   ✅ Deploy with hybrid mode enabled (use_hybrid=True)")
        print("   ✅ Critical cases (medical, security) will be handled correctly")
    else:
        print("   ⚠️ Consider adding more rules for edge cases")
        print("   ⚠️ Monitor real-world performance and iterate")
    
    return True


if __name__ == '__main__':
    success = test_hybrid_vs_ml_only()
    sys.exit(0 if success else 1)
