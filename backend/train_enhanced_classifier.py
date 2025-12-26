"""
Production-Grade Training Script with All Enhancements
- Focal Loss & Class Weighting
- Early Stopping
- Layer Unfreezing
- Macro-F1 Metrics
- Comprehensive Evaluation
"""

import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import (
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
    get_linear_schedule_with_warmup
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
from tqdm import tqdm
import os
import json
import pickle
import argparse

# Import our enhanced modules
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai_models'))
from enhanced_training import (
    FocalLoss, EarlyStopping, LayerUnfreezer,
    compute_class_weights, get_loss_function, compute_metrics,
    save_metrics_report
)


class ComplaintDataset(Dataset):
    """PyTorch Dataset for complaints"""
    
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }


def train_enhanced_model(
    train_texts, train_labels,
    val_texts, val_labels,
    test_texts, test_labels,
    label_encoder,
    model_name='distilbert-base-uncased',
    epochs=10,
    batch_size=16,
    learning_rate=2e-5,
    use_focal_loss=True,
    focal_gamma=2.0,
    early_stopping_patience=3,
    unfreeze_layers=True,
    save_dir='models/enhanced_classifier',
    device=None
):
    """
    Train model with all enhancements
    
    Returns:
        Trained model, training history, test metrics
    """
    
    if device is None:
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    print(f"\n{'='*70}")
    print(f"ENHANCED TRAINING CONFIGURATION")
    print(f"{'='*70}")
    print(f"  Model: {model_name}")
    print(f"  Device: {device}")
    print(f"  Epochs: {epochs}")
    print(f"  Batch Size: {batch_size}")
    print(f"  Learning Rate: {learning_rate}")
    print(f"  Focal Loss: {use_focal_loss} (gamma={focal_gamma})")
    print(f"  Early Stopping: Patience={early_stopping_patience}")
    print(f"  Layer Unfreezing: {unfreeze_layers}")
    print(f"  Training samples: {len(train_labels)}")
    print(f"  Validation samples: {len(val_labels)}")
    print(f"  Test samples: {len(test_labels)}")
    print(f"  Number of classes: {len(label_encoder.classes_)}")
    
    # Initialize tokenizer and model
    print(f"\n📥 Loading tokenizer and model...")
    tokenizer = DistilBertTokenizer.from_pretrained(model_name)
    model = DistilBertForSequenceClassification.from_pretrained(
        model_name,
        num_labels=len(label_encoder.classes_)
    ).to(device)
    
    # Create datasets
    print(f"📦 Creating datasets...")
    train_dataset = ComplaintDataset(train_texts, train_labels, tokenizer)
    val_dataset = ComplaintDataset(val_texts, val_labels, tokenizer)
    test_dataset = ComplaintDataset(test_texts, test_labels, tokenizer)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)
    test_loader = DataLoader(test_dataset, batch_size=batch_size)
    
    # Compute class weights
    print(f"\n⚖️  Computing class weights...")
    class_weights = compute_class_weights(train_labels, device)
    
    # Setup loss function
    if use_focal_loss:
        criterion = FocalLoss(alpha=class_weights, gamma=focal_gamma)
    else:
        criterion = torch.nn.CrossEntropyLoss(weight=class_weights)
    
    # Setup optimizer
    optimizer = AdamW(model.parameters(), lr=learning_rate)
    
    # Learning rate scheduler
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(0.1 * total_steps),
        num_training_steps=total_steps
    )
    
    # Early stopping
    early_stopping = EarlyStopping(patience=early_stopping_patience, mode='max')
    
    # Layer unfreezer (if enabled)
    unfreezer = None
    if unfreeze_layers and epochs >= 4:
        # Unfreeze schedule: gradually unfreeze layers
        unfreeze_schedule = [2, 4, 6] if epochs >= 6 else [2, 4]
        unfreezer = LayerUnfreezer(model, unfreeze_schedule)
        print(f"  🔓 Layer unfreezing schedule: {unfreeze_schedule}")
    
    # Training loop
    print(f"\n{'='*70}")
    print(f"TRAINING STARTED")
    print(f"{'='*70}")
    
    history = {
        'train_loss': [],
        'val_loss': [],
        'val_accuracy': [],
        'val_macro_f1': []
    }
    
    best_val_f1 = 0
    best_model_state = None
    
    for epoch in range(epochs):
        print(f"\n📅 Epoch {epoch + 1}/{epochs}")
        print("-" * 70)
        
        # Unfreeze layers if scheduled
        if unfreezer:
            unfreezer.step(epoch)
        
        # Training phase
        model.train()
        total_train_loss = 0
        
        progress_bar = tqdm(train_loader, desc='Training')
        for batch in progress_bar:
            optimizer.zero_grad()
            
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            # Forward pass
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            
            # Calculate loss
            loss = criterion(logits, labels)
            total_train_loss += loss.item()
            
            # Backward pass
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            
            progress_bar.set_postfix({'loss': loss.item()})
        
        avg_train_loss = total_train_loss / len(train_loader)
        history['train_loss'].append(avg_train_loss)
        
        # Validation phase
        model.eval()
        total_val_loss = 0
        all_predictions = []
        all_labels = []
        
        with torch.no_grad():
            for batch in tqdm(val_loader, desc='Validation'):
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['labels'].to(device)
                
                outputs = model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs.logits
                
                loss = criterion(logits, labels)
                total_val_loss += loss.item()
                
                predictions = torch.argmax(logits, dim=1)
                all_predictions.extend(predictions.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        avg_val_loss = total_val_loss / len(val_loader)
        
        # Compute metrics
        from sklearn.metrics import accuracy_score, f1_score
        val_accuracy = accuracy_score(all_labels, all_predictions)
        val_macro_f1 = f1_score(all_labels, all_predictions, average='macro')
        
        history['val_loss'].append(avg_val_loss)
        history['val_accuracy'].append(val_accuracy)
        history['val_macro_f1'].append(val_macro_f1)
        
        print(f"\n  📊 Results:")
        print(f"    Train Loss: {avg_train_loss:.4f}")
        print(f"    Val Loss: {avg_val_loss:.4f}")
        print(f"    Val Accuracy: {val_accuracy:.4f} ({val_accuracy*100:.2f}%)")
        print(f"    Val Macro-F1: {val_macro_f1:.4f} ({val_macro_f1*100:.2f}%)")
        
        # Save best model
        if val_macro_f1 > best_val_f1:
            best_val_f1 = val_macro_f1
            best_model_state = model.state_dict().copy()
            print(f"    ✨ New best Macro-F1! Saved model.")
        
        # Early stopping
        if early_stopping(val_macro_f1):
            print(f"\n  ⏹️  Early stopping triggered at epoch {epoch + 1}")
            break
    
    # Load best model
    if best_model_state is not None:
        model.load_state_dict(best_model_state)
        print(f"\n  ✅ Loaded best model (Macro-F1: {best_val_f1:.4f})")
    
    # Final evaluation on test set
    print(f"\n{'='*70}")
    print(f"TEST SET EVALUATION")
    print(f"{'='*70}")
    
    model.eval()
    test_predictions = []
    test_labels_list = []
    
    with torch.no_grad():
        for batch in tqdm(test_loader, desc='Testing'):
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            
            predictions = torch.argmax(logits, dim=1)
            test_predictions.extend(predictions.cpu().numpy())
            test_labels_list.extend(labels.cpu().numpy())
    
    # Compute comprehensive metrics
    test_metrics = compute_metrics(
        np.array(test_predictions),
        np.array(test_labels_list),
        label_encoder,
        "TEST SET"
    )
    
    # Save model and artifacts
    print(f"\n{'='*70}")
    print(f"SAVING MODEL AND ARTIFACTS")
    print(f"{'='*70}")
    
    os.makedirs(save_dir, exist_ok=True)
    
    # Save model
    model.save_pretrained(os.path.join(save_dir, 'model'))
    tokenizer.save_pretrained(os.path.join(save_dir, 'tokenizer'))
    
    # Save label encoder
    with open(os.path.join(save_dir, 'label_encoder.pkl'), 'wb') as f:
        pickle.dump(label_encoder, f)
    
    # Save training history
    with open(os.path.join(save_dir, 'training_history.json'), 'w') as f:
        json.dump(history, f, indent=2)
    
    # Save test metrics
    save_metrics_report(test_metrics, os.path.join(save_dir, 'test_metrics.json'))
    
    print(f"  💾 Model saved to: {save_dir}")
    
    return model, tokenizer, history, test_metrics


def main():
    parser = argparse.ArgumentParser(description='Train enhanced complaint classifier')
    parser.add_argument('--dataset', type=str, required=True, help='Path to CSV dataset')
    parser.add_argument('--target-column', type=str, required=True, help='Target column name')
    parser.add_argument('--text-column', type=str, default='Complaint Description', 
                       help='Text column name')
    parser.add_argument('--save-dir', type=str, required=True, help='Directory to save model')
    parser.add_argument('--model-name', type=str, default='distilbert-base-uncased',
                       help='Pretrained model name')
    parser.add_argument('--epochs', type=int, default=10, help='Number of epochs')
    parser.add_argument('--batch-size', type=int, default=16, help='Batch size')
    parser.add_argument('--learning-rate', type=float, default=2e-5, help='Learning rate')
    parser.add_argument('--no-focal-loss', action='store_true', help='Disable focal loss')
    parser.add_argument('--focal-gamma', type=float, default=2.0, help='Focal loss gamma')
    parser.add_argument('--early-stopping-patience', type=int, default=3, 
                       help='Early stopping patience')
    parser.add_argument('--no-layer-unfreeze', action='store_true', 
                       help='Disable layer unfreezing')
    parser.add_argument('--seed', type=int, default=42, help='Random seed')
    
    args = parser.parse_args()
    
    # Set random seeds
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)
    
    # Load dataset
    print(f"\n📂 Loading dataset from: {args.dataset}")
    df = pd.read_csv(args.dataset)
    
    print(f"  Total samples: {len(df)}")
    print(f"  Text column: {args.text_column}")
    print(f"  Target column: {args.target_column}")
    
    # Prepare data
    texts = df[args.text_column].values
    labels = df[args.target_column].values
    
    # Encode labels
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(labels)
    
    print(f"\n  Classes: {len(label_encoder.classes_)}")
    print(f"  Class distribution:")
    for cls, count in zip(*np.unique(encoded_labels, return_counts=True)):
        print(f"    {label_encoder.classes_[cls]}: {count}")
    
    # Split data: 70% train, 15% val, 15% test
    train_texts, temp_texts, train_labels, temp_labels = train_test_split(
        texts, encoded_labels, test_size=0.3, random_state=args.seed, stratify=encoded_labels
    )
    
    val_texts, test_texts, val_labels, test_labels = train_test_split(
        temp_texts, temp_labels, test_size=0.5, random_state=args.seed, stratify=temp_labels
    )
    
    # Train
    model, tokenizer, history, metrics = train_enhanced_model(
        train_texts, train_labels,
        val_texts, val_labels,
        test_texts, test_labels,
        label_encoder,
        model_name=args.model_name,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        use_focal_loss=not args.no_focal_loss,
        focal_gamma=args.focal_gamma,
        early_stopping_patience=args.early_stopping_patience,
        unfreeze_layers=not args.no_layer_unfreeze,
        save_dir=args.save_dir
    )
    
    # Print final summary
    print(f"\n{'='*70}")
    print(f"TRAINING COMPLETE - FINAL RESULTS")
    print(f"{'='*70}")
    print(f"  🎯 Test Accuracy: {metrics['accuracy']:.4f} ({metrics['accuracy']*100:.2f}%)")
    print(f"  📊 Test Macro-F1: {metrics['macro_f1']:.4f} ({metrics['macro_f1']*100:.2f}%)")
    print(f"  🎯 Test Precision: {metrics['macro_precision']:.4f}")
    print(f"  🎯 Test Recall: {metrics['macro_recall']:.4f}")
    
    # Check if target achieved
    target_accuracy = 0.90
    if metrics['accuracy'] >= target_accuracy and metrics['macro_f1'] >= target_accuracy:
        print(f"\n  🎉 ✅ TARGET ACHIEVED! Both accuracy and Macro-F1 >= {target_accuracy*100}%")
    elif metrics['macro_f1'] >= target_accuracy:
        print(f"\n  ⚠️  Macro-F1 target achieved but accuracy below {target_accuracy*100}%")
    else:
        print(f"\n  ⚠️  Target {target_accuracy*100}% not yet achieved. Consider:")
        print(f"      - Increasing epochs (current: {args.epochs})")
        print(f"      - Adding more training data")
        print(f"      - Adjusting focal loss gamma")
        print(f"      - Using a larger model (BERT instead of DistilBERT)")
    
    print(f"{'='*70}\n")


if __name__ == '__main__':
    main()
