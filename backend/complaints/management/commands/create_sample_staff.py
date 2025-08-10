from django.core.management.base import BaseCommand
from complaints.models import Staff
import json

class Command(BaseCommand):
    help = 'Create sample staff members for testing'

    def handle(self, *args, **options):
        sample_staff = [
            {
                'name': 'Rajesh Kumar',
                'email': 'rajesh.kumar@indianrail.com',
                'phone': '+91-9876543210',
                'role': 'Senior Support Engineer',
                'department': 'Technical Support',
                'location': 'New Delhi Railway Station',
                'status': 'active',
                'expertise': json.dumps(['Train Issues', 'Booking Problems', 'Platform Information']),
                'languages': json.dumps(['Hindi', 'English']),
                'communication_preferences': json.dumps(['Chat', 'Phone', 'Email']),
                'rating': 4.5,
                'active_tickets': 5
            },
            {
                'name': 'Priya Sharma',
                'email': 'priya.sharma@indianrail.com',
                'phone': '+91-9876543211',
                'role': 'Customer Service Executive',
                'department': 'Customer Service',
                'location': 'Mumbai Central',
                'status': 'active',
                'expertise': json.dumps(['Refunds', 'Cancellations', 'General Inquiries']),
                'languages': json.dumps(['Hindi', 'English', 'Marathi']),
                'communication_preferences': json.dumps(['Chat', 'Email']),
                'rating': 4.8,
                'active_tickets': 3
            },
            {
                'name': 'Suresh Patel',
                'email': 'suresh.patel@indianrail.com',
                'phone': '+91-9876543212',
                'role': 'Station Manager',
                'department': 'Operations',
                'location': 'Ahmedabad Junction',
                'status': 'active',
                'expertise': json.dumps(['Station Operations', 'Emergency Response', 'Safety']),
                'languages': json.dumps(['Hindi', 'English', 'Gujarati']),
                'communication_preferences': json.dumps(['Phone', 'Email']),
                'rating': 4.2,
                'active_tickets': 8
            },
            {
                'name': 'Meera Reddy',
                'email': 'meera.reddy@indianrail.com',
                'phone': '+91-9876543213',
                'role': 'Technical Specialist',
                'department': 'Technical Support',
                'location': 'Hyderabad Deccan',
                'status': 'active',
                'expertise': json.dumps(['App Issues', 'Payment Problems', 'Technical Troubleshooting']),
                'languages': json.dumps(['Telugu', 'Hindi', 'English']),
                'communication_preferences': json.dumps(['Chat', 'Email']),
                'rating': 4.6,
                'active_tickets': 6
            },
            {
                'name': 'Amit Singh',
                'email': 'amit.singh@indianrail.com',
                'phone': '+91-9876543214',
                'role': 'Travel Advisor',
                'department': 'Customer Service',
                'location': 'Kolkata Howrah',
                'status': 'active',
                'expertise': json.dumps(['Route Planning', 'Schedule Information', 'Travel Assistance']),
                'languages': json.dumps(['Bengali', 'Hindi', 'English']),
                'communication_preferences': json.dumps(['Chat', 'Phone']),
                'rating': 4.3,
                'active_tickets': 4
            }
        ]

        created_count = 0
        for staff_data in sample_staff:
            staff, created = Staff.objects.get_or_create(
                email=staff_data['email'],
                defaults=staff_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created staff member: {staff.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Staff member already exists: {staff.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new staff members')
        )
