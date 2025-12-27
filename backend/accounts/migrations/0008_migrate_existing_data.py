# Data migration to move existing users to role-specific tables

from django.db import migrations


def migrate_passenger_data(apps, schema_editor):
    """Migrate passenger users to accounts_passenger table"""
    FirebaseUser = apps.get_model('accounts', 'FirebaseUser')
    Passenger = apps.get_model('accounts', 'Passenger')
    
    passenger_users = FirebaseUser.objects.filter(user_type='passenger')
    
    for user in passenger_users:
        Passenger.objects.get_or_create(
            user=user,
            defaults={
                'full_name': user.full_name or '',
                'phone_number': user.phone_number or '',
                'gender': user.gender or '',
                'address': user.address or '',
                'preferred_language': 'en',
                'notification_preferences': {
                    'email': True,
                    'sms': False,
                    'push': True
                }
            }
        )


def migrate_admin_data(apps, schema_editor):
    """Migrate admin users to accounts_admin table"""
    FirebaseUser = apps.get_model('accounts', 'FirebaseUser')
    Admin = apps.get_model('accounts', 'Admin')
    
    admin_users = FirebaseUser.objects.filter(user_type='admin')
    
    for user in admin_users:
        # Determine admin level
        if hasattr(user, 'is_super_admin') and user.is_super_admin:
            admin_level = 'super_admin'
        else:
            admin_level = 'admin'
        
        Admin.objects.get_or_create(
            user=user,
            defaults={
                'full_name': user.full_name or user.email.split('@')[0],
                'phone_number': user.phone_number or '',
                'admin_level': admin_level,
                'can_manage_staff': True,
                'can_manage_complaints': True,
                'can_view_analytics': True,
                'can_manage_users': admin_level == 'super_admin',
            }
        )


def migrate_staff_data_from_complaints(apps, schema_editor):
    """
    Migrate staff from complaints_staff table to accounts_staff
    Create FirebaseUser entries if they don't exist
    """
    FirebaseUser = apps.get_model('accounts', 'FirebaseUser')
    Staff = apps.get_model('accounts', 'Staff')
    ComplaintsStaff = apps.get_model('complaints', 'Staff')
    
    import uuid
    from datetime import date
    
    for old_staff in ComplaintsStaff.objects.all():
        # Try to find existing user by email
        user = FirebaseUser.objects.filter(email=old_staff.email).first()
        
        if not user:
            # Create new FirebaseUser for this staff member
            user = FirebaseUser.objects.create(
                email=old_staff.email,
                firebase_uid=f"staff_{uuid.uuid4().hex[:20]}",
                user_type='staff',
                is_active=old_staff.status == 'active'
            )
        else:
            # Update existing user to staff type
            user.user_type = 'staff'
            user.save()
        
        # Create or update Staff profile
        Staff.objects.update_or_create(
            user=user,
            defaults={
                'employee_id': f"EMP{old_staff.id:04d}",
                'full_name': old_staff.name,
                'phone_number': old_staff.phone,
                'department': old_staff.department,
                'designation': old_staff.role,
                'location': old_staff.location or '',
                'avatar': old_staff.avatar or '',
                'expertise': old_staff.expertise if old_staff.expertise else [],
                'languages': old_staff.languages if old_staff.languages else [],
                'communication_preferences': old_staff.communication_preferences if old_staff.communication_preferences else [],
                'certifications': [],
                'status': old_staff.status,
                'joining_date': old_staff.joining_date or date.today(),
                'work_schedule': {},
                'assigned_zones': [],
                'rating': old_staff.rating,
                'active_tickets': old_staff.active_tickets,
                'resolved_tickets': 0,
                'average_resolution_time': None,
            }
        )


def reverse_migration(apps, schema_editor):
    """Reverse migration - not implemented for safety"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_restructure_user_roles'),
        ('complaints', '0001_initial'),  # Adjust to actual migration
    ]

    operations = [
        migrations.RunPython(
            code=migrate_passenger_data,
            reverse_code=reverse_migration
        ),
        migrations.RunPython(
            code=migrate_admin_data,
            reverse_code=reverse_migration
        ),
        migrations.RunPython(
            code=migrate_staff_data_from_complaints,
            reverse_code=reverse_migration
        ),
    ]
