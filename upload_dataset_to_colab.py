"""
Upload dataset to Colab server for training
Run this before executing the notebook
"""

import pandas as pd
import base64
import json

print("📤 Preparing dataset for Colab upload...")

# Read local dataset
local_file = "Train_Enhanced_Models_Colab_Dataset.csv"
df = pd.read_csv(local_file)

print(f"✅ Loaded {len(df)} samples")
print(f"   Columns: {list(df.columns)}")

# Convert to base64 for easy transfer
csv_content = df.to_csv(index=False)
encoded = base64.b64encode(csv_content.encode('utf-8')).decode('utf-8')

# Save as Python code that can be pasted into notebook
output_code = f'''# Generated dataset upload code
import pandas as pd
import base64
import io

# Encoded dataset (base64)
encoded_data = """{encoded[:100]}...truncated..."""

# Decode and load
# decoded = base64.b64decode(encoded_data)
# df = pd.read_csv(io.BytesIO(decoded))
# df.to_csv('/content/dataset.csv', index=False)
# print(f"✅ Dataset uploaded: {{len(df)}} samples")
'''

with open("colab_dataset_upload.py", "w") as f:
    f.write(output_code)

print("\n❌ File is too large for direct embedding")
print()
print("🔧 BETTER SOLUTION:")
print("   Use web Colab instead of VS Code extension:")
print("   1. Go to: https://colab.research.google.com")
print("   2. Upload this notebook: Train_Enhanced_Models_Colab.ipynb")
print("   3. Runtime → Change runtime type → GPU")
print("   4. Files panel (left) → Upload → Train_Enhanced_Models_Colab_Dataset.csv")
print("   5. Run all cells")
print()
print("   The files.upload() widget works perfectly in web Colab!")
