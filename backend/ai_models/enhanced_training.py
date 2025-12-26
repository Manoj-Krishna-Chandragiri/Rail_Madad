"""
Enhanced Training with Focal Loss, Class Weighting, and Early Stopping
For achieving 90%+ accuracy in railway complaint classification
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional
import numpy as np
from sklearn.utils.class_weight import compute_class_weight


class FocalLoss(nn.Module):
    """
    Focal Loss for handling class imbalance
    FL(pt) = -α(1-pt)^γ * log(pt)
    """
    
    def __init__(self, alpha: Optional[torch.Tensor] = None, gamma: float = 2.0, 
                 reduction: str = 'mean'):
        """
        Args:
            alpha: Class weights tensor
            gamma: Focusing parameter (default: 2.0)
            reduction: 'mean' or 'sum'
        """
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction
    
    def forward(self, inputs: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            inputs: (batch_size, num_classes) - raw logits
            targets: (batch_size,) - class indices
        """
        ce_loss = F.cross_entropy(inputs, targets, reduction='none', weight=self.alpha)
        pt = torch.exp(-ce_loss)
        focal_loss = ((1 - pt) ** self.gamma) * ce_loss
        
        if self.reduction == 'mean':
            return focal_loss.mean()
        elif self.reduction == 'sum':
            return focal_loss.sum()
        else:
            return focal_loss


class EarlyStopping:
    """Early stopping to prevent overfitting"""
    
    def __init__(self, patience: int = 3, min_delta: float = 0.001, mode: str = 'min'):
        """
        Args:
            patience: Number of epochs to wait before stopping
            min_delta: Minimum change to qualify as improvement
            mode: 'min' for loss, 'max' for accuracy
        """
        self.patience = patience
        self.min_delta = min_delta
        self.mode = mode
        self.counter = 0
        self.best_score = None
        self.early_stop = False
    
    def __call__(self, score: float) -> bool:
        """
        Returns True if should stop training
        """
        if self.best_score is None:
            self.best_score = score
            return False
        
        if self.mode == 'min':
            improved = score < (self.best_score - self.min_delta)
        else:
            improved = score > (self.best_score + self.min_delta)
        
        if improved:
            self.best_score = score
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True
                return True
        
        return False


class LayerUnfreezer:
    """Gradually unfreeze layers during training"""
    
    def __init__(self, model, unfreeze_schedule: List[int]):
        """
        Args:
            model: The transformer model
            unfreeze_schedule: List of epochs at which to unfreeze layers
        """
        self.model = model
        self.unfreeze_schedule = sorted(unfreeze_schedule)
        self.current_epoch = 0
        
        # Freeze all parameters initially
        for param in model.base_model.parameters():
            param.requires_grad = False
        
        # Always keep classifier unfrozen
        for param in model.classifier.parameters():
            param.requires_grad = True
    
    def step(self, epoch: int):
        """Unfreeze layers based on schedule"""
        if epoch in self.unfreeze_schedule:
            # Get transformer layers
            if hasattr(self.model, 'distilbert'):
                transformer = self.model.distilbert.transformer
            elif hasattr(self.model, 'bert'):
                transformer = self.model.bert.encoder
            else:
                return
            
            # Unfreeze from last layer backwards
            layers = list(transformer.layer)
            num_to_unfreeze = self.unfreeze_schedule.index(epoch) + 1
            
            for layer in layers[-num_to_unfreeze:]:
                for param in layer.parameters():
                    param.requires_grad = True
            
            print(f"  🔓 Unfroze last {num_to_unfreeze} layers")


def compute_class_weights(labels: np.ndarray, device: torch.device) -> torch.Tensor:
    """Compute class weights for imbalanced datasets"""
    unique_classes = np.unique(labels)
    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=unique_classes,
        y=labels
    )
    
    # Convert to tensor
    weights = torch.tensor(class_weights, dtype=torch.float32).to(device)
    
    print(f"  📊 Class weights computed:")
    for i, w in enumerate(weights):
        print(f"    Class {i}: {w:.3f}")
    
    return weights


