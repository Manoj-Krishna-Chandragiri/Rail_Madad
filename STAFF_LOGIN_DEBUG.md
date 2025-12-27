# Staff Login Debugging Guide

## Issue
Staff signup creates Firebase account but fails to store in Django database, resulting in 404 error during login.

## Changes Made

### 1. Enhanced Frontend Error Handling
**File**: `frontend/src/pages/StaffLogin.tsx`

- Added detailed console logging for staff registration
- Changed error handling to THROW errors instead of silently catching them
- Shows actual backend error messages to user

**What to look for in browser console**:
```
✅ Attempting to register staff in backend...
✅ Staff registered successfully in backend: { user_id: 123, staff_id: 45, ... }
```

**OR if there's an error**:
```
❌ Backend registration failed: AxiosError...
❌ Error details: { error: "..." }
```

### 2. Enhanced Backend Logging
**File**: `backend/accounts/views.py` - `staff_register()` function

Added comprehensive logging at each step:
- Token reception and verification
- Firebase authentication
- User creation
- Staff profile creation

**What to look for in backend console/logs**:
```
staff_register called - Starting staff registration...
Token received (length: 1234)
✅ Firebase token verified - UID: abc123, Email: user@example.com
📝 Staff registration data received:
   Email: user@example.com
   Name: John Doe
   Employee ID: EMP001
   Department: Technical
   Role: Staff
✅ User created: user@example.com (ID: 123)
✅ Staff profile created: EMP001 (ID: 45)
🎉 Staff registration completed successfully for user@example.com
```

## Testing Steps

### Test 1: New Staff Signup
1. Go to Staff Login page
2. Click "Sign up"
3. Fill ALL required fields (including new staff fields):
   - Name
   - Email
   - Phone
   - Gender
   - Address
   - **Employee ID** (required)
   - **Department** (required)
   - **Role** (required)
   - **Location** (required)
   - Password
4. Submit form
5. **Check browser console** for registration logs
6. **Check backend console** for detailed logs
7. Look for success message: "Account created successfully! Please check your email..."

### Test 2: Staff Login After Signup
1. Check email and verify account (if email verification is enabled)
2. Go back to Staff Login page
3. Enter email and password
4. Click "Sign in"
5. **Check browser console** - should NOT see 404 error
6. **Check backend console** - should see user found by email/UID
7. Should redirect to `/staff-dashboard/home`

## Common Errors and Solutions

### Error 1: "No authentication token provided" (401)
**Cause**: Firebase token not being sent in Authorization header
**Solution**: Check that `apiClient` is configured to include token in headers

### Error 2: "Invalid authentication token" (401)
**Cause**: Firebase not initialized or token expired
**Solution**: 
- Check backend Firebase initialization in settings.py
- Make sure serviceAccountKey.json is present
- Token might have expired - try logging out and back in

### Error 3: "Failed to create user: ..." (500)
**Cause**: Database constraint violation or model field issue
**Solution**: Check backend traceback for specific error
Common causes:
- Unique constraint on employee_id
- Missing required model fields
- JSON field formatting issues

### Error 4: "Failed to create staff profile: ..." (500)
**Cause**: Staff model creation failed
**Solution**: Check that:
- User was created successfully first
- All Staff model fields are compatible (expertise, languages as arrays)
- No duplicate Staff record exists for this user

### Error 5: 404 on `/api/accounts/profile/` during login
**Cause**: Staff registration succeeded in Firebase but failed in Django
**Solution**: 
- Check backend logs from signup for errors
- Manually check database for user existence
- Run staff signup test again with enhanced logging

## Manual Database Verification

### Check if User exists:
```sql
SELECT id, email, firebase_uid, full_name, user_type, is_staff, is_admin
FROM accounts_user
WHERE email = 'staff@example.com';
```

### Check if Staff profile exists:
```sql
SELECT s.id, s.employee_id, s.department, s.role, s.location, u.email
FROM accounts_staff s
JOIN accounts_user u ON s.user_id = u.id
WHERE u.email = 'staff@example.com';
```

### Manual fix if User created but Staff profile missing:
```sql
-- Find the user_id
SELECT id FROM accounts_user WHERE email = 'staff@example.com';

-- Create Staff profile manually (replace USER_ID with actual id)
INSERT INTO accounts_staff (user_id, employee_id, department, role, location, status, joining_date)
VALUES (USER_ID, 'EMP001', 'Technical', 'Staff', 'Mumbai', 'active', NOW());
```

## API Endpoint Details

### POST /api/accounts/staff/register/
**Purpose**: Register new staff during signup (before Django authentication)

**Headers**:
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "staff@example.com",
  "name": "John Doe",
  "phone_number": "1234567890",
  "gender": "male",
  "address": "123 Main St",
  "employee_id": "EMP001",
  "department": "Technical",
  "role": "Staff",
  "location": "Mumbai Central",
  "expertise": ["Ticketing", "Refunds"],
  "languages": ["English", "Hindi"],
  "communication_channels": ["Email", "Phone"]
}
```

**Success Response** (201):
```json
{
  "message": "Staff registered successfully",
  "user_id": 123,
  "staff_id": 45,
  "email": "staff@example.com",
  "user_type": "staff"
}
```

**Error Responses**:
- 401: Authentication token missing or invalid
- 500: Database error (check logs for details)

## Next Steps

1. **Start both servers** with logging visible:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python manage.py runserver

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

2. **Test staff signup** and watch BOTH consoles

3. **If signup succeeds** (backend shows ✅), test login immediately

4. **If signup fails**, backend logs will show exactly where it failed

5. **Report findings** with:
   - Full browser console output
   - Full backend console output
   - Which step failed (token verification, user creation, or staff creation)
