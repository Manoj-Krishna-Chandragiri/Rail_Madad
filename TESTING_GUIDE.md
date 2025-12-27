# Testing Guide - New Features

## Quick Start

### 1. Start the servers (if not already running)

```bash
# Terminal 1 - Backend
cd d:\Projects\Rail_Madad\backend
python manage.py runserver

# Terminal 2 - Frontend
cd d:\Projects\Rail_Madad\frontend
npm run dev
```

### 2. Access URLs

- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:8000
- **Landing Page**: http://localhost:5175/landing

---

## Testing New Admin Features

### Login as Admin
1. Go to: http://localhost:5175/admin-login
2. Use admin credentials (e.g., `adm.railmadad@gmail.com`)

### Test Staff Performance Page
- **URL**: http://localhost:5175/admin-dashboard/staff-performance
- **What to test**:
  - ✅ Stats cards display (total staff, avg rating, etc.)
  - ✅ Month/Year selector works
  - ✅ Department filter dropdown
  - ✅ Sort by rating/tickets/satisfaction
  - ✅ Performance table loads
  - ✅ Export button (UI only)

### Test Analytics Dashboard
- **URL**: http://localhost:5175/admin-dashboard/analytics
- **What to test**:
  - ✅ Overview stats cards
  - ✅ Time range filter (Week/Month/Quarter/Year)
  - ✅ Category distribution chart
  - ✅ Priority distribution chart
  - ✅ Monthly trend visualization
  - ✅ Top performers list

### Test User Management
- **URL**: http://localhost:5175/admin-dashboard/user-management
- **What to test**:
  - ✅ User statistics display
  - ✅ Search functionality
  - ✅ Role filter (Admin/Staff/Passenger)
  - ✅ Status filter (Active/Inactive)
  - ✅ User table loads
  - ✅ Edit/Delete buttons (UI only)

---

## Testing New Staff Features

### Login as Staff
1. Go to: http://localhost:5175/staff-login
2. Use staff credentials

### Test Staff Home
- **URL**: http://localhost:5175/staff-dashboard
- **What to test**:
  - ✅ Stats cards (assigned, pending, in-progress, resolved)
  - ✅ Performance metrics (resolution time, rating, satisfaction)
  - ✅ Quick actions navigation
  - ✅ Recent complaints list
  - ✅ Notification bell with count

### Test Staff Profile
- **URL**: http://localhost:5175/staff-dashboard/profile
- **What to test**:
  - ✅ Profile stats (rating, active tickets, status)
  - ✅ Personal information display
  - ✅ Edit mode toggle
  - ✅ Save/Cancel buttons
  - ✅ Expertise areas tags
  - ✅ Languages spoken tags

### Test Staff Analytics
- **URL**: http://localhost:5175/staff-dashboard/analytics
- **What to test**:
  - ✅ Period selector (Current Month / Yearly)
  - ✅ Current month stats with trend indicators
  - ✅ Month comparison section
  - ✅ Yearly overview stats
  - ✅ Monthly performance trend table

---

## Testing New Passenger Features

### Login as Passenger
1. Go to: http://localhost:5175/passenger-login
2. Use passenger credentials

### Test Notifications Center
- **URL**: http://localhost:5175/user-dashboard/notifications
- **What to test**:
  - ✅ Unread count badge in header
  - ✅ Mark all as read button
  - ✅ Search notifications
  - ✅ Filter by type dropdown
  - ✅ Notification cards with icons
  - ✅ Priority badges
  - ✅ Time ago display
  - ✅ Mark as read action
  - ✅ Delete notification action

### Test Navigation Link
- **URL**: http://localhost:5175/user-dashboard
- **What to test**:
  - ✅ Quick links section has Notifications
  - ✅ Clicking Notifications goes to new page

---

## Backend API Testing

### Test Staff List API
```bash
curl http://localhost:8000/api/accounts/staff/list/
```
**Expected**: JSON array of staff members

