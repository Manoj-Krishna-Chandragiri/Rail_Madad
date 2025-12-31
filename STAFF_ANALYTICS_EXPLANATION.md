# Staff Analytics Data Calculation Guide

## Overview
This document explains how staff performance metrics are calculated and where the data comes from in the Rail Madad system.

---

## Data Sources

### 1. **Complaints Table** (`complaints_complaint`)
- Tracks all complaints filed by passengers
- Fields used:
  - `staff`: Name of assigned staff member
  - `status`: Current status (Open, In Progress, Closed)
  - `created_at`: When complaint was filed
  - `resolved_at`: When complaint was marked as Closed
  - `severity`: Low, Medium, High
  - `priority`: Low, Medium, High, Critical

### 2. **Feedback Table** (`complaints_feedback`)
- Stores passenger feedback on resolved complaints
- Fields used:
  - `staff`: Foreign key to Staff model (linked staff member)
  - `complaint_id`: ID of the complaint being reviewed
  - `rating`: 1-5 star rating
  - `feedback_message`: Text feedback
  - `sentiment`: POSITIVE, NEGATIVE, NEUTRAL
  - `submitted_at`: Timestamp of feedback submission
  - `name`: Passenger name (from complaint's user data)
  - `email`: Passenger email

### 3. **Staff Table** (`complaints_staff`)
- Contains staff member records
- Fields used:
  - `name`: Staff member's full name
  - `email`: Staff email (used for login)
  - `rating`: Calculated average rating (updated on each feedback)
  - `status`: active, inactive, on_leave
  - `active_tickets`: Count of open/in-progress tickets

---

## Metric Calculations

### **Staff Dashboard** (`http://localhost:5174/staff-dashboard`)

#### API Endpoint: `/api/complaints/staff/dashboard/`

**Total Assigned**
```python
Complaint.objects.filter(staff=staff_member.name).count()
```
- **What**: Total complaints assigned to this staff member
- **Includes**: All statuses (Open, In Progress, Closed)

**Pending**
```python
Complaint.objects.filter(staff=staff_member.name, status='Open').count()
```
- **What**: Complaints not yet started
- **Status**: Open

**In Progress**
```python
Complaint.objects.filter(staff=staff_member.name, status='In Progress').count()
```
- **What**: Complaints being actively worked on
- **Status**: In Progress

**Resolved Today**
```python
Complaint.objects.filter(
    staff=staff_member.name,
    status='Closed',
    resolved_at__date=today
).count()
```
- **What**: Complaints resolved on current date
- **Date Filter**: `resolved_at` matches today's date

**Avg Resolution Time**
```python
For each resolved complaint:
    time_diff = resolved_at - created_at (in seconds)
    
avg_time = sum(all_time_diffs) / count(resolved_complaints)
avg_hours = avg_time / 3600
```
- **What**: Average time taken to resolve complaints
- **Formula**: Average of (resolved_at - created_at) for all closed complaints
- **Unit**: Hours
- **Example**: If complaint created at 9 AM and resolved at 11 AM = 2 hours

**Your Rating**
```python
avg_rating = Feedback.objects.filter(staff=staff_member).aggregate(Avg('rating'))['rating__avg']
staff.rating = round(avg_rating, 2)
```
- **What**: Average of all passenger feedback ratings
- **Source**: `feedback.rating` field (1-5 stars)
- **Updates**: Automatically recalculated when new feedback is submitted
- **Example**: 2 feedbacks with 5 stars each = 5.0 ⭐

**Customer Satisfaction**
```python
customer_satisfaction = (avg_rating / 5.0) * 100
```
- **What**: Percentage representation of rating
- **Formula**: (Average Rating / 5) × 100
- **Example**: 5.0 rating = (5.0/5.0) × 100 = 100%

---

### **Staff Analytics** (`http://localhost:5174/staff-dashboard/analytics`)

#### API Endpoint: `/api/complaints/staff/{staff_id}/analytics/`

#### Current Month Tab

**Tickets Resolved**
```python
resolved = Complaint.objects.filter(
    staff=staff_name,
    status='Closed'
).count()
```
- **What**: Total complaints resolved (all time)
- **Note**: Currently shows all-time data (monthly filtering to be implemented)

**Avg Resolution Time**
```python
# For each resolved complaint with timestamps:
time_diffs = []
for complaint in resolved_complaints:
    diff_seconds = (complaint.resolved_at - complaint.created_at).total_seconds()
    time_diffs.append(diff_seconds)

avg_seconds = sum(time_diffs) / len(time_diffs)
avg_hours = avg_seconds / 3600
```
- **What**: Same as dashboard avg resolution time
- **Unit**: Hours
- **Precision**: 1 decimal place

**Customer Satisfaction**
```python
avg_rating = Feedback.objects.filter(staff=staff).aggregate(Avg('rating'))['rating__avg']
satisfaction_percentage = (avg_rating / 5.0) * 100
```
- **What**: Percentage based on feedback ratings
- **Same as**: Dashboard customer satisfaction
- **Example**: 5 stars = 100%, 4 stars = 80%, 3 stars = 60%

**Complaints Received**
```python
Complaint.objects.filter(staff=staff_name).count()
```
- **What**: Total complaints assigned (all time)
- **Note**: Monthly filtering to be implemented

#### Yearly Overview Tab

**Total Resolved**
```python
Complaint.objects.filter(
    staff=staff_name,
    status='Closed'
).count()
```
- **What**: Total complaints resolved this year
- **Note**: Currently shows all-time (year filter to be added)

**Average Rating**
```python
Feedback.objects.filter(staff=staff).aggregate(Avg('rating'))['rating__avg']
```
- **What**: Staff's overall rating from all feedback
- **Source**: Feedback ratings (1-5 stars)

**Avg Satisfaction**
```python
(avg_rating / 5.0) * 100
```
- **What**: Percentage form of average rating
- **Same as**: Customer satisfaction

**Total Complaints**
```python
Complaint.objects.filter(staff=staff_name).count()
```
- **What**: All complaints handled this year
- **Note**: Year filter to be implemented

#### Customer Feedback & Ratings Section

**Average Rating**
```python
Feedback.objects.filter(staff=staff).aggregate(Avg('rating'))['rating__avg']
```
- **Display**: X.X out of 5.0
- **Decimal**: 1 decimal place

**Total Feedback**
```python
Feedback.objects.filter(staff=staff).count()
```
- **What**: Count of feedback records linked to this staff

**Feedback Percentage**
```python
feedback_rate = (total_feedback / total_resolved) * 100
```
- **What**: What % of resolved complaints have feedback
- **Example**: 2 feedbacks on 2 resolved = 100%

**Positive Feedback**
```python
Feedback.objects.filter(staff=staff, sentiment='POSITIVE').count()
```
- **What**: Count of feedbacks marked as POSITIVE sentiment
- **Sentiment Analysis**: Done automatically when feedback is submitted

**Positive Percentage**
```python
(positive_count / total_feedback) * 100
```
- **Example**: 2 positive out of 2 total = 100%

**Negative Feedback**
```python
Feedback.objects.filter(staff=staff, sentiment='NEGATIVE').count()
```
- **What**: Count of feedbacks marked as NEGATIVE sentiment

**Recent Feedback**
```python
Feedback.objects.filter(staff=staff).order_by('-submitted_at')[:5]
```
- **What**: Last 5 feedbacks submitted
- **Shows**: Sentiment, date, message, passenger name
- **Ordered**: Most recent first

---

## Data Flow Example

### Scenario: Passenger submits feedback for resolved complaint

1. **Complaint Created**
   ```
   - Created: Dec 30, 2025 9:10 PM
   - Assigned to: Manoj
   - Status: Open
   ```

2. **Complaint Resolved**
   ```
   - Resolved: Dec 31, 2025 11:40 AM
   - Status: Closed
   - Resolution time: ~14.5 hours
   ```

3. **Feedback Submitted**
   ```
   - Rating: 5 stars
   - Message: "Excellent service"
   - Submitted: Dec 31, 2025 12:00 PM
   - Sentiment: POSITIVE (auto-analyzed)
   ```

4. **Staff Rating Updated**
   ```python
   # Before: rating = 0.0
   # After 1st feedback: rating = 5.0
   # After 2nd feedback (also 5 stars): rating = (5+5)/2 = 5.0
   ```

5. **Analytics Updated**
   ```
   - Total Resolved: 2
   - Average Rating: 5.0 ⭐
   - Customer Satisfaction: 100%
   - Avg Resolution Time: 14.5 hours
   - Total Feedback: 2 (100% feedback rate)
   - Positive Feedback: 2 (100% positive)
   ```

---

## Important Notes

### Automatic Updates
- **Staff rating**: Updated immediately when feedback is submitted
- **Customer satisfaction**: Recalculated from current average rating
- **Feedback count**: Incremented on each submission

### Data Integrity
- Feedback linked to staff via foreign key relationship
- Staff assigned to complaints by name (string match)
- Passenger name fetched from complaint's user data

### Future Enhancements
- Monthly/yearly filtering (currently shows all-time data)
- Historical trend tracking
- Performance benchmarking against other staff
- Real-time notifications on new feedback

---

## Troubleshooting

### "Rating shows 0.0"
**Cause**: No feedback linked to staff
**Solution**: Run `python manage.py link_feedback_to_staff`

### "Admin" shows as passenger name
**Cause**: localStorage has "Admin" as userName
**Solution**: Feedback form now fetches passenger name from complaint.passenger_name

### "NaN% in analytics"
**Cause**: Division by zero (no data)
**Solution**: Data will show once complaints are resolved and feedback submitted

### "No monthly data"
**Cause**: Monthly filtering not yet implemented
**Solution**: Currently shows all-time data; monthly breakdown coming soon
