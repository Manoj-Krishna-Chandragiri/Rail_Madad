"""
Management command to seed the database with sample complaints for development/testing.
Usage: python manage.py seed_complaints [--count 20]
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from complaints.models import Complaint
import random
from datetime import timedelta

COMPLAINT_TYPES = [
    'Cleanliness',
    'Catering',
    'Staff Behaviour',
    'Ticketing',
    'Electrical Issues',
    'Coach Maintenance',
    'Security',
    'Medical Emergency',
    'Punctuality',
    'Water Supply',
]

DESCRIPTIONS = [
    'The coach is extremely dirty with garbage overflowing from the dustbins.',
    'Food served in the pantry car was stale and of very poor quality.',
    'The TTE was rude and misbehaved with passengers.',
    'Unable to book tatkal ticket due to system failure.',
    'Lights and fans not working in S3 coach.',
    'Broken seat and window latch in berth 42.',
    'Suspicious person spotted near the luggage area.',
    'Passenger fainted and needs medical assistance urgently.',
    'Train is running 3 hours late with no announcement.',
    'No water supply in the washrooms for the past 6 hours.',
    'AC not working in 3A coach, temperature is unbearable.',
    'Cockroaches found in the meal served by the pantry staff.',
    'Ticket checker demanded bribe for seat allocation.',
    'Mobile charging point not functional at berth 24.',
    'Toilet is clogged and overflowing in coach B2.',
    'Theft reported in sleeper coach S5 during night hours.',
    'Child fell ill due to unhygienic food served on board.',
    'Train departed 2 hours before scheduled time without announcement.',
    'Water leaking from roof in AC coach during rain.',
    'Overcrowding in general compartment beyond safe capacity.',
]

TRAIN_NUMBERS = ['12301', '12302', '12951', '12952', '22691', '22692', '12621', '12622', '12009', '12010']
PNR_NUMBERS = ['4567891230', '7891234560', '1234567890', '9876543210', '5432167890',
               '3456789012', '6789012345', '2345678901', '8901234567', '4321098765']
LOCATIONS = ['New Delhi', 'Mumbai CST', 'Chennai Central', 'Kolkata', 'Bangalore City',
             'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow']
STAFF_NAMES = ['Ramesh Kumar', 'Sita Devi', 'Anil Sharma', 'Priya Patel', 'Mohan Singh',
               'Kavita Rao', 'Suresh Verma', 'Deepa Nair', 'Rajesh Iyer', 'Meena Gupta']


class Command(BaseCommand):
    help = 'Seeds the database with sample complaints for development/testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Number of complaints to create (default: 20)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing complaints before seeding',
        )

    def handle(self, *args, **options):
        count = options['count']

        if options['clear']:
            deleted, _ = Complaint.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Cleared {deleted} existing complaints.'))

        User = get_user_model()
        user = User.objects.filter(is_admin=True).first() or User.objects.first()

        statuses = ['Open', 'In Progress', 'Closed']
        # Weight distribution: ~40% Open, ~35% In Progress, ~25% Closed
        status_weights = [0.40, 0.35, 0.25]
        severities = ['Low', 'Medium', 'High']
        priorities = ['Low', 'Medium', 'High', 'Critical']

        created = 0
        now = timezone.now()

        for i in range(count):
            days_ago = random.randint(0, 60)
            created_at = now - timedelta(days=days_ago, hours=random.randint(0, 23))

            chosen_status = random.choices(statuses, weights=status_weights)[0]

            resolved_at = None
            if chosen_status == 'Closed':
                # Resolved 1–5 days after creation
                resolved_at = created_at + timedelta(days=random.randint(1, 5))

            complaint = Complaint(
                type=random.choice(COMPLAINT_TYPES),
                description=random.choice(DESCRIPTIONS),
                location=random.choice(LOCATIONS),
                train_number=random.choice(TRAIN_NUMBERS),
                pnr_number=random.choice(PNR_NUMBERS),
                severity=random.choice(severities),
                priority=random.choice(priorities),
                date_of_incident=(created_at - timedelta(days=random.randint(0, 2))).date(),
                status=chosen_status,
                staff=random.choice(STAFF_NAMES) if chosen_status != 'Open' else None,
                user=user,
                resolved_at=resolved_at,
            )
            # Bypass the auto-now behavior by using update() after creation
            complaint.save()
            # Backdate created_at since it uses default=timezone.now
            Complaint.objects.filter(pk=complaint.pk).update(created_at=created_at)
            created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'OK: Successfully created {created} sample complaints.\n'
                f'   Open: {Complaint.objects.filter(status="Open").count()}\n'
                f'   In Progress: {Complaint.objects.filter(status="In Progress").count()}\n'
                f'   Closed: {Complaint.objects.filter(status="Closed").count()}'
            )
        )
