# Migration Quick Start Checklist

## Pre-Migration Checklist

- [ ] Read `MIGRATION_GUIDE.md` thoroughly
- [ ] Review `DB_RESTRUCTURE_PLAN.md` for architecture details
- [ ] Ensure you have database access credentials
- [ ] Close all applications accessing the database
- [ ] Inform team about maintenance window (if production)

## Migration Execution

### 1. Backup Database ⚠️
```bash
cd backend
python migrate_complete_data.py --backup
```
- [ ] Backup file created successfully
- [ ] Verified backup file size is reasonable
- [ ] Saved backup file location: `____________________`

### 2. Run Migration
```bash
python migrate_complete_data.py --all
```
- [ ] All migrations completed without errors
- [ ] Migration log saved
- [ ] No critical warnings in output

### 3. Validation Checks

Review migration log for:
- [ ] Admin count matches (old is_admin=True vs new admin table)
- [ ] Staff count matches (complaints_staff vs accounts_staff)
- [ ] Passenger count matches (is_passenger=True vs accounts_passenger)
- [ ] Complaint assignments created
- [ ] No orphaned users reported

## Post-Migration Testing

### 4. Database Verification
```bash
python manage.py shell
```
```python
from accounts.models_new_roles import FirebaseUser, Admin, Staff, Passenger

# Print counts
print(f"Users: {FirebaseUser.objects.count()}")
print(f"Admins: {Admin.objects.count()}")
print(f"Staff: {Staff.objects.count()}")
print(f"Passengers: {Passenger.objects.count()}")

# Test role detection
user = FirebaseUser.objects.first()
print(f"Role: {user.get_role()}")
print(f"Profile: {user.get_profile()}")
```

- [ ] All counts look correct
- [ ] Role detection works
- [ ] Profiles load without errors

### 5. API Testing

Start Django server:
```bash
python manage.py runserver
```

Test endpoints:
```bash
# Get auth token first
TOKEN="your-firebase-token"

# Test profile endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/profile/

# Test staff list
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/staff/

# Test dashboard stats (admin only)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/dashboard/stats/
```

- [ ] Profile endpoint returns data
- [ ] Staff list endpoint works
- [ ] Dashboard stats endpoint works (if admin)
- [ ] No 500 errors in console

### 6. Frontend Testing

Start frontend:
```bash
cd frontend
npm run dev
```

Test flows:
- [ ] Login as passenger → Profile loads correctly
- [ ] Login as staff → Dashboard shows staff interface
- [ ] Login as admin → Admin dashboard shows statistics
- [ ] Create complaint as passenger → Works
- [ ] View complaints as staff → Works
- [ ] Assign complaint as admin → Works

### 7. Integration Testing

- [ ] Passenger can create complaint
- [ ] Admin can assign complaint to staff
- [ ] Staff can view assigned complaints
- [ ] Status updates reflect in all interfaces
- [ ] No authentication errors
- [ ] No role permission errors

## Application Updates Required

### 8. Update Django Settings

File: `accounts/models.py`
- [ ] Import new models from `models_new_roles`
- [ ] Set as default exports

File: `accounts/views.py`
- [ ] Import views from `views_roles`
- [ ] Update existing views to use new models

File: `accounts/urls.py`
- [ ] Include URL patterns from `urls_roles`
- [ ] Test all routes work

File: `complaints/models.py`
- [ ] Add ComplaintAssignment model from `models_assignment`

### 9. Update Frontend

File: `frontend/src/utils/api.ts`
- [ ] Update profile endpoint to `/api/profile/`
- [ ] Add new staff/admin/passenger endpoints
- [ ] Update type definitions for new response structure

File: `frontend/src/types/user.ts` (if exists)
- [ ] Update User interface with role field
- [ ] Add role-specific profile types

Components to update:
- [ ] Profile page - handle new structure
- [ ] Dashboard - use new profile endpoint
- [ ] Staff management - use new staff endpoints
- [ ] Complaint assignment - use available staff endpoint

## Monitoring & Validation

### 10. Monitor for Issues

First 24 hours:
- [ ] Check Django logs for errors
- [ ] Monitor database query performance
- [ ] Track API response times
- [ ] Watch for user-reported issues

First week:
- [ ] Verify data integrity daily
- [ ] Compare complaint assignment accuracy
- [ ] Check staff availability accuracy
- [ ] Monitor performance metrics

### 11. Performance Validation

- [ ] Profile loading faster than before
- [ ] Staff list queries faster
- [ ] Dashboard stats loading quickly
- [ ] No slow query warnings in logs

## Cleanup (After 1-2 Weeks)

### 12. Remove Old Schema (Optional)

⚠️ **Only after thorough testing and 1-2 weeks of stable operation!**

```sql
-- Remove old boolean flags
ALTER TABLE accounts_firebaseuser DROP COLUMN is_admin;
ALTER TABLE accounts_firebaseuser DROP COLUMN is_super_admin;
ALTER TABLE accounts_firebaseuser DROP COLUMN is_passenger;

-- Drop old staff table
DROP TABLE complaints_staff;

-- Remove old staff text field
ALTER TABLE complaints_complaint DROP COLUMN staff;
```

- [ ] Discussed with team
- [ ] Created final backup before cleanup
- [ ] Executed cleanup SQL
- [ ] Verified application still works
- [ ] Updated documentation

## Rollback Procedure (If Needed)

If something goes wrong:

### Immediate Rollback
```bash
# Stop all servers
# Restore from backup

# For MySQL:
mysql -h [host] -P [port] -u [user] -p [database] < backup_file.sql

# For SQLite:
cp db.sqlite3.backup_YYYYMMDD_HHMMSS db.sqlite3

# Restart servers
```

- [ ] Backup restored successfully
- [ ] Database accessible
- [ ] Old application working
- [ ] Documented what went wrong

## Success Criteria

Migration is successful when:
- [x] All data migrated (counts match)
- [x] No orphaned records
- [x] All roles have profiles
- [x] Complaint assignments working
- [ ] All API endpoints functional
- [ ] Frontend loads without errors
- [ ] Users can login and use system
- [ ] No data loss reported
- [ ] Performance improved or same
- [ ] No security issues

## Documentation

- [ ] Updated README with new architecture
- [ ] Documented any manual fixes made
- [ ] Saved migration logs
- [ ] Updated API documentation
- [ ] Informed team of changes

## Sign-Off

Migration completed by: `____________________`

Date: `____________________`

Issues encountered: `____________________`

Resolution time: `____________________`

Final notes:
```
____________________
____________________
____________________
```

---

## Quick Commands Reference

```bash
# Backup only
python migrate_complete_data.py --backup

# Migrate only (requires backup first)
python migrate_complete_data.py --migrate

# Validate only
python migrate_complete_data.py --validate

# All in one (recommended)
python migrate_complete_data.py --all

# Check migration status
python manage.py showmigrations

# Rollback to specific migration
python manage.py migrate accounts 0006

# Open Django shell
python manage.py shell

# Open database shell
python manage.py dbshell

# Run development server
python manage.py runserver

# View migration log
cat migration_log_*.txt
```

---

**Ready to migrate? Start with Step 1!** ⬆️