### Test Staff Performance API
```bash
# Current month
curl "http://localhost:8000/api/accounts/staff/performance/"

# Specific month
curl "http://localhost:8000/api/accounts/staff/performance/?month=12&year=2024"
```
**Expected**: JSON array of performance records

---

## Navigation Flow Testing

### Admin Flow
1. Login → Admin Home
2. Click "Staff Performance" card → Staff Performance page
3. Click "Analytics" card → Analytics page
4. Click "User Management" card → User Management page
5. Use sidebar navigation to switch pages
6. Check breadcrumbs work

### Staff Flow
1. Login → Staff Home
2. Click "My Complaints" → Assigned complaints
3. Click "My Analytics" → Personal analytics
4. Click "My Profile" → Profile page
5. Use sidebar navigation
6. Check theme toggle works

### Passenger Flow
1. Login → Home Dashboard
2. Click "Notifications" in quick links → Notifications page
3. Navigate back to home
4. Check all other quick links work
5. Test complaint filing flow

---

## Theme Testing

### Dark Mode
- ✅ Toggle theme in Settings
- ✅ All new pages support dark mode
- ✅ Colors are readable
- ✅ Gradients look good
- ✅ Icons are visible

### Light Mode
- ✅ Default appearance
- ✅ All new pages support light mode
- ✅ Contrast is good
- ✅ Text is readable

---

## Responsive Testing

### Mobile (< 768px)
- ✅ Stats cards stack vertically
- ✅ Tables scroll horizontally
- ✅ Navigation collapses to menu
- ✅ Filters stack vertically
- ✅ Text is readable

### Tablet (768px - 1024px)
- ✅ 2-column layouts work
- ✅ Stats cards fit properly
- ✅ Navigation is accessible
- ✅ Charts are visible

### Desktop (> 1024px)
- ✅ Full layouts display
- ✅ Multiple columns work
- ✅ All features accessible
- ✅ Optimal spacing

---

## Performance Testing

### Load Times
- ✅ Pages load under 2 seconds
- ✅ API calls complete quickly
- ✅ Images load properly
- ✅ No console errors

### Interactions
- ✅ Buttons respond immediately
- ✅ Filters update quickly
- ✅ Navigation is smooth
- ✅ Animations are smooth

---

## Error Handling Testing

### Test Error Cases
1. ✅ API endpoint down → Show loading state
2. ✅ No data available → Show empty state
3. ✅ Invalid filter → Reset to default
4. ✅ Network error → Show error message

---

## Browser Compatibility

### Test Browsers
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

---

## Known Issues (Minor)

1. **Unused Imports**: Some TypeScript warnings about unused imports (won't affect functionality)
2. **Mock Data**: Analytics and some performance data use mock data (replace with real API calls)
3. **Export Functionality**: Export buttons are UI-only (needs backend implementation)

---

## Success Criteria

### Admin Dashboard
- [x] All 3 new pages load without errors
- [x] Navigation works from admin home
- [x] Theme toggle works on all pages
- [x] All stats display correctly
- [x] Filters and search work

### Staff Dashboard
- [x] All 3 new pages load without errors
- [x] Navigation works from staff home
- [x] Stats are retrieved and displayed
- [x] Profile can be edited
- [x] Analytics show performance data

### Passenger Dashboard
- [x] Notifications page loads
- [x] Navigation link works
- [x] Notifications can be filtered
- [x] Mark as read works
- [x] Delete works

---

## Next Testing Phase

After successful basic testing:
1. Load testing with multiple users
2. Database query optimization
3. Real API integration testing
4. Security testing
5. Accessibility testing (WCAG compliance)

---

## Troubleshooting

### Pages Not Loading
- Check both servers are running
- Clear browser cache
- Check console for errors
- Verify API endpoints are accessible

### Data Not Showing
- Check backend database has data
- Verify API responses in Network tab
- Check localStorage for auth tokens
- Ensure user has correct permissions

### Styling Issues
- Clear Tailwind cache: `npm run dev` (restart)
- Check dark mode is toggled correctly
- Verify Tailwind config includes new files
- Check for CSS conflicts

---

**Happy Testing! 🎉**
