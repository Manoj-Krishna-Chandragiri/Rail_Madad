# Quick Setup Guide - Multimedia Complaint System

## 🚀 Getting Started

### Step 1: Get Cloudinary API Secret

1. Go to: https://cloudinary.com/console
2. Sign in (or create account if needed)    
3. Copy your **API Secret** from Dashboard
4. Add to `backend/.env`:

```env
CLOUDINARY_API_SECRET=your_secret_here_from_cloudinary_dashboard
```

### Step 2: Start Backend Server

```bash
cd backend
python manage.py runserver
```

Expected output:
```
Django version 5.1.5
Starting development server at http://127.0.0.1:8000/
```

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5174/
```

### Step 4: Test the System

1. Open browser: http://localhost:5174
2. Sign in to your account
3. Go to **File Complaint** page
4. Upload test files:
   - Photo of train coach
   - Short video (<2 min)
   - Audio recording

5. Wait for AI analysis (5-15 seconds)
6. Check if fields auto-fill
7. Submit complaint

---

## 🧪 Test Files

### Recommended Test Cases:

**Test 1: Single Photo**
- Take photo of dirty coach
- Upload and wait
- Expected: AI detects "Cleanliness" category

**Test 2: Video**
- Record 30-sec video showing issue
- Upload
- Expected: AI extracts description from video

**Test 3: Audio**
- Record voice complaint in Hindi/English
- Upload
- Expected: AI transcribes and categorizes

**Test 4: Multiple Files**
- Upload 2 photos + 1 audio
- Expected: AI combines insights, picks best confidence

---

## ✅ Success Indicators

After upload, you should see:

```
AI Analysis Results
-------------------
Category: Cleanliness
Severity: High
Urgency: urgent
Confidence: 87.5%
```

Form fields should auto-populate with AI-detected values.

---

## 🐛 Troubleshooting

### Issue: "Cloudinary upload failed"
**Solution:** Add API Secret to `.env` file

### Issue: "Gemini AI analysis failed"
**Check:**
1. API key in `.env` is correct
2. Internet connection working
3. File size < 50MB
4. Check console for rate limit errors

### Issue: "Widget not loading"
**Solution:** 
1. Clear browser cache
2. Check if backend is running
3. Verify CORS settings

---

## 📊 Monitor Usage

### Gemini API:
- Dashboard: https://aistudio.google.com
- Check rate limits (1500/day for multimedia)
- View usage statistics

### Cloudinary:
- Dashboard: https://cloudinary.com/console
- Check storage usage
- Monitor bandwidth

---

## 🎯 Next Features to Test

After basic testing works:

1. ✅ Face authentication on login
2. ✅ SMS verification
3. ✅ Predictive maintenance
4. ✅ Social media integration

---

**Ready to test!** 🚀

Any issues? Check:
1. Backend console for errors
2. Frontend browser console
3. Network tab in DevTools
4. Gemini API dashboard
