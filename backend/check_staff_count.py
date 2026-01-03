import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Staff

print(f'Total staff: {Staff.objects.count()}')

if Staff.objects.count() == 0:
    print("\n❌ No staff found! Creating sample staff...")
    print("Run: python manage.py create_sample_staff")
else:
    print('\n--- Active Staff by Department ---')
    staff_list = Staff.objects.filter(status='active').order_by('department', 'active_tickets')
    
    for s in staff_list:
        print(f'{s.name:20} | {s.department:20} | {s.role:25} | Active: {s.active_tickets}')
    
    print('\n--- Department Summary ---')
    departments = ['Housekeeping', 'Catering', 'Technical Support', 'Customer Service', 'Security', 'Operations']
    for dept in departments:
        count = Staff.objects.filter(department=dept, status='active').count()
        print(f'{dept:20}: {count} active staff')
