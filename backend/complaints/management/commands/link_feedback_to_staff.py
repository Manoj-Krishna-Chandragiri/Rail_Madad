"""
Management command to link existing feedback to staff members
"""

from django.core.management.base import BaseCommand
from complaints.models import Complaint, Feedback, Staff


class Command(BaseCommand):
    help = 'Link existing feedback records to staff members based on complaint assignments'

    def handle(self, *args, **options):
        # Get all feedback without staff link
        unlinked_feedbacks = Feedback.objects.filter(staff__isnull=True)
        
        self.stdout.write(f'Found {unlinked_feedbacks.count()} unlinked feedbacks')
        
        linked_count = 0
        failed_count = 0
        
        for feedback in unlinked_feedbacks:
            try:
                # Get the complaint ID
                complaint_id = feedback.complaint_id
                
                # Try to find the complaint
                try:
                    complaint = Complaint.objects.get(id=int(complaint_id))
                except (ValueError, Complaint.DoesNotExist):
                    self.stdout.write(self.style.WARNING(
                        f'⚠️ Feedback {feedback.id}: Complaint {complaint_id} not found'
                    ))
                    failed_count += 1
                    continue
                
                # Get staff name from complaint
                staff_name = complaint.staff
                if not staff_name or staff_name == 'Unassigned':
                    self.stdout.write(self.style.WARNING(
                        f'⚠️ Feedback {feedback.id}: No staff assigned to complaint {complaint_id}'
                    ))
                    failed_count += 1
                    continue
                
                # Find staff member by name
                staff_member = Staff.objects.filter(name=staff_name).first()
                if not staff_member:
                    self.stdout.write(self.style.WARNING(
                        f'⚠️ Feedback {feedback.id}: Staff "{staff_name}" not found'
                    ))
                    failed_count += 1
                    continue
                
                # Link feedback to staff
                feedback.staff = staff_member
                feedback.save()
                
                # Update staff rating
                staff_feedbacks = Feedback.objects.filter(staff=staff_member)
                from django.db.models import Avg
                avg_rating = staff_feedbacks.aggregate(Avg('rating'))['rating__avg'] or 0
                staff_member.rating = round(avg_rating, 2)
                staff_member.save()
                
                self.stdout.write(self.style.SUCCESS(
                    f'✅ Feedback {feedback.id}: Linked to {staff_name} (rating now {staff_member.rating})'
                ))
                linked_count += 1
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f'❌ Feedback {feedback.id}: {e}'
                ))
                failed_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Successfully linked {linked_count}/{unlinked_feedbacks.count()} feedbacks'
        ))
        if failed_count > 0:
            self.stdout.write(self.style.WARNING(
                f'⚠️ {failed_count} feedbacks could not be linked'
            ))
