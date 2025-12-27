# Database Migration Guide: Role-Based Tables

## Overview
This guide walks through the complete migration from single-table authentication to role-based tables.

## Created Files

### 1. **Models**
- `accounts/models_new_roles.py` - New role-based models (Admin, Staff, Passenger)
- `complaints/models_assignment.py` - Complaint-staff assignment tracking

### 2. **Serializers**
- `accounts/serializers_roles.py` - Role-specific serializers

### 3. **Django Migrations**
- `accounts/migrations/0007_create_role_tables.py` - Creates new tables
- `accounts/migrations/0008_migrate_data_to_role_tables.py` - Migrates data
- `complaints/migrations/0002_create_assignment_table.py` - Creates assignment table
- `complaints/migrations/0003_migrate_complaint_assignments.py` - Migrates assignments

### 4. **Migration Script**
- `migrate_complete_data.py` - Complete migration automation script

---

## Migration Steps

### Step 1: Backup Current Database ⚠️

**CRITICAL: Always backup before migration!**

```bash
# Using migration script (recommended)
python migrate_complete_data.py --backup

# Or manual backup for MySQL
mysqldump -h rail-madad-database-railmadad.d.aivencloud.com -P 21965 -u avnadmin -p railmadad > backup_$(date +%Y%m%d_%H%M%S).sql

# Or manual backup for SQLite
cp db.sqlite3 db.sqlite3.backup_$(date +%Y%m%d_%H%M%S)
```

### Step 2: Review Current Data

Check what will be migrated:

```bash
# Check admin users
python check_both_users.py

# Check staff members
python check_staff.py

# Check passenger users
python manage.py shell
>>> from accounts.models import FirebaseUser
>>> FirebaseUser.objects.filter(is_passenger=True).count()
```

### Step 3: Run Complete Migration

**Option A: Automated (Recommended)**
```bash
# Run all steps: backup + migrate + validate
python migrate_complete_data.py --all
```

**Option B: Step-by-Step**
```bash
# 1. Create backup
python migrate_complete_data.py --backup

# 2. Run migrations
python migrate_complete_data.py --migrate

# 3. Validate results
python migrate_complete_data.py --validate
```

**Option C: Manual Django Migrations**
```bash
# Create tables
python manage.py migrate accounts 0007_create_role_tables

# Migrate data
python manage.py migrate accounts 0008_migrate_data_to_role_tables

# Create assignment table
python manage.py migrate complaints 0002_create_assignment_table

# Migrate assignments
python manage.py migrate complaints 0003_migrate_complaint_assignments
```

### Step 4: Validate Migration

The migration script automatically validates, but you can verify manually:

```bash
python manage.py shell
```

```python
from accounts.models import FirebaseUser
from accounts.models_new_roles import Admin, Staff, Passenger
from complaints.models_assignment import ComplaintAssignment

# Check counts
print(f"Total users: {FirebaseUser.objects.count()}")
print(f"Admin profiles: {Admin.objects.count()}")
print(f"Staff profiles: {Staff.objects.count()}")
print(f"Passenger profiles: {Passenger.objects.count()}")
print(f"Assignments: {ComplaintAssignment.objects.count()}")

# Check specific user
user = FirebaseUser.objects.get(email='your-email@example.com')
print(f"Role: {user.get_role()}")
print(f"Profile: {user.get_profile()}")
```

### Step 5: Update Application Code

After successful migration, update your application to use new models:

#### Update `accounts/models.py`
Replace or update imports in existing code:

```python
# Import new models
from .models_new_roles import FirebaseUser, Admin, Staff, Passenger, StaffAvailability, StaffPerformance

# Import assignment model in complaints app
from complaints.models_assignment import ComplaintAssignment
```

#### Update Views
```python
# Old way (deprecated)
user = FirebaseUser.objects.get(email=email)
if user.is_admin:
    # admin logic

# New way
user = FirebaseUser.objects.get(email=email)
role = user.get_role()
if role == 'admin':
    admin_profile = user.admin_profile
    # admin logic with profile data
```

#### Update Serializers
Use the new role-specific serializers:

```python
from accounts.serializers_roles import AdminSerializer, StaffSerializer, PassengerSerializer, UserProfileSerializer

# Get unified profile
serializer = UserProfileSerializer(user)
return Response(serializer.data)
```

---

## Migration Details

### What Gets Migrated

1. **Admin Users** (`accounts_admin`)
   - All users with `is_admin=True` or `is_super_admin=True`
   - Creates profile with permissions and department info
   - Super admin flag preserved

2. **Staff Members** (`accounts_staff`)
   - All records from `complaints_staff` table
   - Creates FirebaseUser if doesn't exist (email-based)
   - Maps old ID to employee_id (e.g., EMP0001)
   - Preserves: expertise, languages, rating, active_tickets
   - Default shift_timings: empty object

3. **Passengers** (`accounts_passenger`)
   - All users with `is_passenger=True`
   - Creates profile with basic user info
   - Initializes complaint counters to 0

4. **Complaint Assignments** (`complaints_assignment`)
   - Links complaints to staff based on 'staff' field
   - Uses name/department matching to find staff
   - Creates assignment records with 'in_progress' status
   - Updates complaint table with assigned_staff_id

### New Table Structure

