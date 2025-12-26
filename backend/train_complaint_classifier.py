"""
Training Script for Complaint Classification Models
Run this script to train all BERT/DistilBERT models
"""

import os
import sys
import argparse

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_models.complaint_classifier import ComplaintClassifier


def train_models(
    csv_path='Railway_Complaints_Enhanced_Dataset.csv',
    model_type='distilbert',
    epochs=4,
    batch_size=16,
    save_dir='ai_models/models/complaint_classifier'
):
    """
    Train all complaint classification models
    
    Args:
        csv_path: Path to training dataset CSV
        model_type: 'distilbert' or 'bert'
        epochs: Number of training epochs
        batch_size: Batch size for training
        save_dir: Directory to save trained models
    """
    print("="*70)
    print("RAILWAY COMPLAINT CLASSIFICATION MODEL TRAINING")
    print("="*70)
    print(f"\nConfiguration:")
    print(f"  Dataset: {csv_path}")
    print(f"  Model Type: {model_type}")
    print(f"  Epochs: {epochs}")
    print(f"  Batch Size: {batch_size}")
    print(f"  Save Directory: {save_dir}")
    print("="*70)
    
    # Check if dataset exists
    if not os.path.exists(csv_path):
        print(f"\nError: Dataset not found at {csv_path}")
        print("Please make sure the dataset file exists.")
        return False
    
    try:
        # Initialize classifier
        print("\nInitializing classifier...")
        classifier = ComplaintClassifier(model_type=model_type)
        
        # Train all models
        print("\nStarting training process...")
        classifier.train_all_models(
            csv_path=csv_path,
            epochs=epochs,
            batch_size=batch_size
        )
        
        # Save models
        print(f"\nSaving models to {save_dir}...")
        classifier.save_models(save_dir=save_dir)
        
        print("\n" + "="*70)
        print("TRAINING COMPLETED SUCCESSFULLY!")
        print("="*70)
        print(f"\nModels saved to: {save_dir}")
        print("\nYou can now use the classification service in your Django application.")
        
        return True
    
    except Exception as e:
        print(f"\nError during training: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_predictions(model_dir='ai_models/models/complaint_classifier'):
    """Test the trained models with sample complaints"""
    print("\n" + "="*70)
    print("TESTING TRAINED MODELS")
    print("="*70)
    
    try:
        from ai_models.complaint_classification_service import ComplaintClassificationService
        
        service = ComplaintClassificationService(model_dir=model_dir)
        
        test_complaints = [
            "The toilet is overflowing and smells terrible",
            "Someone stole my bag while I was sleeping",
            "The AC is completely broken and not working",
            "Passengers are drinking alcohol and creating disturbance",
            "The train is 5 hours late without announcement",
            "The food served was stale and made me sick",
            "My seat is broken and very uncomfortable",
            "A man is harassing female passengers",
            "The water supply is not working in washroom",
            "Platform is very dirty with garbage everywhere"
        ]
        
        print("\nSample Predictions:\n")
        for i, complaint in enumerate(test_complaints, 1):
            print(f"{i}. Complaint: {complaint}")
            result = service.classify_complaint(complaint)
            print(f"   Category: {result['category']}")
            print(f"   Staff: {result['staff_assignment']}")
            print(f"   Priority: {result['priority']}")
            print(f"   Severity: {result['severity']}")
            print(f"   Confidence: Category={result['confidence_scores']['category']:.2%}, "
                  f"Staff={result['confidence_scores']['staff']:.2%}")
            print()
        
        print("="*70)
        print("TESTING COMPLETED")
        print("="*70)
        
    except Exception as e:
        print(f"\nError during testing: {e}")
        import traceback
        traceback.print_exc()


def main():
    parser = argparse.ArgumentParser(
        description='Train Complaint Classification Models'
    )
    
    parser.add_argument(
        '--dataset',
        type=str,
        default='Railway_Complaints_Enhanced_Dataset.csv',
        help='Path to training dataset CSV file'
    )
    
    parser.add_argument(
        '--model-type',
        type=str,
        choices=['distilbert', 'bert'],
        default='distilbert',
        help='Model type to use (distilbert or bert)'
    )
    
    parser.add_argument(
        '--epochs',
        type=int,
        default=4,
        help='Number of training epochs'
    )
    
    parser.add_argument(
        '--batch-size',
        type=int,
        default=16,
        help='Batch size for training'
    )
    
    parser.add_argument(
        '--save-dir',
        type=str,
        default='ai_models/models/complaint_classifier',
        help='Directory to save trained models'
    )
    
    parser.add_argument(
        '--test-only',
        action='store_true',
        help='Only test existing models, skip training'
    )
    
    args = parser.parse_args()
    
    if args.test_only:
        test_predictions(args.save_dir)
    else:
        success = train_models(
            csv_path=args.dataset,
            model_type=args.model_type,
            epochs=args.epochs,
            batch_size=args.batch_size,
            save_dir=args.save_dir
        )
        
        if success:
            print("\nWould you like to test the trained models? (y/n): ", end='')
            response = input().strip().lower()
            if response == 'y':
                test_predictions(args.save_dir)


if __name__ == "__main__":
    main()
