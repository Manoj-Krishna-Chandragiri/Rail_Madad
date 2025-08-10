from django.core.management.base import BaseCommand
from complaints.models import QuickSolution

class Command(BaseCommand):
    help = 'Populate the database with sample quick resolution solutions'

    def handle(self, *args, **options):
        solutions_data = [
            {
                'problem': 'PNR Status Not Updating',
                'solution': '1. Clear browser cache and cookies\n2. Wait for 15 minutes for system refresh\n3. Try refreshing the page or check from different browser\n4. Contact support if issue persists beyond 1 hour',
                'category': 'Unreserved / Reserved Ticketing',
            },
            {
                'problem': 'Refund Not Processed',
                'solution': '1. Check bank account details in profile\n2. Verify cancellation status and refund eligibility\n3. Wait for 5-7 business days for automatic processing\n4. Raise ticket if delayed beyond expected timeframe',
                'category': 'Refund of Tickets',
            },
            {
                'problem': 'Seat Not Allocated Despite Confirmed Ticket',
                'solution': '1. Check PNR status for latest updates\n2. Verify booking confirmation details\n3. Contact TTE (Ticket Examiner) on train\n4. Visit station help desk for immediate assistance',
                'category': 'Passenger Amenities',
            },
            {
                'problem': 'Coach Position Information Missing',
                'solution': '1. Check train composition on NTES app\n2. Arrive at platform 30 minutes early\n3. Look for coach position display boards\n4. Ask station staff or use platform inquiry counter',
                'category': 'Train Services',
            },
            {
                'problem': 'E-Ticket Download Failed',
                'solution': '1. Check internet connection and retry\n2. Clear browser cache and download again\n3. Log into IRCTC account and redownload\n4. Use mobile app as alternative download method',
                'category': 'Unreserved / Reserved Ticketing',
            },
            {
                'problem': 'Food Quality Issues in Train',
                'solution': '1. Report immediately to pantry car staff\n2. Take photos as evidence if possible\n3. Contact TTE for formal complaint registration\n4. Submit feedback through Rail Madad app post-journey',
                'category': 'Catering Services',
            },
            {
                'problem': 'AC Not Working in Coach',
                'solution': '1. Inform TTE immediately about the issue\n2. Request coach change if available\n3. Check if it\'s a temporary power issue\n4. Report through Rail Madad for priority resolution',
                'category': 'Passenger Amenities',
            },
            {
                'problem': 'Train Delay Information Not Available',
                'solution': '1. Check NTES website or mobile app\n2. Call 139 railway inquiry number\n3. Check station announcement boards\n4. Use WhatsApp service 9717630982 for updates',
                'category': 'Train Services',
            },
            {
                'problem': 'Luggage Theft or Loss',
                'solution': '1. Report immediately to GRP (Government Railway Police)\n2. File FIR at nearest railway police station\n3. Inform TTE and get acknowledgment\n4. Submit insurance claim if applicable',
                'category': 'Security',
            },
            {
                'problem': 'Tatkal Booking Failure',
                'solution': '1. Ensure all passenger details are pre-filled\n2. Use multiple payment options as backup\n3. Try booking exactly at tatkal opening time\n4. Keep backup travel dates for flexibility',
                'category': 'Unreserved / Reserved Ticketing',
            }
        ]

        created_count = 0
        for solution_data in solutions_data:
            solution, created = QuickSolution.objects.get_or_create(
                problem=solution_data['problem'],
                defaults={
                    'solution': solution_data['solution'],
                    'category': solution_data['category'],
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created solution: {solution.problem}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Solution already exists: {solution.problem}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully populated {created_count} new quick solutions!')
        )
