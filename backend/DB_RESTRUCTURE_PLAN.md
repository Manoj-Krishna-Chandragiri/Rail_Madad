# Database Schema Restructuring Plan

## Current Issues
1. Single `accounts_firebaseuser` table with multiple role flags (is_admin, is_staff, is_passenger, is_super_admin)
2. Separate `complaints_staff` table not connected to authentication
3. No clear role-based authorization structure

## New Structure

### 1. Base User Table (accounts_firebaseuser)
**Keep core authentication fields:**
- id (PK)
- email (unique)
- firebase_uid (unique)
- password (for Django admin)
- user_type (enum: 'passenger', 'staff', 'admin')
- is_active
- date_joined
- last_login

**Remove:** is_staff, is_admin, is_super_admin, is_passenger flags

---

### 2. Passenger Table (accounts_passenger)
```sql
CREATE TABLE accounts_passenger (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    gender VARCHAR(10),
    address VARCHAR(500),
    date_of_birth DATE,
    aadhar_number VARCHAR(12),
    preferred_language VARCHAR(50) DEFAULT 'en',
    notification_preferences JSON,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES accounts_firebaseuser(id) ON DELETE CASCADE
);
```

**Purpose:** Store passenger-specific information

---

### 3. Staff Table (accounts_staff)
```sql
CREATE TABLE accounts_staff (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    avatar VARCHAR(255),
    expertise JSON,  -- ["Cleanliness", "Catering", etc.]
    languages JSON,  -- ["Hindi", "English", "Telugu"]
    communication_preferences JSON,  -- ["Chat", "Voice", "Video"]
    status VARCHAR(20) DEFAULT 'active',  -- active, inactive, on_leave
    joining_date DATE NOT NULL,
    rating DOUBLE DEFAULT 0.0,
    active_tickets INT DEFAULT 0,
    resolved_tickets INT DEFAULT 0,
    average_resolution_time INT,  -- in minutes
    work_schedule JSON,  -- {"monday": "9-5", "tuesday": "9-5", ...}
    assigned_zones JSON,  -- ["Zone A", "Zone B"]
    certifications JSON,  -- ["First Aid", "Fire Safety"]
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES accounts_firebaseuser(id) ON DELETE CASCADE
);
```

**Purpose:** Replace/merge with complaints_staff, link to authentication

---

### 4. Admin Table (accounts_admin)
```sql
CREATE TABLE accounts_admin (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    admin_level VARCHAR(20) NOT NULL,  -- super_admin, admin, moderator
    department VARCHAR(100),
    permissions JSON,  -- Custom permissions beyond role
    can_manage_staff BOOLEAN DEFAULT TRUE,
    can_manage_complaints BOOLEAN DEFAULT TRUE,
    can_view_analytics BOOLEAN DEFAULT TRUE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    created_by_id BIGINT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    last_action_at DATETIME(6),
    FOREIGN KEY (user_id) REFERENCES accounts_firebaseuser(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES accounts_admin(id) ON DELETE SET NULL
);
```

**Purpose:** Store admin-specific permissions and hierarchy

---

### 5. Staff Shifts Table (accounts_staff_shift)
```sql
CREATE TABLE accounts_staff_shift (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_id BIGINT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type VARCHAR(20),  -- morning, evening, night
    status VARCHAR(20) DEFAULT 'scheduled',  -- scheduled, completed, missed
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES accounts_staff(id) ON DELETE CASCADE,
    INDEX idx_staff_date (staff_id, shift_date)
);
```

---

### 6. Staff Performance Table (accounts_staff_performance)
```sql
CREATE TABLE accounts_staff_performance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_id BIGINT NOT NULL,
    month DATE NOT NULL,
    tickets_resolved INT DEFAULT 0,
    average_resolution_time INT,  -- minutes
    customer_satisfaction DOUBLE,  -- 0-5 rating
    response_time INT,  -- minutes
    escalations INT DEFAULT 0,
    commendations INT DEFAULT 0,
    warnings INT DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (staff_id) REFERENCES accounts_staff(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_month (staff_id, month)
);
```

---

### 7. Update Complaints Table
```sql
ALTER TABLE complaints_complaint
ADD COLUMN assigned_staff_id BIGINT,
ADD COLUMN assigned_at DATETIME(6),
ADD COLUMN resolved_by_staff_id BIGINT,
ADD FOREIGN KEY (assigned_staff_id) REFERENCES accounts_staff(id) ON DELETE SET NULL,
ADD FOREIGN KEY (resolved_by_staff_id) REFERENCES accounts_staff(id) ON DELETE SET NULL;
```

**Remove:** `staff` VARCHAR field (replace with FK)

---

## Migration Strategy

### Phase 1: Create New Tables
1. Create accounts_passenger table
2. Create accounts_staff table (new)
3. Create accounts_admin table
4. Create accounts_staff_shift table
5. Create accounts_staff_performance table

### Phase 2: Data Migration
1. Migrate existing passengers: users with is_passenger=True → accounts_passenger
2. Migrate existing staff: complaints_staff → accounts_staff (create firebaseuser if needed)
3. Migrate existing admins: users with is_admin=True → accounts_admin

### Phase 3: Update Foreign Keys
1. Update complaints_complaint to use staff_id FK
2. Update any other tables referencing users

### Phase 4: Cleanup
1. Remove old boolean flags from accounts_firebaseuser
2. Drop complaints_staff table (data moved to accounts_staff)
3. Update all views/serializers

---

## Benefits

1. **Clear Separation**: Each role has its own table with relevant fields
2. **Better Authorization**: Easy to check role and permissions
3. **Scalability**: Can add role-specific fields without affecting other roles
4. **Data Integrity**: Foreign key constraints ensure data consistency
5. **Performance**: Smaller, focused tables with better indexes
6. **Staff Management**: Complete staff lifecycle tracking
7. **Firebase Integration**: Base user table for auth, role tables for authorization

---

## Django Models Structure

```python
# Base User Model
class FirebaseUser(AbstractBaseUser):
    email = models.EmailField(unique=True)
    firebase_uid = models.CharField(max_length=128, unique=True)
    user_type = models.CharField(max_length=10, choices=[...])
    # ... common fields

# Role-specific models
class Passenger(models.Model):
    user = models.OneToOneField(FirebaseUser, on_delete=models.CASCADE, related_name='passenger_profile')
    # ... passenger fields

class Staff(models.Model):
    user = models.OneToOneField(FirebaseUser, on_delete=models.CASCADE, related_name='staff_profile')
    # ... staff fields

class Admin(models.Model):
    user = models.OneToOneField(FirebaseUser, on_delete=models.CASCADE, related_name='admin_profile')
    # ... admin fields
```
