"""
Django management command to populate the database with sample staff members
for testing AI complaint assignment functionality
"""

from django.core.management.base import BaseCommand
from complaints.models import Staff
import json

class Command(BaseCommand):
    help = 'Create sample staff members for AI complaint assignment testing'

    def handle(self, *args, **options):
        staff_data = [
            {
                'name': 'Rajesh Kumar',
                'email': 'rajesh.kumar@railway.gov.in',
                'phone': '9876543210',
                'role': 'cleaning_supervisor',
                'department': 'Cleanliness',
                'location': 'Delhi',
                'expertise': json.dumps(['toilet_maintenance', 'general_cleaning', 'hygiene_management']),
                'languages': json.dumps(['Hindi', 'English']),
                'rating': 4.2,
                'active_tickets': 2
            },
            {
                'name': 'Priya Sharma',
                'email': 'priya.sharma@railway.gov.in',
                'phone': '9876543211',
                'role': 'catering_manager',
                'department': 'Catering',
                'location': 'Mumbai',
                'expertise': json.dumps(['food_quality', 'pantry_management', 'vendor_coordination']),
                'languages': json.dumps(['Hindi', 'English', 'Marathi']),
                'rating': 4.5,
                'active_tickets': 1
            },
            {
                'name': 'Amit Singh',
                'email': 'amit.singh@railway.gov.in',
                'phone': '9876543212',
                'role': 'conductor',
                'department': 'Operations',
                'location': 'Bangalore',
                'expertise': json.dumps(['passenger_management', 'disciplinary_action', 'conflict_resolution']),
                'languages': json.dumps(['Hindi', 'English', 'Kannada']),
                'rating': 4.1,
                'active_tickets': 3
            },
            {
                'name': 'Sunita Gupta',
                'email': 'sunita.gupta@railway.gov.in',
                'phone': '9876543213',
                'role': 'booking_officer',
                'department': 'Reservations',
                'location': 'Chennai',
                'expertise': json.dumps(['ticket_booking', 'refund_processing', 'reservation_management']),
                'languages': json.dumps(['Hindi', 'English', 'Tamil']),
                'rating': 4.3,
                'active_tickets': 0
            },
            {
                'name': 'Manoj Electrician',
                'email': 'manoj.electrician@railway.gov.in',
                'phone': '9876543214',
                'role': 'electrician',
                'department': 'Electrical',
                'location': 'Kolkata',
                'expertise': json.dumps(['ac_repair', 'lighting_repair', 'electrical_safety']),
                'languages': json.dumps(['Hindi', 'English', 'Bengali']),
                'rating': 4.4,
                'active_tickets': 1
            },
            {
                'name': 'Ramesh Mechanic',
                'email': 'ramesh.mechanic@railway.gov.in',
                'phone': '9876543215',
                'role': 'mechanical_engineer',
                'department': 'Mechanical',
                'location': 'Pune',
                'expertise': json.dumps(['seat_repair', 'door_maintenance', 'mechanical_systems']),
                'languages': json.dumps(['Hindi', 'English', 'Marathi']),
                'rating': 4.0,
                'active_tickets': 2
            },
            {
                'name': 'Security Chief',
                'email': 'security.chief@railway.gov.in',
                'phone': '9876543216',
                'role': 'security_officer',
                'department': 'Security',
                'location': 'New Delhi',
                'expertise': json.dumps(['passenger_safety', 'theft_investigation', 'emergency_response']),
                'languages': json.dumps(['Hindi', 'English']),
                'rating': 4.6,
                'active_tickets': 1
            },
            {
                'name': 'Dr. Kavita Medical',
                'email': 'dr.kavita@railway.gov.in',
                'phone': '9876543217',
                'role': 'medical_officer',
                'department': 'Medical',
                'location': 'Hyderabad',
                'expertise': json.dumps(['emergency_medicine', 'first_aid', 'passenger_health']),
                'languages': json.dumps(['Hindi', 'English', 'Telugu']),
                'rating': 4.8,
                'active_tickets': 0
            },
            {
                'name': 'Control Room Manager',
                'email': 'control.room@railway.gov.in',
                'phone': '9876543218',
                'role': 'operations_manager',
                'department': 'Operations',
                'location': 'Central Control',
                'expertise': json.dumps(['schedule_management', 'delay_resolution', 'coordination']),
                'languages': json.dumps(['Hindi', 'English']),
                'rating': 4.2,
                'active_tickets': 5
            },
            {
                'name': 'Customer Service Rep',
                'email': 'customer.service@railway.gov.in',
                'phone': '9876543219',
                'role': 'customer_service',
                'department': 'Customer Support',
                'location': 'All India',
                'expertise': json.dumps(['general_support', 'complaint_handling', 'passenger_assistance']),
                'languages': json.dumps(['Hindi', 'English']),
                'rating': 4.1,
                'active_tickets': 3
            }
        ]

        created_count = 0
        updated_count = 0

        for staff_info in staff_data:
            staff, created = Staff.objects.get_or_create(
                email=staff_info['email'],
                defaults=staff_info
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created staff member: {staff.name} ({staff.role})')
                )
            else:
                # Update existing staff with new data
                for key, value in staff_info.items():
                    if key != 'email':  # Don't update email as it's unique
                        setattr(staff, key, value)
                staff.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated staff member: {staff.name} ({staff.role})')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed {len(staff_data)} staff records: '
                f'{created_count} created, {updated_count} updated'
            )
        )
        
        # Show total staff count
        total_staff = Staff.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'Total staff members in database: {total_staff}')
        )