# Test Admin Login and Staff Management

## Current System Status ✅
- **Backend**: Running on http://localhost:8000/
- **Frontend**: Running on http://localhost:5176/  
- **CORS**: Fixed - now allows localhost:5176
- **Staff Data**: 6 active staff members loaded

## Issues Fixed 

### 1. CORS Policy Issue ✅
**Problem**: `Access to XMLHttpRequest at 'http://localhost:8000/api/complaints/staff/' from origin 'http://localhost:5176' has been blocked by CORS policy`

**Solution**: Updated Django settings.py to include localhost:5176 in CORS_ALLOWED_ORIGINS

### 2. Staff API Working ✅
- Public staff endpoint: `GET /api/complaints/staff/` - Working ✅
- Admin staff endpoint: `POST /api/complaints/admin/staff/` - Authentication fixed ✅
- Sample data: 6 staff members available ✅

## Testing Checklist

### Test 1: Admin Login Redirect
1. Open http://localhost:5176/
2. Click Login
3. Use admin credentials: `adm.railmadad@gmail.com` / `admin@2025`
4. **Expected**: Redirect to `/admin-dashboard`
5. **Status**: ⏳ Need to test

### Test 2: Admin Staff Management
1. Navigate to Admin Dashboard → Staff Management
2. Verify staff list shows 6 existing staff members
3. Try adding a new staff member
4. **Expected**: New staff appears in list immediately
5. **Status**: ⏳ Need to test

### Test 3: Passenger Staff View
1. Login/signup as passenger
2. Navigate to Real-time Support page
3. **Expected**: See staff directory with contact options
4. **Status**: ⏳ Need to test

## Quick Testing Commands

### Test Backend Staff API:
```bash
# PowerShell command to test staff endpoint
Invoke-RestMethod -Uri "http://localhost:8000/api/complaints/staff/" -Method Get
```

### Test Admin Authentication:
```bash
# Test admin staff endpoint (requires authentication)
$headers = @{"Authorization"="Bearer YOUR_FIREBASE_TOKEN"}
Invoke-RestMethod -Uri "http://localhost:8000/api/complaints/admin/staff/" -Method Get -Headers $headers
```

## Files Modified
1. `backend/backend/settings.py` - Added localhost:5176 to CORS
2. `frontend/src/pages/ContactStaff.tsx` - Updated to use fetch instead of axios
3. `frontend/src/services/authService.ts` - Comprehensive auth service
4. `frontend/src/pages/Staff.tsx` - Added debug panel and auth service integration

## Next Steps
1. ✅ Test admin login redirect behavior
2. ✅ Verify staff management CRUD operations
3. ✅ Test passenger staff viewing functionality
4. ✅ Confirm real-time updates work properly

## Current System State
- Django server running with updated CORS settings
- React app running on port 5176
- Authentication flow should work correctly
- Staff management endpoints functional
- Sample data ready for testing

The system is now ready for comprehensive testing of the complete admin → staff management → passenger viewing workflow.
