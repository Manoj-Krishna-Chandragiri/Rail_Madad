# Database Migration Complete - MySQL

## Migration Status: ✅ SUCCESS

**Date:** December 27, 2025  
**Database:** MySQL 8.0.35 (Aiven Cloud - defaultdb)  
**Migration Type:** Single-table to Role-based Architecture

---

## Summary

The database has been successfully restructured from a single-table user model to a role-based architecture with dedicated tables for Admin, Staff, and Passenger profiles.

---

## Migration Results

### User Accounts Migrated
- **Total FirebaseUser accounts:** 12
- **Admin profiles:** 6
- **Staff profiles:** 2  
- **Passenger profiles:** 12

### Complaint Data
- **Total complaints:** 23
- **Complaint assignments:** 0 (to be populated when staff assigns complaints)

### ✅ Email Field Added (Update: Dec 27, 2025)
All role tables now include the `email` field for direct querying without needing to join with `accounts_firebaseuser`. This makes it much easier to:
- Find users by email in role-specific tables
- Query admins, staff, or passengers directly
- Avoid complex JOIN queries in most cases

---

## Tables Created

### 1. accounts_admin
**Primary Key:** `user_id` (OneToOne with FirebaseUser)

**Fields:**
- user_id (bigint, FK to accounts_firebaseuser.id)
- **email** (varchar 254) **← Added for direct querying**
- full_name (varchar 255)
- phone_number (varchar 20)
- department (varchar 100)
- designation (varchar 100)
- employee_id (varchar 50)
- super_admin (boolean)
- permissions (JSON)
- created_at, updated_at (datetime)

**Sample Data:**
- akram.dcme@gmail.com (Admin ID: 1)
- akramnaeemuddshaik@gmail.com (Admin ID: 3)
- 22BQ1A4225@vvit.net (Admin ID: 5)

---

### 2. accounts_staff
**Primary Key:** `user_id` (OneToOne with FirebaseUser)

**Fields:**
- user_id (bigint, FK to accounts_firebaseuser.id)
- **email** (varchar 254) **← Added for direct querying**
- full_name (varchar 255)
- phone_number (varchar 20)
- employee_id (varchar 50)
- department (varchar 100)
- role (varchar 100)
- location (varchar 255)
- avatar (varchar 255)
- status (varchar 20: 'active', 'on_leave', 'busy')
- joining_date (date)
- expertise (JSON array)
- languages (JSON array)
- communication_preferences (JSON)
- rating (double)
- active_tickets (integer)
- shift_timings (JSON)
- reporting_to_id (integer, FK to accounts_staff.user_id)
- created_at, updated_at (datetime)

**Sample Data:**
- manojkrishnachandragiri@gmail.com - Manoj (Staff ID: 4)
  - Department: Technical Support
  - Location: Hyderabad
- akramnaeemuddin09@gmail.com - Akram Naeemuddin Shaik (Staff ID: 13)
  - Department: Complaint Management
  - Location: Hyderabad

---

### 3. accounts_passenger
**Primary Key:** `user_id` (OneToOne with FirebaseUser)

**Fields:**
- user_id (bigint, FK to accounts_firebaseuser.id)
- **email** (varchar 254) **← Added for direct querying**
- full_name (varchar 255)
- phone_number (varchar 20)
- gender (varchar 20)
- date_of_birth (date)
- address (longtext)
- city (varchar 100)
- state (varchar 100)
- pincode (varchar 10)
- preferred_language (varchar 10)
- notification_preferences (JSON)
- frequent_routes (JSON)
- total_complaints (integer)
- resolved_complaints (integer)
- created_at, updated_at (datetime)

**Sample Data:**
- akram.dcme@gmail.com (Passenger ID: 1)
- chandragirimanoj999@gmail.com (Passenger ID: 2)
- akramnaeemuddshaik@gmail.com (Passenger ID: 3)

---

### 4. accounts_staff_availability
Tracks staff availability and break times.

**Fields:**
- id (bigint, PK)
- staff_id (FK to accounts_staff.user_id)
- date (date)
- start_time, end_time (time)
- is_available (boolean)
- break_start, break_end (time, nullable)
- created_at, updated_at (datetime)

---

### 5. accounts_staff_performance
Tracks staff performance metrics.

**Fields:**
- id (bigint, PK)
- staff_id (FK to accounts_staff.user_id)
- month (date)
- tickets_handled (integer)
- avg_resolution_time (duration)
- satisfaction_rating (decimal 3,2)
- complaints_resolved (integer)
- feedback_count (integer)
- created_at, updated_at (datetime)

---

### 6. complaints_assignment
Links complaints to assigned staff.

**Fields:**
- id (bigint, PK)
- complaint_id (FK to complaints_complaint.id)
- staff_id (FK to accounts_staff.user_id)
- assigned_at (datetime)
- assigned_by_id (FK to accounts_firebaseuser.id, nullable)

**Status:** Table created, awaiting assignment data when staff handles complaints

---

## Migrations Applied

### Accounts App
- ✅ **0009_create_role_tables.py** - Created all role tables
- ✅ **0010_migrate_data_to_role_tables.py** - Migrated user data (faked, used manual script instead)
- ✅ **0011_add_email_to_roles.py** - Added email field to Admin, Staff, and Passenger tables
- ✅ **0012_populate_role_emails.py** - Populated email fields from FirebaseUser table

### Complaints App
- ✅ **0019_create_assignment_table.py** - Created complaints_assignment table
- ✅ **0020_migrate_complaint_assignments.py** - Migrated complaint-staff relationships

---

## Migration Scripts Used

### 1. manual_migrate_data.py
Direct SQL script that successfully migrated all user data:
- Migrated 6 admin users from FirebaseUser (is_admin=True)
- Migrated 2 staff members from complaints_staff table
- Migrated 12 passenger users from FirebaseUser (is_passenger=True)

### 2. verify_migration.py
Verification script using direct SQL queries to confirm:
- Record counts in all tables
- Sample data from each role table
- Join operations between FirebaseUser and role tables

---

## Important Notes

### User Type Flexibility
Users can have multiple roles simultaneously:
- A user can be both Admin and Passenger
- Staff members can also file complaints as Passengers
- This is by design - role tables use OneToOne relationships to FirebaseUser

### Migration Approach
- Django migrations used for schema creation
- Direct SQL used for data migration due to model registry conflicts
- All operations executed against MySQL production database

### Next Steps
1. ✅ Database structure migrated
2. ✅ Data migrated successfully
3. ⏳ Update application code to use new models
4. ⏳ Test all user workflows (admin, staff, passenger)
5. ⏳ Update API endpoints to return role-specific data

---

## Verification Commands

To verify the migration anytime:
```bash
cd backend
$env:USE_SQLITE='False'
python verify_migration.py
```

To check table structure:
```bash
cd backend
$env:USE_SQLITE='False'
python check_table_structure.py
```

---

## Database Configuration

**Environment:** Production  
**Database System:** MySQL 8.0.35  
**Host:** rail-madad-database-railmadad.d.aivencloud.com:21965  
**Database Name:** defaultdb  
**Connection:** Verified working  
**Settings:** USE_SQLITE=False in .env

---

## Migration Team
- Database restructure planned based on DB_RESTRUCTURE_PLAN.md
- Migration executed using accounts/migrations/0009, 0010 and complaints/migrations/0019, 0020
- Data migration handled by manual_migrate_data.py
- Verification completed with verify_migration.py

---

**Status:** ✅ Migration Complete - Ready for Application Code Updates
