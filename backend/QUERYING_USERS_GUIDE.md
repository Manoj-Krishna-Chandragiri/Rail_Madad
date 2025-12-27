# Querying Users by Role - Quick Reference

## Overview
After the migration, you can now easily find users by their roles using direct queries on the role tables. Each role table (Admin, Staff, Passenger) includes the `email` field, so you don't need to join with `accounts_firebaseuser` for basic lookups.

---

## Quick Queries

### 1. Find if an email exists as Admin
```sql
SELECT * FROM accounts_admin WHERE email = 'akram.dcme@gmail.com';
```

**Python (Django ORM):**
```python
from accounts.models_new_roles import Admin
admin = Admin.objects.filter(email='akram.dcme@gmail.com').first()
if admin:
    print(f"User is an admin: {admin.full_name}")
```

---

### 2. Find if an email exists as Staff
```sql
SELECT * FROM accounts_staff WHERE email = 'manojkrishnachandragiri@gmail.com';
```

**Python (Django ORM):**
```python
from accounts.models_new_roles import Staff
staff = Staff.objects.filter(email='manojkrishnachandragiri@gmail.com').first()
if staff:
    print(f"User is staff: {staff.full_name} - {staff.department}")
```

---

### 3. Find if an email exists as Passenger
```sql
SELECT * FROM accounts_passenger WHERE email = 'chandragirimanoj999@gmail.com';
```

**Python (Django ORM):**
```python
from accounts.models_new_roles import Passenger
passenger = Passenger.objects.filter(email='chandragirimanoj999@gmail.com').first()
if passenger:
    print(f"User is a passenger: {passenger.full_name}")
```

---

### 4. Check ALL roles for a user
```python
from accounts.models_new_roles import Admin, Staff, Passenger

email = 'akram.dcme@gmail.com'
roles = []

if Admin.objects.filter(email=email).exists():
    roles.append('Admin')
if Staff.objects.filter(email=email).exists():
    roles.append('Staff')
if Passenger.objects.filter(email=email).exists():
    roles.append('Passenger')

print(f"{email} has roles: {', '.join(roles)}")
```

---

### 5. Get All Admins
```sql
SELECT email, full_name, department FROM accounts_admin;
```

**Python:**
```python
from accounts.models_new_roles import Admin
admins = Admin.objects.all()
for admin in admins:
    print(f"{admin.email} - {admin.full_name}")
```

---

### 6. Get All Available Staff
```sql
SELECT email, full_name, department, status 
FROM accounts_staff 
WHERE status = 'active';
```

**Python:**
```python
from accounts.models_new_roles import Staff
active_staff = Staff.objects.filter(status='active')
for staff in active_staff:
    print(f"{staff.email} - {staff.full_name} ({staff.department})")
```

---

### 7. Get Staff by Department
```sql
SELECT email, full_name, role 
FROM accounts_staff 
WHERE department = 'Technical Support';
```

**Python:**
```python
from accounts.models_new_roles import Staff
tech_staff = Staff.objects.filter(department='Technical Support')
```

---

### 8. Get Passengers with Most Complaints
```sql
SELECT email, full_name, total_complaints 
FROM accounts_passenger 
ORDER BY total_complaints DESC 
LIMIT 10;
```

**Python:**
```python
from accounts.models_new_roles import Passenger
top_complainants = Passenger.objects.order_by('-total_complaints')[:10]
```

---

## Join with FirebaseUser (when needed)

If you need additional fields from FirebaseUser (like firebase_uid, is_superuser, etc.), you can still join:

```sql
SELECT 
    a.email,
    a.full_name,
    a.department,
    u.firebase_uid,
    u.date_joined
FROM accounts_admin a
JOIN accounts_firebaseuser u ON a.user_id = u.id;
```

**Python:**
```python
from accounts.models_new_roles import Admin
admin = Admin.objects.select_related('user').get(email='akram.dcme@gmail.com')
print(f"Firebase UID: {admin.user.firebase_uid}")
print(f"Date Joined: {admin.user.date_joined}")
```

---

## API Endpoint Examples

### Check User Role
```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from accounts.models_new_roles import Admin, Staff, Passenger

@api_view(['GET'])
def check_user_role(request, email):
    """Check what roles a user has"""
    roles = {
        'email': email,
        'is_admin': Admin.objects.filter(email=email).exists(),
        'is_staff': Staff.objects.filter(email=email).exists(),
        'is_passenger': Passenger.objects.filter(email=email).exists(),
    }
    return Response(roles)
```

### Get User Profile by Email
```python
@api_view(['GET'])
def get_user_profile(request, email):
    """Get complete user profile with all roles"""
    profile = {'email': email, 'roles': []}
    
    admin = Admin.objects.filter(email=email).first()
    if admin:
        profile['roles'].append({
            'type': 'admin',
            'name': admin.full_name,
            'department': admin.department,
            'super_admin': admin.super_admin
        })
    
    staff = Staff.objects.filter(email=email).first()
    if staff:
        profile['roles'].append({
            'type': 'staff',
            'name': staff.full_name,
            'department': staff.department,
            'role': staff.role,
            'status': staff.status
        })
    
    passenger = Passenger.objects.filter(email=email).first()
    if passenger:
        profile['roles'].append({
            'type': 'passenger',
            'name': passenger.full_name,
            'total_complaints': passenger.total_complaints
        })
    
    return Response(profile)
```

---

## Performance Notes

1. **Direct Queries**: With email in role tables, you can query directly without joins for most cases
2. **Indexes**: The email field should have an index for faster lookups (add in future migration if needed)
3. **Caching**: Consider caching role checks for frequently accessed users
4. **Denormalization Trade-off**: Email is duplicated across tables, but this is intentional for performance

---

## Database Schema Reference

**accounts_firebaseuser** (Main user table)
- id (PK)
- email (unique)
- firebase_uid
- full_name, phone_number, gender, address
- is_admin, is_super_admin, is_passenger flags

**accounts_admin** (Admin profiles)
- user_id (PK, FK to firebaseuser)
- email (denormalized)
- full_name, phone_number
- department, designation, employee_id
- super_admin, permissions

**accounts_staff** (Staff profiles)
- user_id (PK, FK to firebaseuser)
- email (denormalized)
- full_name, phone_number
- department, role, location, status
- expertise, languages, rating

**accounts_passenger** (Passenger profiles)
- user_id (PK, FK to firebaseuser)
- email (denormalized)
- full_name, phone_number, gender
- address, city, state
- total_complaints, resolved_complaints

---

## Migration History

1. **0009** - Created role tables (Admin, Staff, Passenger)
2. **0010** - Migrated user data to role tables (manual script)
3. **0011** - Added email field to all role tables
4. **0012** - Populated email fields from FirebaseUser

---

**Last Updated:** December 27, 2025
