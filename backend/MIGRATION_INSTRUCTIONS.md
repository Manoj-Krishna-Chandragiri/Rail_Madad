# Database Restructuring: Migration Instructions

## Overview
This guide provides step-by-step instructions to migrate from single-table authentication (with boolean role flags) to proper role-based tables with separate Passenger, Staff, and Admin profiles.

## ⚠️ IMPORTANT: Pre-Migration Steps

### 1. Backup Your Database
```bash
# For SQLite (development)
cp backend/db.sqlite3 backend/db.sqlite3.backup

# For MySQL (production)
mysqldump -h <host> -u <user> -p <database> > rail_madad_backup.sql
```

### 2. Review Current Data
```bash
cd backend
python manage.py shell
```

```python
from accounts.models import FirebaseUser
from complaints.models import Staff

# Check existing users
print(f"Total users: {FirebaseUser.objects.count()}")
print(f"Admins: {FirebaseUser.objects.filter(is_admin=True).count()}")
print(f"Staff in complaints: {Staff.objects.count()}")
```

## Migration Steps

### Phase 1: Replace Models File

1. **Rename old models (for backup reference)**
```bash
cd backend/accounts
mv models.py models_old.py
mv models_new.py models.py
```

2. **Update imports in existing code**
The new models use the same class names, so most imports should work. But check:
- `accounts/admin.py` - update admin registrations
- `accounts/serializers.py` - rename to `serializers_old.py`
- `accounts/views.py` - rename to `views_old.py`
- `accounts/middleware.py` - rename to `middleware_old.py`

3. **Activate new files**
```bash
mv serializers_new.py serializers.py
mv views_new.py views.py
mv middleware_new.py middleware.py
mv urls_new.py urls.py
```

### Phase 2: Update URLs and Settings

1. **Update main urls.py**
```python
# backend/Rail_Madad/urls.py
urlpatterns = [
    # ... existing patterns
    path('api/', include('accounts.urls')),  # Make sure this points to new urls.py
]
```

2. **Update settings.py middleware**
```python
# backend/Rail_Madad/settings.py
MIDDLEWARE = [
    # ... existing middleware
    'accounts.middleware.FirebaseAuthenticationMiddleware',
    'accounts.middleware.RoleBasedPermissionMiddleware',
    'accounts.middleware.UserProfileMiddleware',
]
```

### Phase 3: Run Migrations

1. **Create migration files**
```bash
cd backend
python manage.py makemigrations accounts
```

Expected output:
```
Migrations for 'accounts':
  accounts/migrations/0007_restructure_user_roles.py
    - Add field user_type to firebaseuser
    - Create model Admin
    - Create model Passenger
    - Create model Staff
    - Create model StaffPerformance
    - Create model StaffShift
```

2. **Check migration plan (dry run)**
```bash
python manage.py migrate accounts --plan
```

3. **Apply schema migrations**
```bash
python manage.py migrate accounts 0007_restructure_user_roles
```

4. **Apply data migration**
```bash
python manage.py migrate accounts 0008_migrate_existing_data
```

This will:
- Create Passenger profiles for all passenger users
- Create Admin profiles for all admin users
- Migrate data from `complaints_staff` to `accounts_staff`
- Create `FirebaseUser` entries for staff who don't have them

### Phase 4: Verify Migration

1. **Check database structure**
```bash
python manage.py shell
```

```python
from accounts.models import FirebaseUser, Passenger, Staff, Admin

# Check counts
print(f"FirebaseUser: {FirebaseUser.objects.count()}")
print(f"Passengers: {Passenger.objects.count()}")
print(f"Staff: {Staff.objects.count()}")
print(f"Admins: {Admin.objects.count()}")

# Check sample data
passenger = Passenger.objects.first()
print(f"Sample passenger: {passenger.full_name} - {passenger.user.email}")

staff = Staff.objects.first()
print(f"Sample staff: {staff.full_name} - {staff.employee_id}")

admin = Admin.objects.first()
print(f"Sample admin: {admin.full_name} - {admin.admin_level}")
```

2. **Test authentication endpoints**
```bash
# Get a valid Firebase token first, then:
curl -X POST http://localhost:8000/api/auth/get-or-create/ \
  -H "Content-Type: application/json" \
  -d '{"idToken": "YOUR_FIREBASE_TOKEN"}'

# Check profile
curl http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Phase 5: Update Complaints Model (Optional but Recommended)

If you want to link complaints to the new Staff model:

1. **Create migration for complaints**
```python
# backend/complaints/migrations/0XXX_link_to_accounts_staff.py
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('complaints', '0XXX_previous_migration'),
        ('accounts', '0008_migrate_existing_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='complaint',
            name='assigned_staff',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='accounts.staff',
                related_name='assigned_complaints'
            ),
        ),
        migrations.AddField(
            model_name='complaint',
            name='resolved_by',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='accounts.staff',
                related_name='resolved_complaints'
            ),
        ),
    ]
