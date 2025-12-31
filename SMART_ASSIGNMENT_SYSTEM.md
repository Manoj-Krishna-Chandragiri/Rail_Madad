# Smart Complaint Assignment System - Implementation Complete ✅

## Overview
Implemented an intelligent complaint assignment system that:
1. **Categorizes complaints** using AI (Security, Medical, Cleanliness, etc.)
2. **Assigns to specific staff members** based on expertise and workload
3. **Load balances** by assigning to staff with fewer complaints
4. **Prioritizes** based on complaint severity and existing workload
5. **Sorts staff dashboard** by status, severity, and priority

## Key Components

### 1. Assignment Service (`assignment_service.py`)
**Location**: `backend/complaints/assignment_service.py`

**Features**:
- `ComplaintAssignmentService.find_best_staff()` - Finds optimal staff member
- `ComplaintAssignmentService.assign_complaint()` - Assigns complaint to staff
- `ComplaintAssignmentService.get_staff_dashboard()` - Returns sorted complaints
- `ComplaintAssignmentService.get_staff_workload()` - Returns workload stats

**How it works**:
```python
# Score calculation for each staff member
workload_score = 100 - (current_complaints * 10)  # 10 points per complaint
severe_penalty = severe_complaints * 20           # 20 points per severe complaint
expertise_bonus = 50                              # Bonus for matching expertise

total_score = expertise_bonus + workload_score - severe_penalty
```

**Expertise Mapping**:
```python
'security' → ['Security Concerns', 'Escalation Management']
'medical' → ['General Inquiries', 'Escalation Management']
'cleanliness' → ['Complaint Resolution', 'General Inquiries', 'Passenger Assistance']
'electrical' → ['Technical Support', 'Technical Troubleshooting']
# ... and more
```

### 2. Updated Complaint Filing (`views.py`)
**Changes in `file_complaint()` endpoint**:

**Before**:
```python
data['staff'] = 'RPF Security'  # Department name
```

**After**:
```python
from assignment_service import ComplaintAssignmentService

staff_name, staff_id = ComplaintAssignmentService.assign_complaint(
    complaint_category=ai_category,
    severity=ai_severity
)

if staff_name:
    data['staff'] = staff_name  # Actual staff person's name (e.g., "Krishna Murthy")
```

### 3. Staff Dashboard (`staff_dashboard()` endpoint)
**Sorting Order**:
1. **Status**: Open → In Progress → Closed
2. **Severity**: High → Medium → Low  
3. **Priority**: Critical → High → Medium → Low
4. **Date**: Newest first

**Implementation**:
```python
assigned_complaints = Complaint.objects.filter(
    staff=staff_member.name
).order_by(
    Case(When(status='Open', then=Value(0)), ...),      # Status
    Case(When(severity='High', then=Value(0)), ...),    # Severity
    Case(When(priority='Critical', then=Value(0)), ...), # Priority
    '-created_at'  # Date
)
```

