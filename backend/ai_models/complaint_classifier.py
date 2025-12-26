"""
Advanced Complaint Classification System using BERT/DistilBERT
This model classifies complaints into categories, assigns staff, and predicts priority/severity
"""

import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import (
    DistilBertTokenizer, 
    DistilBertForSequenceClassification,
    BertTokenizer,
    BertForSequenceClassification,
    get_linear_schedule_with_warmup
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import json
import os
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')


class ComplaintDataset(Dataset):
    """Custom Dataset for Complaint Text Classification"""
    
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
        
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }


class ComplaintClassifier:
    """Multi-output Complaint Classification System"""
    
    def __init__(self, model_type='distilbert', model_name=None):
        """
        Initialize the complaint classifier
        
        Args:
            model_type: 'distilbert' or 'bert'
            model_name: Custom model name or None for defaults
        """
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        self.model_type = model_type
        
        # Set model names
        if model_name is None:
            if model_type == 'distilbert':
                self.model_name = 'distilbert-base-uncased'
            else:
                self.model_name = 'bert-base-uncased'
        else:
            self.model_name = model_name
        
        # Initialize tokenizer
        if model_type == 'distilbert':
            self.tokenizer = DistilBertTokenizer.from_pretrained(self.model_name)
        else:
            self.tokenizer = BertTokenizer.from_pretrained(self.model_name)
        
        # Label encoders for different outputs
        self.category_encoder = LabelEncoder()
        self.staff_encoder = LabelEncoder()
        self.priority_encoder = LabelEncoder()
        self.severity_encoder = LabelEncoder()
        
        # Models for each classification task
        self.category_model = None
        self.staff_model = None
        self.priority_model = None
        self.severity_model = None
        
        # Training history
        self.training_history = {
            'category': [],
            'staff': [],
            'priority': [],
            'severity': []
        }
    
    def load_and_prepare_data(self, csv_path):
        """Load and prepare data from CSV"""
        print(f"\nLoading data from {csv_path}")
        df = pd.read_csv(csv_path)
        
        print(f"Dataset shape: {df.shape}")
        print(f"\nColumns: {df.columns.tolist()}")
        print(f"\nCategory distribution:\n{df['Category'].value_counts()}")
        print(f"\nStaff distribution:\n{df['Staff Assignment'].value_counts()}")
        print(f"\nPriority distribution:\n{df['Auto Priority'].value_counts()}")
        print(f"\nSeverity distribution:\n{df['Auto Severity'].value_counts()}")
        
        return df
    
    def prepare_labels(self, df):
        """Encode all labels"""
        category_labels = self.category_encoder.fit_transform(df['Category'])
        staff_labels = self.staff_encoder.fit_transform(df['Staff Assignment'])
        priority_labels = self.priority_encoder.fit_transform(df['Auto Priority'])
        severity_labels = self.severity_encoder.fit_transform(df['Auto Severity'])
        
        return category_labels, staff_labels, priority_labels, severity_labels
    
    def create_data_loaders(self, texts, labels, test_size=0.2, batch_size=16, val_size=0.1):
        """Create train, validation, and test data loaders"""
        # Split into train+val and test
        X_train_val, X_test, y_train_val, y_test = train_test_split(
            texts, labels, test_size=test_size, random_state=42, stratify=labels
        )
        
        # Split train+val into train and val
        val_size_adjusted = val_size / (1 - test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_train_val, y_train_val, test_size=val_size_adjusted, 
            random_state=42, stratify=y_train_val
        )
        
        print(f"\nData split:")
        print(f"Training samples: {len(X_train)}")
        print(f"Validation samples: {len(X_val)}")
        print(f"Test samples: {len(X_test)}")
        
        # Create datasets
        train_dataset = ComplaintDataset(X_train, y_train, self.tokenizer)
        val_dataset = ComplaintDataset(X_val, y_val, self.tokenizer)
        test_dataset = ComplaintDataset(X_test, y_test, self.tokenizer)
        
        # Create data loaders
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=batch_size)
        test_loader = DataLoader(test_dataset, batch_size=batch_size)
        
        return train_loader, val_loader, test_loader
    
    def initialize_model(self, num_labels):
        """Initialize a new model"""
        if self.model_type == 'distilbert':
            model = DistilBertForSequenceClassification.from_pretrained(
                self.model_name,
                num_labels=num_labels
            )
        else:
            model = BertForSequenceClassification.from_pretrained(
                self.model_name,
                num_labels=num_labels
            )
        
        return model.to(self.device)
    
    def train_model(self, model, train_loader, val_loader, epochs=3, learning_rate=2e-5):
        """Train a single model"""
        optimizer = AdamW(model.parameters(), lr=learning_rate)
        total_steps = len(train_loader) * epochs
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=0,
            num_training_steps=total_steps
        )
        
        history = {'train_loss': [], 'val_loss': [], 'val_accuracy': []}
        
        for epoch in range(epochs):
            print(f"\nEpoch {epoch + 1}/{epochs}")
            
            # Training
            model.train()
            total_train_loss = 0
            
            progress_bar = tqdm(train_loader, desc='Training')
            for batch in progress_bar:
                optimizer.zero_grad()
                
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                outputs = model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                loss = outputs.loss
                total_train_loss += loss.item()
                
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
                scheduler.step()
                
                progress_bar.set_postfix({'loss': loss.item()})
            
            avg_train_loss = total_train_loss / len(train_loader)
            history['train_loss'].append(avg_train_loss)
            
            # Validation
            model.eval()
            total_val_loss = 0
            predictions = []
            true_labels = []
            
            with torch.no_grad():
                for batch in tqdm(val_loader, desc='Validation'):
                    input_ids = batch['input_ids'].to(self.device)
                    attention_mask = batch['attention_mask'].to(self.device)
                    labels = batch['labels'].to(self.device)
                    
                    outputs = model(
                        input_ids=input_ids,
                        attention_mask=attention_mask,
                        labels=labels
                    )
                    
                    loss = outputs.loss
                    total_val_loss += loss.item()
                    
                    logits = outputs.logits
                    preds = torch.argmax(logits, dim=1)
                    
                    predictions.extend(preds.cpu().numpy())
                    true_labels.extend(labels.cpu().numpy())
            
            avg_val_loss = total_val_loss / len(val_loader)
            val_accuracy = accuracy_score(true_labels, predictions)
            
            history['val_loss'].append(avg_val_loss)
            history['val_accuracy'].append(val_accuracy)
            
            print(f"Train Loss: {avg_train_loss:.4f}")
            print(f"Val Loss: {avg_val_loss:.4f}")
            print(f"Val Accuracy: {val_accuracy:.4f}")
        
        return history
    
    def evaluate_model(self, model, test_loader, label_encoder):
        """Evaluate model on test set"""
        model.eval()
        predictions = []
        true_labels = []
        
        with torch.no_grad():
            for batch in tqdm(test_loader, desc='Testing'):
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                outputs = model(
                    input_ids=input_ids,
                    attention_mask=attention_mask
                )
                
                logits = outputs.logits
                preds = torch.argmax(logits, dim=1)
                
                predictions.extend(preds.cpu().numpy())
                true_labels.extend(labels.cpu().numpy())
        
        accuracy = accuracy_score(true_labels, predictions)
        
        print(f"\nTest Accuracy: {accuracy:.4f}")
        print(f"\nClassification Report:")
        print(classification_report(
            true_labels, 
            predictions, 
            target_names=label_encoder.classes_
        ))
        
        return accuracy, predictions, true_labels
    
    def train_all_models(self, csv_path, epochs=3, batch_size=16):
        """Train all four classification models"""
        # Load data
        df = self.load_and_prepare_data(csv_path)
        texts = df['Complaint Description'].values
        
        # Prepare labels
        category_labels, staff_labels, priority_labels, severity_labels = self.prepare_labels(df)
        
        # Train Category Model
        print("\n" + "="*50)
        print("TRAINING CATEGORY CLASSIFIER")
        print("="*50)
        
        train_loader, val_loader, test_loader = self.create_data_loaders(
            texts, category_labels, batch_size=batch_size
        )
        
        self.category_model = self.initialize_model(len(self.category_encoder.classes_))
        history = self.train_model(self.category_model, train_loader, val_loader, epochs)
        self.training_history['category'] = history
        
        accuracy, _, _ = self.evaluate_model(
            self.category_model, test_loader, self.category_encoder
        )
        print(f"\nCategory Model Test Accuracy: {accuracy:.4f}")
        
        # Train Staff Assignment Model
        print("\n" + "="*50)
        print("TRAINING STAFF ASSIGNMENT CLASSIFIER")
        print("="*50)
        
        train_loader, val_loader, test_loader = self.create_data_loaders(
            texts, staff_labels, batch_size=batch_size
        )
        
        self.staff_model = self.initialize_model(len(self.staff_encoder.classes_))
        history = self.train_model(self.staff_model, train_loader, val_loader, epochs)
        self.training_history['staff'] = history
        
        accuracy, _, _ = self.evaluate_model(
            self.staff_model, test_loader, self.staff_encoder
        )
        print(f"\nStaff Assignment Model Test Accuracy: {accuracy:.4f}")
        
        # Train Priority Model
        print("\n" + "="*50)
        print("TRAINING PRIORITY CLASSIFIER")
        print("="*50)
        
        train_loader, val_loader, test_loader = self.create_data_loaders(
            texts, priority_labels, batch_size=batch_size
        )
        
        self.priority_model = self.initialize_model(len(self.priority_encoder.classes_))
        history = self.train_model(self.priority_model, train_loader, val_loader, epochs)
        self.training_history['priority'] = history
        
        accuracy, _, _ = self.evaluate_model(
            self.priority_model, test_loader, self.priority_encoder
        )
        print(f"\nPriority Model Test Accuracy: {accuracy:.4f}")
        
        # Train Severity Model
        print("\n" + "="*50)
        print("TRAINING SEVERITY CLASSIFIER")
        print("="*50)
        
        train_loader, val_loader, test_loader = self.create_data_loaders(
            texts, severity_labels, batch_size=batch_size
        )
        
        self.severity_model = self.initialize_model(len(self.severity_encoder.classes_))
        history = self.train_model(self.severity_model, train_loader, val_loader, epochs)
        self.training_history['severity'] = history
        
        accuracy, _, _ = self.evaluate_model(
            self.severity_model, test_loader, self.severity_encoder
        )
        print(f"\nSeverity Model Test Accuracy: {accuracy:.4f}")
        
        print("\n" + "="*50)
        print("ALL MODELS TRAINED SUCCESSFULLY!")
        print("="*50)
    
    def save_models(self, save_dir='models/complaint_classifier'):
        """Save all models and encoders"""
        os.makedirs(save_dir, exist_ok=True)
        
        # Save models
        print(f"\nSaving models to {save_dir}")
        
        self.category_model.save_pretrained(f"{save_dir}/category_model")
        self.staff_model.save_pretrained(f"{save_dir}/staff_model")
        self.priority_model.save_pretrained(f"{save_dir}/priority_model")
        self.severity_model.save_pretrained(f"{save_dir}/severity_model")
        
        # Save tokenizer
        self.tokenizer.save_pretrained(f"{save_dir}/tokenizer")
        
        # Save label encoders
        encoders = {
            'category': self.category_encoder.classes_.tolist(),
            'staff': self.staff_encoder.classes_.tolist(),
            'priority': self.priority_encoder.classes_.tolist(),
            'severity': self.severity_encoder.classes_.tolist()
        }
        
        with open(f"{save_dir}/label_encoders.json", 'w') as f:
            json.dump(encoders, f, indent=2)
        
        # Save training history
        with open(f"{save_dir}/training_history.json", 'w') as f:
            json.dump(self.training_history, f, indent=2)
        
        # Save model config
        config = {
            'model_type': self.model_type,
            'model_name': self.model_name,
            'device': str(self.device)
        }
        
        with open(f"{save_dir}/config.json", 'w') as f:
            json.dump(config, f, indent=2)
        
        print("All models and configurations saved successfully!")
    
    def load_models(self, save_dir='models/complaint_classifier'):
        """Load all models and encoders"""
        print(f"\nLoading models from {save_dir}")
        
        # Load config
        with open(f"{save_dir}/config.json", 'r') as f:
            config = json.load(f)
        
        self.model_type = config['model_type']
        self.model_name = config['model_name']
        
        # Load tokenizer
        if self.model_type == 'distilbert':
            self.tokenizer = DistilBertTokenizer.from_pretrained(f"{save_dir}/tokenizer")
            self.category_model = DistilBertForSequenceClassification.from_pretrained(
                f"{save_dir}/category_model"
            ).to(self.device)
            self.staff_model = DistilBertForSequenceClassification.from_pretrained(
                f"{save_dir}/staff_model"
            ).to(self.device)
            self.priority_model = DistilBertForSequenceClassification.from_pretrained(
                f"{save_dir}/priority_model"
            ).to(self.device)
            self.severity_model = DistilBertForSequenceClassification.from_pretrained(
                f"{save_dir}/severity_model"
            ).to(self.device)
        else:
            self.tokenizer = BertTokenizer.from_pretrained(f"{save_dir}/tokenizer")
            self.category_model = BertForSequenceClassification.from_pretrained(
                f"{save_dir}/category_model"
            ).to(self.device)
            self.staff_model = BertForSequenceClassification.from_pretrained(
                f"{save_dir}/staff_model"
            ).to(self.device)
            self.priority_model = BertForSequenceClassification.from_pretrained(
                f"{save_dir}/priority_model"
            ).to(self.device)
            self.severity_model = BertForSequenceClassification.from_pretrained(
                f"{save_dir}/severity_model"
            ).to(self.device)
        
        # Load label encoders
        with open(f"{save_dir}/label_encoders.json", 'r') as f:
            encoders = json.load(f)
        
        self.category_encoder.classes_ = np.array(encoders['category'])
        self.staff_encoder.classes_ = np.array(encoders['staff'])
        self.priority_encoder.classes_ = np.array(encoders['priority'])
        self.severity_encoder.classes_ = np.array(encoders['severity'])
        
        print("All models loaded successfully!")
    
    def predict(self, complaint_text):
        """Predict category, staff, priority, and severity for a complaint"""
        # Prepare input
        encoding = self.tokenizer.encode_plus(
            complaint_text,
            add_special_tokens=True,
            max_length=128,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        
        # Get predictions from all models
        self.category_model.eval()
        self.staff_model.eval()
        self.priority_model.eval()
        self.severity_model.eval()
        
        with torch.no_grad():
            # Category prediction
            category_output = self.category_model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )
            category_pred = torch.argmax(category_output.logits, dim=1).cpu().numpy()[0]
            category_probs = torch.softmax(category_output.logits, dim=1).cpu().numpy()[0]
            
            # Staff prediction
            staff_output = self.staff_model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )
            staff_pred = torch.argmax(staff_output.logits, dim=1).cpu().numpy()[0]
            staff_probs = torch.softmax(staff_output.logits, dim=1).cpu().numpy()[0]
            
            # Priority prediction
            priority_output = self.priority_model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )
            priority_pred = torch.argmax(priority_output.logits, dim=1).cpu().numpy()[0]
            priority_probs = torch.softmax(priority_output.logits, dim=1).cpu().numpy()[0]
            
            # Severity prediction
            severity_output = self.severity_model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )
            severity_pred = torch.argmax(severity_output.logits, dim=1).cpu().numpy()[0]
            severity_probs = torch.softmax(severity_output.logits, dim=1).cpu().numpy()[0]
        
        result = {
            'category': {
                'prediction': self.category_encoder.inverse_transform([category_pred])[0],
                'confidence': float(np.max(category_probs)),
                'all_probabilities': {
                    label: float(prob) 
                    for label, prob in zip(self.category_encoder.classes_, category_probs)
                }
            },
            'staff_assignment': {
                'prediction': self.staff_encoder.inverse_transform([staff_pred])[0],
                'confidence': float(np.max(staff_probs)),
                'all_probabilities': {
                    label: float(prob) 
                    for label, prob in zip(self.staff_encoder.classes_, staff_probs)
                }
            },
            'priority': {
                'prediction': self.priority_encoder.inverse_transform([priority_pred])[0],
                'confidence': float(np.max(priority_probs)),
                'all_probabilities': {
                    label: float(prob) 
                    for label, prob in zip(self.priority_encoder.classes_, priority_probs)
                }
            },
            'severity': {
                'prediction': self.severity_encoder.inverse_transform([severity_pred])[0],
                'confidence': float(np.max(severity_probs)),
                'all_probabilities': {
                    label: float(prob) 
                    for label, prob in zip(self.severity_encoder.classes_, severity_probs)
                }
            }
        }
        
        return result


