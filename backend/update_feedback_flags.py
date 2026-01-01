import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Complaint, Feedback

print('Updating complaints with has_feedback flag...\n')

# Get all complaint IDs that have feedback
feedbacks = Feedback.objects.values_list('complaint_id', flat=True).distinct()
print(f'Found {len(feedbacks)} complaints with feedback submissions')

updated = 0
for complaint_id in feedbacks:
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        if not complaint.has_feedback:
            complaint.has_feedback = True
            complaint.save()
            updated += 1
            print(f'✓ Updated complaint #{complaint_id}')
        else:
            print(f'- Complaint #{complaint_id} already marked')
    except Complaint.DoesNotExist:
        print(f'✗ Complaint #{complaint_id} not found')
    except Exception as e:
        print(f'✗ Error updating complaint #{complaint_id}: {e}')

print(f'\n✓ Updated {updated} complaints with has_feedback flag')