**Response includes**:
- Complaints list (sorted)
- Statistics (open, in progress, closed, today's stats)
- Workload information (active complaints, severe count)
- Staff member name and email

## Staff Assignment Examples

### Example 1: Security Complaint
```
Complaint: "My laptop was stolen from the coach"
Category: security
Severity: High

Process:
1. Required expertise: ['Security Concerns', 'Escalation Management']
2. Staff with matching expertise:
   - Krishna Murthy (0 current complaints) → Score: 50 + 100 - 0 = 150 ⭐ BEST
   - Rajasekhar Naidu (2 current complaints) → Score: 50 + 80 - 0 = 130
3. Assign to: Krishna Murthy

Result: "Assigned To: Krishna Murthy"
```

### Example 2: Medical Emergency
```
Complaint: "Passenger has high fever, needs immediate medical help"
Category: medical
Severity: High

Process:
1. Required expertise: ['General Inquiries', 'Escalation Management']
2. Staff with matching expertise:
   - Anjali Reddy (1 current, 0 severe) → Score: 50 + 90 - 0 = 140 ⭐ BEST
   - Padmavathi Sharma (3 current, 1 severe) → Score: 50 + 70 - 20 = 100
3. Assign to: Anjali Reddy

Result: "Assigned To: Anjali Reddy"
```

### Example 3: Multiple Assignments (Load Balancing)
```
Multiple cleanliness complaints arrive:

Complaint 1 → Assigned to: Lakshmi Devi (0 complaints)
           Complaints: 0 → 1

Complaint 2 → Assigned to: Kavitha Rani (0 complaints)
           Complaints: 0 → 1

Complaint 3 → Assigned to: Sai Priya (0 complaints)
           Complaints: 0 → 1

Complaint 4 → Assigned to: Lakshmi Devi (1 complaint, score 90)
           Complaints: 1 → 2

All staff get balanced workload!
```

## Staff Dashboard Display

### Before (No Sorting)
```
Complaint 1: Coach Maintenance (Medium)     - Open
Complaint 2: Medical (High)                 - Open
Complaint 3: Cleanliness (Low)              - Closed
Complaint 4: Security (High)                - In Progress
```

### After (Sorted by Status, Severity, Priority)
```
Complaint 2: Medical (High)                 - Open       ← Status: Open
Complaint 4: Security (High)                - In Progress ← Status: In Progress  
Complaint 1: Coach Maintenance (Medium)     - Open       ← Severity: Medium
Complaint 3: Cleanliness (Low)              - Closed     ← Status: Closed
```

**Sorted by**:
1. **Status** (Open=highest priority)
2. **Severity** (High > Medium > Low)
3. **Priority** (Critical > High > Medium > Low)

## Staff Member Workload Distribution

### Example Workload Calculation
```
Krishna Murthy:
  - Open complaints: 1
  - In Progress: 1
  - High severity: 1
  - Workload score: 1 + 1 + (1 × 2) = 4

Lakshmi Devi:
  - Open complaints: 3
  - In Progress: 1
  - High severity: 2
  - Workload score: 3 + 1 + (2 × 2) = 8

Result: Krishna Murthy gets next assignment (lower workload)
```

## API Endpoints Updated

### 1. POST `/api/complaints/file/`
**Response now includes**:
```json
{
  "complaint_id": 25,
  "ai_classification": {
    "category": "Security",
    "priority": "High",
    "severity": "High",
    "staff_assigned": "Krishna Murthy",  // ← Actual staff name
    "confidence": {...}
  }
}
```

### 2. GET `/api/complaints/staff/dashboard/`
**Response includes**:
```json
{
  "complaints": [...],  // Sorted by status, severity, priority
  "statistics": {
    "open_complaints": 5,
    "high_severity": 2,
    "staff_name": "Krishna Murthy"
  },
  "workload": {
    "open_complaints": 5,
    "closed_complaints": 12,
    "high_severity": 2,
    "active_workload": 9
  }
}
```

## Benefits

### For Passengers
✅ Complaints assigned to qualified staff members
✅ Can see which staff member is handling their complaint
✅ Faster resolution with load-balanced assignments

### For Staff
✅ View their assigned complaints
✅ See high-severity complaints first
✅ Know their current workload

### For Admins
✅ Better complaint distribution
✅ Track staff performance per complaint
✅ Identify bottlenecks and overload

## Database Fields Used

### Complaint Model
- `staff` (CharField) - Staff person's name (updated to store actual names)
- `severity` (CharField) - Low/Medium/High
- `priority` (CharField) - Low/Medium/High/Critical
- `status` (CharField) - Open/In Progress/Closed

### Staff Model
- `name` (CharField) - Full name
- `expertise` (TextField/JSON) - Areas of expertise
- `status` (CharField) - active/inactive
- `active_tickets` (IntegerField) - Current workload tracker

## Next Steps

1. **Test the system** with real complaints
2. **Monitor assignment** efficiency and staff feedback
3. **Adjust weights** if needed (complaint count, severity penalty)
4. **Add more expertise** categories as needed
5. **Implement notifications** when staff is assigned a complaint

## Files Modified

1. ✅ `backend/complaints/assignment_service.py` (NEW)
2. ✅ `backend/complaints/views.py` (file_complaint, staff_dashboard)
3. ✅ `backend/ai_models/hybrid_classifier.py` (context file)

## Configuration

### Category to Expertise Mapping
Currently supports:
- coach-cleanliness
- catering
- staff-behaviour
- ticketing
- electrical
- coach-maintenance
- security
- medical
- punctuality
- amenities
- infrastructure
- miscellaneous

### Scoring Algorithm
```python
Expertise Bonus:        50 points
Per Complaint Penalty:  10 points  
Per Severe Complaint:   20 points

Final Score = Expertise Bonus + (100 - current_complaints × 10) - (severe × 20)
```

### Staff Members Available
1. Akram Naeemuddin (Complaint Resolution, General Inquiries)
2. Manoj (General Inquiries, Passenger Assistance)
3. Surya (Feedback Management, Complaint Resolution)
4. Ramesh Kumar (Technical Support, Technical Troubleshooting)
5. Lakshmi Devi (Booking Issues, General Inquiries, Passenger Assistance)
6. Venkatesh Rao (Refunds, Complaint Resolution)
7. Sai Priya (Feedback Management, Complaint Resolution)
8. Krishna Murthy (Security Concerns, Escalation Management)
9. Anjali Reddy (Passenger Assistance, General Inquiries)
10. Rajasekhar Naidu (Technical Support, Escalation Management)
11. Padmavathi Sharma (Complaint Resolution, Feedback Management)
12. Suresh Babu (Booking Issues, Refunds)
13. Kavitha Rani (General Inquiries, Passenger Assistance)

---

**Status**: ✅ Implementation Complete
**Date**: December 30, 2025
**Next**: Deploy and test with real complaints
