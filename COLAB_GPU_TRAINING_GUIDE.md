# 🚀 Quick Start: Train AI Models with Colab GPU

## ⚠️ **IMPORTANT: Use Web Colab (Not VS Code Extension)**

The VS Code Colab extension has file upload limitations. **Use web Colab for best experience!**

## ✅ Recommended Method: Web Colab

### 1️⃣ Open Web Colab
- Go to: **https://colab.research.google.com**
- Sign in with your Google account

### 2️⃣ Upload Notebook
1. **File** → **Upload notebook**
2. Select: `Train_Enhanced_Models_Colab.ipynb`
3. Or drag and drop the file

### 3️⃣ Enable GPU
1. **Runtime** → **Change runtime type**
2. **Hardware accelerator:** Select **GPU**
3. **GPU type:** Select **T4** (free tier)
4. Click **Save**

### 4️⃣ Upload Dataset
1. Click **Files** icon (📁) in left sidebar
2. Click **Upload** button
3. Select: `Train_Enhanced_Models_Colab_Dataset.csv`
4. Wait for upload to complete (~1 MB file)

### 5️⃣ Run Training
1. **Runtime** → **Run all** (or Ctrl+F9)
2. Wait ~25 minutes for all 4 models to train
3. Monitor progress in cell outputs

### 3️⃣ Verify GPU Connection
Run the first cell to check:
```python
!pip install transformers torch -q
import torch
print(f"GPU Available: {torch.cuda.is_available()}")
print(f"GPU Name: {torch.cuda.get_device_name(0)}")
```

Expected output:
```
✅ GPU Available: True
✅ GPU Name: Tesla T4
```

### 4️⃣ Run All Cells
- Click **"Run All"** button at the top
- Or press `Ctrl+Shift+Alt+Enter`

### 5️⃣ Training Progress
The notebook will train 4 models sequentially:
1. **Category Classifier** (~7 mins)
2. **Staff Assignment** (~5 mins)
3. **Priority Classifier** (~4 mins)
4. **Severity Classifier** (~4 mins)

**Total: ~25 minutes on T4 GPU**

### 6️⃣ Download Trained Models
After training completes, the notebook will create a ZIP file:
- Location: `/content/trained_models.zip` on Colab server
- Extract to: `backend/ai_models/models/enhanced/`

## 🎯 Expected Results

| Model | Target Accuracy | Expected F1 Score |
|-------|----------------|-------------------|
| Category | 85-88% | 85-90% |
| Staff | 92-95% | 90-93% |
| Priority | 93-96% | 90-94% |
| Severity | 91-94% | 88-92% |

## ⚠️ Troubleshooting

**Problem:** Can't select Colab kernel
- **Solution:** Make sure Colab extension is installed and enabled
- Check: Extensions → Search "Colab" → Should show "Google" as publisher

**Problem:** No GPU available
- **Solution:** Sign out and reconnect with GPU runtime
- Command Palette (`Ctrl+Shift+P`) → "Colab: Sign Out" → Reconnect

**Problem:** Training crashes/stops
- **Solution:** Colab free tier has 12-hour session limit
- Restart kernel and resume from last saved checkpoint

**Problem:** Dataset not found
- **Solution:** The notebook will prompt you to upload `Railway_Complaints_Final_Validated.csv`
- Upload when prompted or modify the path in cell 2

## 📊 Monitoring Training

Watch for these indicators of success:
- ✅ Val Macro-F1 increasing each epoch
- ✅ Early stopping triggers (validation plateaus)
- ✅ Best model saved with F1 > 0.90
- ✅ Test evaluation shows high accuracy

## 🎉 After Training

1. **Download models** from Colab
2. **Extract to local directory:**
   ```
   backend/ai_models/models/enhanced/
   ├── category_model/
   ├── staff_model/
   ├── priority_model/
   └── severity_model/
   ```
3. **Update Django service** to use new models
4. **Test API endpoints** with sample complaints
5. **Deploy to production** 🚀

## 💡 Tips

- **Free GPU limit:** 12 hours/day on free tier
- **Batch size:** Use 32 for GPU (vs 16 for CPU)
- **Save often:** Models auto-save after each epoch
- **Parallel training:** Can't run multiple notebooks simultaneously on free tier

---

**Need Help?** Check the notebook's markdown cells for detailed explanations of each step!
