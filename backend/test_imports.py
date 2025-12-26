"""Quick test to verify all imports work"""
print("Testing imports...")

print("1. Importing pandas...")
import pandas as pd
print("✓ pandas OK")

print("2. Importing numpy...")
import numpy as np
print("✓ numpy OK")

print("3. Importing sklearn...")
from sklearn.model_selection import train_test_split
print("✓ sklearn OK")

print("4. Importing torch...")
import torch
print(f"✓ torch OK (version: {torch.__version__})")

print("5. Importing transformers...")
from transformers import AutoTokenizer, AutoModel
print("✓ transformers OK")

print("\n✅ All imports successful!")
print(f"PyTorch device: {torch.device('cuda' if torch.cuda.is_available() else 'cpu')}")