```
accounts_firebaseuser (existing - unchanged)
├── accounts_admin (one-to-one)
├── accounts_staff (one-to-one)
└── accounts_passenger (one-to-one)

accounts_staff
├── accounts_staff_availability (one-to-many)
└── accounts_staff_performance (one-to-many)

complaints_complaint
├── passenger_id -> accounts_passenger
├── assigned_staff_id -> accounts_staff
└── assigned_by_id -> accounts_admin

complaints_assignment (new)
├── complaint_id -> complaints_complaint
├── staff_id -> accounts_staff
└── assigned_by_id -> accounts_admin
```

---

## Rollback Plan

If something goes wrong:

### Immediate Rollback (Within Session)
```bash
# If migration fails mid-way, Django will rollback automatically
# due to transaction.atomic() in migration code
```

### Manual Rollback from Backup

**For MySQL:**
```bash
# Drop and recreate database
mysql -h [host] -P [port] -u [user] -p
DROP DATABASE railmadad;
CREATE DATABASE railmadad;
exit

# Restore from backup
mysql -h [host] -P [port] -u [user] -p railmadad < backup_20251227_090000.sql
```

**For SQLite:**
```bash
# Simply restore backup file
cp db.sqlite3.backup_20251227_090000 db.sqlite3
```

### Reverse Migrations
```bash
# Revert to before role tables
python manage.py migrate accounts 0006_firebaseuser_is_passenger
python manage.py migrate complaints 0001_initial
```

---

## Common Issues & Solutions

### Issue 1: Migration Import Errors
```
Error: cannot import name 'Q' from 'django.db'
```
**Solution:** Add missing import in migration file:
```python
from django.db.models import Q
```

### Issue 2: Staff Email Not Found
```
FirebaseUser matching query does not exist
```
**Solution:** Check `complaints_staff` table for valid emails. Update migration to create users for missing emails.

### Issue 3: JSON Field Errors
```
Error: string indices must be integers
```
**Solution:** Migration handles JSON parsing automatically. If manual fixes needed:
```python
import json
expertise = json.loads(staff.expertise) if isinstance(staff.expertise, str) else staff.expertise
```

### Issue 4: Duplicate Email/UID
```
IntegrityError: UNIQUE constraint failed
```
**Solution:** Clean up duplicates before migration:
```python
# Find duplicates
python manage.py shell
>>> from accounts.models import FirebaseUser
>>> from django.db.models import Count
>>> dupes = FirebaseUser.objects.values('email').annotate(count=Count('id')).filter(count__gt=1)
>>> print(dupes)
```

---

## Post-Migration Checklist

- [ ] All users have role profiles (no orphaned FirebaseUsers)
- [ ] Admin count matches old is_admin=True count
- [ ] Staff count matches complaints_staff count
- [ ] Passenger count matches is_passenger=True count
- [ ] Complaint assignments created where applicable
- [ ] Test login for admin user
- [ ] Test login for staff user
- [ ] Test login for passenger user
- [ ] Test complaint creation by passenger
- [ ] Test complaint assignment to staff
- [ ] Check API endpoints return correct data
- [ ] Frontend loads user profiles correctly
- [ ] No 500 errors in application logs

---

## Performance Considerations

### Before Migration
- Expected migration time: 5-10 minutes for ~50 users
- Database will be locked during migration (maintenance mode recommended)
- Backup size: ~5-20 MB depending on data

### After Migration
- Queries will be faster (indexed relationships)
- Better cache performance with role-specific tables
- Reduced table scan overhead
- Join queries more efficient

---

## Next Steps After Migration

1. **Test thoroughly** in development environment
2. **Update frontend** API calls if needed
3. **Monitor logs** for errors
4. **Run in staging** before production
5. **Schedule production migration** during low-traffic period
6. **Clean up old columns** after 1-2 weeks of stable operation:
   ```sql
   ALTER TABLE accounts_firebaseuser DROP COLUMN is_admin;
   ALTER TABLE accounts_firebaseuser DROP COLUMN is_super_admin;
   ALTER TABLE accounts_firebaseuser DROP COLUMN is_passenger;
   DROP TABLE complaints_staff;  -- After verifying all staff migrated
   ```

---

## Support

If migration fails or you encounter issues:

1. **Check migration log:** `migration_log_YYYYMMDD_HHMMSS.txt`
2. **Review Django logs:** Check for detailed error messages
3. **Use backup:** Restore from backup and retry after fixing
4. **Manual fixes:** Use Django shell to manually correct data

---

## Migration Command Reference

```bash
# Full automated migration
python migrate_complete_data.py --all

# Individual steps
python migrate_complete_data.py --backup
python migrate_complete_data.py --migrate
python migrate_complete_data.py --validate

# Django migration commands
python manage.py showmigrations
python manage.py migrate accounts
python manage.py migrate complaints
python manage.py migrate --fake accounts 0007  # Mark as applied without running
python manage.py migrate accounts 0006  # Rollback to specific migration

# Check database state
python manage.py dbshell  # Open database shell
python manage.py inspectdb  # Generate models from database
```

---

## Final Notes

- **Test in development first** ⚠️
- **Always have a backup** ⚠️
- **Schedule maintenance window** for production
- **Monitor application logs** after migration
- **Keep old columns** for 1-2 weeks as safety net
- **Document any manual fixes** for future reference

Good luck with your migration! 🚀