def get_loss_function(loss_type: str, class_weights: Optional[torch.Tensor] = None,
                      gamma: float = 2.0) -> nn.Module:
    """
    Get loss function
    
    Args:
        loss_type: 'cross_entropy', 'focal', or 'weighted_cross_entropy'
        class_weights: Class weights tensor
        gamma: Focal loss gamma parameter
    """
    if loss_type == 'focal':
        print(f"  Using Focal Loss (gamma={gamma})")
        return FocalLoss(alpha=class_weights, gamma=gamma)
    elif loss_type == 'weighted_cross_entropy' and class_weights is not None:
        print(f"  Using Weighted Cross Entropy")
        return nn.CrossEntropyLoss(weight=class_weights)
    else:
        print(f"  Using Standard Cross Entropy")
        return nn.CrossEntropyLoss()


def compute_metrics(predictions: np.ndarray, labels: np.ndarray, 
                   label_encoder, metric_name: str = "Model") -> Dict:
    """
    Compute comprehensive metrics including macro-F1
    
    Returns dict with accuracy, macro_f1, precision, recall, f1_per_class
    """
    from sklearn.metrics import (
        accuracy_score, 
        f1_score, 
        precision_score, 
        recall_score,
        classification_report,
        confusion_matrix
    )
    
    accuracy = accuracy_score(labels, predictions)
    macro_f1 = f1_score(labels, predictions, average='macro')
    macro_precision = precision_score(labels, predictions, average='macro', zero_division=0)
    macro_recall = recall_score(labels, predictions, average='macro', zero_division=0)
    
    # Per-class metrics
    f1_per_class = f1_score(labels, predictions, average=None, zero_division=0)
    
    # Classification report
    target_names = label_encoder.classes_
    report = classification_report(labels, predictions, target_names=target_names, 
                                   zero_division=0, output_dict=True)
    
    print(f"\n{'='*70}")
    print(f"{metric_name} PERFORMANCE METRICS")
    print(f"{'='*70}")
    print(f"  🎯 Accuracy:        {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"  📊 Macro F1-Score:  {macro_f1:.4f} ({macro_f1*100:.2f}%)")
    print(f"  🎯 Macro Precision: {macro_precision:.4f} ({macro_precision*100:.2f}%)")
    print(f"  🎯 Macro Recall:    {macro_recall:.4f} ({macro_recall*100:.2f}%)")
    
    print(f"\n  Per-Class F1-Scores:")
    for i, (class_name, f1) in enumerate(zip(target_names, f1_per_class)):
        print(f"    {class_name:<30}: {f1:.4f} ({f1*100:.1f}%)")
    
    # Confusion matrix
    cm = confusion_matrix(labels, predictions)
    print(f"\n  Confusion Matrix:")
    print(f"    Shape: {cm.shape}")
    print(f"    Diagonal sum (correct): {np.trace(cm)}/{len(labels)} ({np.trace(cm)/len(labels)*100:.1f}%)")
    
    return {
        'accuracy': accuracy,
        'macro_f1': macro_f1,
        'macro_precision': macro_precision,
        'macro_recall': macro_recall,
        'f1_per_class': f1_per_class.tolist(),
        'classification_report': report,
        'confusion_matrix': cm.tolist()
    }


def save_metrics_report(metrics: Dict, save_path: str):
    """Save metrics to JSON file"""
    import json
    import numpy as np
    
    # Convert numpy arrays to lists
    def convert_to_serializable(obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, dict):
            return {k: convert_to_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_to_serializable(item) for item in obj]
        else:
            return obj
    
    metrics_serializable = convert_to_serializable(metrics)
    
    with open(save_path, 'w') as f:
        json.dump(metrics_serializable, f, indent=2)
    
    print(f"\n  💾 Metrics saved to: {save_path}")
