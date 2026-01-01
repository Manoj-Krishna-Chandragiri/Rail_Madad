import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Notification, Staff, Complaint
from accounts.models import Staff as AccountsStaff
from django.utils import timezone
from datetime import timedelta

print('Creating notifications for all staff members...\n')

# Get all staff from complaints.Staff
all_staff = Staff.objects.all()

notifications_created = 0

for staff_member in all_staff:
    print(f'Processing staff: {staff_member.name} ({staff_member.email})')
    
    # Check if they already have notifications
    existing_count = Notification.objects.filter(user_email=staff_member.email).count()
    if existing_count > 0:
        print(f'  ✓ Already has {existing_count} notifications')
        continue
    
    # Create some sample notifications for this staff member
    sample_notifications = [
        {
            'type': 'complaint_assigned',
            'title': 'Welcome to Notification System',
            'message': f'Hi {staff_member.name}, you can now receive real-time notifications about your assigned complaints.',
            'created_at': timezone.now() - timedelta(hours=1)
        },
        {
            'type': 'system',
            'title': 'Check Your Assigned Complaints',
            'message': 'You have active complaints that need your attention. Visit My Complaints to review them.',
            'created_at': timezone.now() - timedelta(minutes=30)
        }
    ]
    
    for notif_data in sample_notifications:
        Notification.objects.create(
            user_email=staff_member.email,
            type=notif_data['type'],
            title=notif_data['title'],
            message=notif_data['message'],
            created_at=notif_data['created_at'],
            is_read=False
        )
        notifications_created += 1
        print(f'  ✓ Created: {notif_data["title"]}')

# Also check accounts.Staff model
print('\nChecking accounts.Staff model...')
try:
    accounts_staff = AccountsStaff.objects.select_related('user').all()
    for staff in accounts_staff:
        email = staff.email or staff.user.email
        print(f'Processing accounts staff: {staff.full_name} ({email})')
        
        existing_count = Notification.objects.filter(user_email=email).count()
        if existing_count > 0:
            print(f'  ✓ Already has {existing_count} notifications')
            continue
        
        # Create notifications
        Notification.objects.create(
            user_email=email,
            type='complaint_assigned',
            title='Welcome to Rail Madad Staff Portal',
            message=f'Hi {staff.full_name}, you will receive notifications here about your assigned complaints and important updates.',
            created_at=timezone.now() - timedelta(hours=2),
            is_read=False
        )
        
        Notification.objects.create(
            user_email=email,
            type='system',
            title='Notification System Active',
            message='Your notification system is now active. You will be notified when complaints are assigned to you.',
            created_at=timezone.now() - timedelta(minutes=15),
            is_read=False
        )
        
        notifications_created += 2
        print(f'  ✓ Created 2 welcome notifications')
        
except Exception as e:
    print(f'Error with accounts.Staff: {e}')

print(f'\n✓ Total notifications created: {notifications_created}')
print('\nFinal notification counts by email:')
all_emails = Notification.objects.values_list('user_email', flat=True).distinct()
for email in all_emails:
    count = Notification.objects.filter(user_email=email).count()
    print(f'  {email}: {count}')