if __name__ == "__main__":
    # Example usage
    print("="*70)
    print("RAILWAY COMPLAINT CLASSIFICATION SYSTEM")
    print("Using BERT/DistilBERT for Multi-output Classification")
    print("="*70)
    
    # Initialize classifier
    classifier = ComplaintClassifier(model_type='distilbert')
    
    # Train models
    csv_path = '../Railway_Complaints_Enhanced_Dataset.csv'
    classifier.train_all_models(csv_path, epochs=4, batch_size=16)
    
    # Save models
    classifier.save_models('models/complaint_classifier')
    
    # Test prediction
    print("\n" + "="*70)
    print("TESTING PREDICTIONS")
    print("="*70)
    
    test_complaints = [
        "The toilet is overflowing and smells terrible",
        "Someone stole my bag while I was sleeping",
        "The AC is not working at all in this coach",
        "Passengers are drinking alcohol and creating nuisance"
    ]
    
    for complaint in test_complaints:
        print(f"\nComplaint: {complaint}")
        result = classifier.predict(complaint)
        print(f"Category: {result['category']['prediction']} (confidence: {result['category']['confidence']:.2%})")
        print(f"Staff: {result['staff_assignment']['prediction']} (confidence: {result['staff_assignment']['confidence']:.2%})")
        print(f"Priority: {result['priority']['prediction']} (confidence: {result['priority']['confidence']:.2%})")
        print(f"Severity: {result['severity']['prediction']} (confidence: {result['severity']['confidence']:.2%})")
