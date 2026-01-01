from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from complaints.models import Complaint, Notification, Staff
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Seeds notifications for existing complaints to populate staff and admin notifications'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting notification seeding...'))
        
        # Get recent complaints
        recent_complaints = Complaint.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).order_by('-created_at')[:20]
        
        notifications_created = 0
        
        # Admin emails
        admin_emails = ['adm.railmadad@gmail.com', 'admin@railmadad.in', '22BQ1A4225@vvit.net']
        
        for complaint in recent_complaints:
            try:
                # Create staff notification if complaint is assigned
                if complaint.staff and complaint.staff != 'Unassigned':
                    staff_member = Staff.objects.filter(name=complaint.staff).first()
                    if staff_member and staff_member.email:
                        # Check if notification already exists
                        existing = Notification.objects.filter(
                            user_email=staff_member.email,
                            related_id=str(complaint.id),
                            type='complaint_assigned'
                        ).exists()
                        
                        if not existing:
                            Notification.objects.create(
                                user_email=staff_member.email,
                                type='complaint_assigned',
                                title='Complaint Assigned to You',
                                message=f'Complaint #{complaint.id} ({complaint.type}) is assigned to you. Priority: {complaint.priority}, Status: {complaint.status}',
                                related_id=str(complaint.id),
                                action_url=f'/staff-dashboard/complaints/{complaint.id}',
                                created_at=complaint.created_at + timedelta(minutes=5),
                                is_read=False
                            )
                            notifications_created += 1
                            self.stdout.write(f'✓ Created staff notification for complaint #{complaint.id}')
                
                # Create admin notifications for high/critical priority complaints
                if complaint.priority in ['High', 'Critical']:
                    for admin_email in admin_emails:
                        existing = Notification.objects.filter(
                            user_email=admin_email,
                            related_id=str(complaint.id),
                            type='system'
                        ).exists()
                        
                        if not existing:
                            Notification.objects.create(
                                user_email=admin_email,
                                type='system',
                                title=f'{complaint.priority} Priority Complaint',
                                message=f'Complaint #{complaint.id} ({complaint.type}) requires attention. Status: {complaint.status}, Severity: {complaint.severity}',
                                related_id=str(complaint.id),
                                action_url=f'/admin-dashboard/complaints/{complaint.id}',
                                created_at=complaint.created_at,
                                is_read=False
                            )
                            notifications_created += 1
                            self.stdout.write(f'✓ Created admin notification for complaint #{complaint.id}')
                
                # Create status update notifications for complaint owner if status changed
                if complaint.user and complaint.user.email and complaint.status in ['In Progress', 'Closed']:
                    existing = Notification.objects.filter(
                        user_email=complaint.user.email,
                        related_id=str(complaint.id),
                        type='status_update'
                    ).exists()
                    
                    if not existing:
                        Notification.objects.create(
                            user_email=complaint.user.email,
                            type='status_update',
                            title=f'Complaint {complaint.status}',
                            message=f'Your complaint #{complaint.id} regarding {complaint.type} is now {complaint.status}.',
                            related_id=str(complaint.id),
                            action_url=f'/user-dashboard/complaints/{complaint.id}',
                            created_at=complaint.updated_at,
                            is_read=False
                        )
                        notifications_created += 1
                        self.stdout.write(f'✓ Created passenger notification for complaint #{complaint.id}')
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error processing complaint #{complaint.id}: {str(e)}'))
        
        # Add some general admin notifications
        try:
            admin_general_notifications = [
                {
                    'title': 'Daily Complaint Summary',
                    'message': f'{recent_complaints.count()} complaints received in the last 30 days.',
                    'type': 'system',
                    'priority': 'low'
                },
                {
                    'title': 'System Health Check',
                    'message': 'All systems operational. AI classification running smoothly.',
                    'type': 'system',
                    'priority': 'low'
                }
            ]
            
            for admin_email in admin_emails:
                for notif_data in admin_general_notifications:
                    existing = Notification.objects.filter(
                        user_email=admin_email,
                        title=notif_data['title']
                    ).exists()
                    
                    if not existing:
                        Notification.objects.create(
                            user_email=admin_email,
                            type=notif_data['type'],
                            title=notif_data['title'],
                            message=notif_data['message'],
                            created_at=timezone.now() - timedelta(hours=2),
                            is_read=False
                        )
                        notifications_created += 1
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Error creating admin notifications: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Seeding complete! Created {notifications_created} notifications.'))
