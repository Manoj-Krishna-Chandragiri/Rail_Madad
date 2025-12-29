# 👤 Face Enrollment Guide

## ⚠️ Important: You Must Login First!

**Face authentication requires enrollment BEFORE you can use it to login.**

---

## 🔄 Complete Flow

### 1️⃣ For New Users (No Account Yet)

```
Sign Up → Email Verification → Login → Profile → Enroll Face → Logout → Login with Face ✅
```

**Step-by-Step:**

1. **Sign Up** for an account
   - Go to Sign Up page
   - Enter email, password, name, etc.
   - Complete registration

2. **Verify Email** (if required)
   - Check your email inbox
   - Click verification link

3. **Login** with your new credentials
   - Use email + password

4. **Go to Profile Page**
   - Click on your profile/settings
   - Scroll down to "Face Authentication" section

5. **Click "Enroll Face"**
   - Allow camera access when prompted
   - Position your face in the oval guide
   - Ensure good lighting
   - Click "Capture Photo"
   - Wait for confirmation

6. **Logout**

7. **Login with Face** ✅
   - Click "Sign in with Face" on login page
   - Capture your face
   - System will recognize you and log you in!

---

### 2️⃣ For Existing Users (Already Have Account)

```
Login → Profile → Enroll Face → Logout → Login with Face ✅
```

**Step-by-Step:**

1. **Login** using email/password or Google
2. **Navigate to Profile**
   - Click your avatar/profile icon
   - Or go to `/profile` URL
3. **Scroll to "Face Authentication" section**
4. **Click "Enroll Face"** button
5. **Allow camera access**
6. **Capture your face** following the guide
7. **Confirmation** - "Face enrolled successfully!"
8. **Test it:**
   - Logout
   - Click "Sign in with Face"
   - Smile at the camera! 😊

---

## 📍 Where to Find Face Authentication

### In Profile Page:
After logging in, go to:
- **URL:** `http://localhost:5174/profile`
- **Location:** Scroll down past personal info and security settings
- **Section:** "Face Authentication"

### What You'll See:

#### Before Enrollment:
```
┌─────────────────────────────────────┐
│  Face Authentication               │
│                                     │
│  🔒 Not Enrolled                   │
│  Enhance your security with        │
│  facial recognition                │
│                                     │
│  [Enroll Face] button              │
└─────────────────────────────────────┘
```

#### After Enrollment:
```
┌─────────────────────────────────────┐
│  Face Authentication               │
│                                     │
│  ✅ Enrolled                       │
│  [Your face image preview]         │
│  Quality Score: 85%                │
│  Enrolled: Dec 29, 2025            │
│                                     │
│  [Update Face] [Remove Face]       │
│  [View Auth History]               │
└─────────────────────────────────────┘
```

---

## 🎯 Why "No enrolled faces" Error?

You're seeing this error because:

❌ **Trying to login with face BEFORE enrolling**

✅ **Solution:** Follow the enrollment flow above!

### Error Message Explained:
```
"No enrolled faces in database. Please enroll first."
```

This means:
- Your account exists
- But you haven't enrolled your face yet
- You must enroll from Profile page first
- Then you can use face login

---

## 🎥 Camera Tips for Best Results

### Good Conditions ✅
- 💡 **Bright lighting** (natural daylight is best)
- 😊 **Face the camera directly** (not at an angle)
- 👤 **Only one person** in frame
- 🧹 **Clean camera lens**
- 📐 **Face centered** in the oval guide
- 🚫 **No sunglasses** or hats
- 📱 **Hold device steady**

### Poor Conditions ❌
- 🌑 Dim lighting or backlit
- 👥 Multiple people in frame
- 😎 Sunglasses or masks
- 📐 Face at extreme angle
- 🌊 Moving or blurry
- ☀️ Direct bright light behind you

---

## 🔐 Security Features

### What Gets Stored:
- ✅ Your face photo (encrypted)
- ✅ Face encoding (128-dimensional vector - not reversible)
- ✅ Quality score
- ✅ Enrollment timestamp

### What Doesn't Get Stored:
- ❌ Video recordings
- ❌ Multiple photos
- ❌ Biometric raw data

### Privacy:
- Face data is tied to your account only
- Can be removed anytime from Profile
- Used only for authentication
- Not shared with third parties

---

## 📊 Authentication History

After enrollment, you can view:
- ✅ Successful face logins
- ❌ Failed attempts
- 📅 Dates and times
- 🖥️ IP addresses
- 📊 Confidence scores

**Access:** Profile → Face Authentication → View History

---

## ❓ Troubleshooting

### Camera Access Denied
**Problem:** Browser blocks camera  
**Solution:**
1. Click the camera icon in browser address bar
2. Select "Always allow"
3. Refresh page
4. Try again

### Face Not Detected
**Problem:** "No face detected in image"  
**Solution:**
- Improve lighting
- Move closer to camera
- Face camera directly
- Remove obstructions (hat, mask)

### Low Quality Score
**Problem:** "Image quality too low"  
**Solution:**
- Ensure good lighting
- Clean camera lens
- Hold device steady
- Move to brighter location

### "Face already enrolled"
**Problem:** Already have face registered  
**Solution:**
- Click "Update Face" to replace
- Or "Remove Face" to delete

---

## 🚀 Quick Start Checklist

- [ ] Have an account (sign up if needed)
- [ ] Login to your account
- [ ] Navigate to Profile page
- [ ] Scroll to "Face Authentication"
- [ ] Click "Enroll Face"
- [ ] Allow camera access
- [ ] Position face in oval guide
- [ ] Capture photo
- [ ] Wait for confirmation
- [ ] Logout to test
- [ ] Try "Sign in with Face"
- [ ] Success! 🎉

---

## 📞 Need Help?

If you're still having issues:

1. **Check Console:** Press F12 → Console tab for errors
2. **Check Network:** Network tab to see API responses
3. **Clear Cache:** Ctrl+Shift+Delete → Clear all
4. **Try Different Browser:** Chrome, Firefox, Edge
5. **Check Backend:** Ensure Django server is running

---

## 🎓 Video Tutorial (Coming Soon)

Watch a step-by-step video guide:
- How to enroll face
- How to login with face
- How to update/remove face
- Troubleshooting tips

---

**✨ Remember:** Enroll first, login later! 😊
