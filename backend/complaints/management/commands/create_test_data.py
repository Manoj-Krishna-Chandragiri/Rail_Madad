from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from complaints.models import Complaint, Staff
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create test data for dashboard'

    def handle(self, *args, **options):
        # Create test staff
        staff_data = [
            {'name': 'John Doe', 'email': 'john@railway.com', 'phone': '1234567890', 'role': 'Support Agent', 'department': 'Customer Service'},
            {'name': 'Jane Smith', 'email': 'jane@railway.com', 'phone': '1234567891', 'role': 'Senior Agent', 'department': 'Technical Support'},
            {'name': 'Mike Johnson', 'email': 'mike@railway.com', 'phone': '1234567892', 'role': 'Supervisor', 'department': 'Operations'},
        ]
        
        for data in staff_data:
            staff, created = Staff.objects.get_or_create(
                email=data['email'],
                defaults=data
            )
            if created:
                self.stdout.write(f'Created staff: {staff.name}')

        # Create test complaints
        complaint_types = [
            'Coach - Cleanliness', 'Electrical Equipment', 'Catering Services',
            'Staff Behaviour', 'Punctuality', 'Security', 'Ticketing Issues'
        ]
        
        statuses = ['open', 'in_progress', 'closed']
        severities = ['low', 'medium', 'high']
        
        # Create complaints for the last 30 days
        for i in range(100):
            date = timezone.now() - timedelta(days=random.randint(0, 30))
            complaint = Complaint.objects.create(
                type=random.choice(complaint_types),
                description=f'Test complaint {i+1} - Lorem ipsum dolor sit amet.',
                location=f'Station {random.randint(1, 10)}',
                train_number=f'{random.randint(12000, 19999)}',
                pnr_number=f'{random.randint(1000000000, 9999999999)}',
                severity=random.choice(severities),
                status=random.choice(statuses),
                date_of_incident=date.date(),
                created_at=date
            )
            
            # If closed, set resolution details
            if complaint.status == 'closed':
                complaint.resolved_at = date + timedelta(hours=random.randint(1, 48))
                complaint.resolved_by = 'admin'
                complaint.save()
        
        self.stdout.write(self.style.SUCCESS('Successfully created test data'))
