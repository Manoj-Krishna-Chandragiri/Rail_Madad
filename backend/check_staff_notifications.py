import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Notification, Staff

print('Staff in complaints.Staff:')
for s in Staff.objects.all()[:5]:
    print(f'  {s.name} - {s.email}')

print('\nStaff notifications by email:')
staff_emails = Staff.objects.values_list('email', flat=True)
for email in staff_emails[:5]:
    count = Notification.objects.filter(user_email=email).count()
    print(f'  {email}: {count} notifications')

print('\nAll staff notification emails:')
staff_notifs = Notification.objects.filter(type='complaint_assigned')
for n in staff_notifs:
    print(f'  {n.user_email}: {n.title}')
