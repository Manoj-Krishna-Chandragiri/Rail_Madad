# Feedback Integration Plan

## Changes Made

### 1. Fixed Real-Time Support Staff Fetching ✅
- **File**: `backend/complaints/views.py`
- **Change**: Updated `staff_list()` and `staff_detail()` to use `complaints.Staff` model (complaints_staff table) instead of `accounts.Staff`
- **Result**: Now only shows the 3 staff members from complaints_staff table, not admins from accounts_staff

### 2. Feedback Form Integration (To Be Implemented)

#### Backend Changes Needed

**a. Update Complaint Model**
- Add `resolved_by_id` field to link to Staff who resolved the complaint
- Already has `resolved_by` (name) and `resolved_at` fields

**b. Update Feedback Model** 
- Link feedback to specific complaint (already has `complaint_id`)
- Add `staff_id` field to link feedback to the staff member who resolved it
- This will enable:
  - Staff performance tracking
  - Staff analytics based on feedback ratings
  
**c. Create/Update API Endpoints**
```python
# New endpoint: Get complaint details with staff info
GET /api/complaints/{id}/details/
Response: {
  "id": 1,
  "description": "...",
  "status": "Closed",
  "resolved_by": "Staff Name",
  "resolved_by_id": 2,
  "resolved_at": "2025-12-30",
  ...
}

# Update feedback endpoint to accept staff_id
POST /api/complaints/feedback/
Body: {
  "complaint_id": "CMP001",
  "staff_id": 2,
  "rating": 5,
  "feedback_message": "...",
  ...
}
```

#### Frontend Changes Needed

**a. Track Status Page (`TrackStatus.tsx`)**
- Show "Give Feedback" button for resolved complaints
- Pass complaint ID and staff ID to feedback form
- Display assigned staff name for all complaints

**b. Feedback Form (`FeedbackForm.tsx`)**
- Accept complaint ID and staff ID from URL params or state
- Pre-fill complaint details
- Submit feedback linked to specific complaint and staff
- Show complaint details in the form

**c. Notifications**
- When complaint is assigned:
  ```
  "Your complaint CMP001 has been assigned to [Staff Name]"
  ```
- When complaint is resolved:
  ```
  "Your complaint CMP001 has been resolved by [Staff Name]. Please provide your feedback to help us improve our service."
  ```
  Include a "Give Feedback" button that navigates to feedback form with pre-filled data

### 3. Staff Performance Integration

#### Database Changes
```sql
-- Add staff_id to feedback table
ALTER TABLE complaints_feedback 
ADD COLUMN staff_id INT,
ADD FOREIGN KEY (staff_id) REFERENCES complaints_staff(id);

-- Or if you want to link to resolved_by field in complaints
-- Just use the existing complaint_id relationship
```

#### Analytics Updates
- Staff Analytics page should aggregate feedback ratings by staff
- Show average rating per staff member
- Show number of resolved complaints per staff
- Show number of feedback responses per staff

## Implementation Steps

1. **Database Migration** (Priority: High)
   - Add `staff_id` to feedback table
   - Update complaint resolution logic to store staff ID

2. **Backend API Updates** (Priority: High)
   - Update complaint detail endpoint to include staff info
   - Update feedback submission endpoint to accept staff_id
   - Create endpoint to get feedback stats by staff

3. **Frontend Updates** (Priority: Medium)
   - Update TrackStatus to show "Give Feedback" for resolved complaints
   - Update FeedbackForm to accept and display complaint/staff context
   - Update Notifications to show complaint assignment/resolution

4. **Staff Performance Dashboard** (Priority: Low)
   - Integrate feedback ratings into staff analytics
   - Show performance metrics based on feedback

## Current Status

✅ Fixed: Real-Time Support now fetches only from complaints_staff table  
⏳ Pending: Feedback form integration with complaints and staff  
⏳ Pending: Notification system for complaint assignment/resolution  
⏳ Pending: Staff performance analytics with feedback ratings  

## Notes

- The complaints_staff table currently has 3 staff members:
  1. Akram Naeemuddin Shaik
  2. Manoj  
  3. Surya

- The feedback system needs to be complaint-centric, not general
- Feedback should only be possible for resolved complaints
- Staff ratings should be based on actual performance (resolved complaints + feedback)