```

2. **Migrate complaint assignments**
Create a data migration to link existing complaints to new staff:

```python
def link_complaints_to_staff(apps, schema_editor):
    Complaint = apps.get_model('complaints', 'Complaint')
    Staff = apps.get_model('accounts', 'Staff')
    OldStaff = apps.get_model('complaints', 'Staff')
    
    for complaint in Complaint.objects.filter(assigned_staff_id__isnull=False):
        try:
            old_staff = OldStaff.objects.get(id=complaint.assigned_staff_id)
            new_staff = Staff.objects.get(user__email=old_staff.email)
            complaint.assigned_staff = new_staff
            complaint.save()
        except (OldStaff.DoesNotExist, Staff.DoesNotExist):
            pass
```

### Phase 6: Frontend Updates

Update frontend API calls to work with new endpoints:

1. **Update api.ts types**
```typescript
export interface UserProfile {
  user_type: 'passenger' | 'staff' | 'admin';
  user_data: PassengerProfile | StaffProfile | AdminProfile;
}

export interface PassengerProfile {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  gender?: string;
  address?: string;
  // ... other fields
}

export interface StaffProfile {
  id: number;
  email: string;
  employee_id: string;
  full_name: string;
  department: string;
  designation: string;
  // ... other fields
}

export interface AdminProfile {
  id: number;
  email: string;
  full_name: string;
  admin_level: 'super_admin' | 'admin' | 'moderator';
  // ... other fields
}
```

2. **Update authentication flow**
```typescript
// No changes needed - backend handles profile creation
const response = await api.post('/api/auth/get-or-create/', {
  idToken: firebaseToken
});

const { user } = response.data;
// user.user_type tells you the role
// user.user_data contains role-specific data
```

## Rollback Plan

If something goes wrong:

### Quick Rollback (keep new structure, restore data)
```bash
# Restore from backup
cp backend/db.sqlite3.backup backend/db.sqlite3

# Or for MySQL
mysql -h <host> -u <user> -p <database> < rail_madad_backup.sql
```

### Full Rollback (revert to old models)
```bash
cd backend/accounts

# Restore old files
mv models.py models_new.py
mv models_old.py models.py
mv serializers.py serializers_new.py
mv serializers_old.py serializers.py
mv views.py views_new.py
mv views_old.py views.py
mv middleware.py middleware_new.py
mv middleware_old.py middleware.py

# Revert migrations
python manage.py migrate accounts 0006  # Replace with last good migration
```

## Testing Checklist

After migration, test:

- [ ] User login (all three roles)
- [ ] Profile retrieval for each role
- [ ] Profile updates
- [ ] Admin creating staff members
- [ ] Super admin creating admins
- [ ] Staff listing (for admins)
- [ ] Complaint assignment to staff
- [ ] Role-based access control
- [ ] Firebase authentication still works
- [ ] Existing users can still access their data

## Common Issues and Solutions

### Issue: "No module named 'accounts.models_new'"
**Solution:** Make sure you renamed `models_new.py` to `models.py`

### Issue: Migration fails with "duplicate key" error
**Solution:** Check for existing data conflicts. May need to clean up duplicate emails/firebase_uids

### Issue: Users can't log in after migration
**Solution:** Check that `FirebaseAuthenticationMiddleware` is in settings.py and that profiles were created

### Issue: Staff data is missing
**Solution:** Check that complaints.Staff table had valid data before migration. Re-run data migration.

### Issue: "Admin profile not found" error
**Solution:** Ensure admin users have `is_admin=True` in old schema before migration

## Post-Migration Optimization

After confirming everything works:

1. **Remove old model fields** (optional, in a future migration)
```python
# Remove these from FirebaseUser:
# - is_admin
# - is_staff  
# - is_passenger
# - is_super_admin
```

2. **Update indexes** for better performance
```bash
python manage.py sqlmigrate accounts 0007 | grep INDEX
```

3. **Archive old complaints.Staff table** (after linking complaints)
```python
# Rename table instead of deleting
ALTER TABLE complaints_staff RENAME TO complaints_staff_archived;
```

## Support

If you encounter issues:
1. Check Django logs: `tail -f backend/logs/django.log`
2. Check database for orphaned records
3. Verify Firebase configuration is correct
4. Test with a new user account first

## Conclusion

This migration provides:
- ✅ Clear separation of concerns
- ✅ Proper role-based authorization
- ✅ Scalable user management
- ✅ Better data integrity
- ✅ Easier to add role-specific features
- ✅ Support for granular permissions

The system will be more maintainable and ready for future enhancements!
