"""
Smart Complaint Assignment Service
Assigns complaints to specific staff members based on:
1. Category/expertise match
2. Current workload (fewer complaints = priority)
3. Severity of existing complaints (prefer staff with lighter workload)
"""

from django.db.models import Count, Q, F
from .models import Complaint, Staff
import logging

logger = logging.getLogger(__name__)


class ComplaintAssignmentService:
    """Service to intelligently assign complaints to staff members"""
    
    # Map complaint categories to staff expertise areas
    CATEGORY_TO_EXPERTISE = {
        'coach-cleanliness': ['Complaint Resolution', 'General Inquiries', 'Passenger Assistance'],
        'catering': ['Booking Issues', 'General Inquiries'],
        'staff-behaviour': ['Security Concerns', 'Escalation Management', 'Complaint Resolution'],
        'ticketing': ['Booking Issues', 'Refunds'],
        'electrical': ['Technical Support', 'Technical Troubleshooting'],
        'coach-maintenance': ['Technical Support', 'Technical Troubleshooting'],
        'security': ['Security Concerns', 'Escalation Management'],
        'medical': ['General Inquiries', 'Escalation Management'],
        'punctuality': ['General Inquiries', 'Escalation Management'],
        'amenities': ['General Inquiries', 'Passenger Assistance'],
        'infrastructure': ['Technical Support', 'General Inquiries'],
        'miscellaneous': ['General Inquiries', 'Complaint Resolution']
    }
    
    # Default expertise for categories
    DEFAULT_EXPERTISE = ['General Inquiries', 'Complaint Resolution', 'Passenger Assistance']
    
    @staticmethod
    def get_staff_expertise(staff):
        """Extract expertise from staff JSON field"""
        import json
        try:
            if isinstance(staff.expertise, str):
                return json.loads(staff.expertise)
            return staff.expertise or []
        except:
            return []
    
    @staticmethod
    def find_best_staff(complaint_category, severity='Medium'):
        """
        Find the best staff member to assign a complaint
        
        Args:
            complaint_category: Category of the complaint (e.g., 'security', 'medical')
            severity: Severity level (Low, Medium, High)
        
        Returns:
            Staff object or None
        """
        # Get required expertise for this category
        required_expertise = ComplaintAssignmentService.CATEGORY_TO_EXPERTISE.get(
            complaint_category.lower(),
            ComplaintAssignmentService.DEFAULT_EXPERTISE
        )
        
        logger.info(f"Finding staff for category: {complaint_category}, severity: {severity}, expertise: {required_expertise}")
        
        # Get all active staff
        staff_list = Staff.objects.filter(status='active').all()
        
        if not staff_list.exists():
            logger.warning("No active staff members found!")
            return None
        
        # Score each staff member
        best_staff = None
        best_score = -999
        
        for staff in staff_list:
            staff_expertise = ComplaintAssignmentService.get_staff_expertise(staff)
            
            # Check if staff has matching expertise
            expertise_match = any(exp in staff_expertise for exp in required_expertise)
            
            if not expertise_match:
                logger.info(f"  {staff.name}: No expertise match (has {staff_expertise})")
                continue
            
            # Count current assignments
            current_complaints = Complaint.objects.filter(
                staff=staff.name,
                status__in=['Open', 'In Progress']
            ).count()
            
            # Count severe complaints (High priority/severity)
            severe_complaints = Complaint.objects.filter(
                staff=staff.name,
                status__in=['Open', 'In Progress'],
                severity='High'
            ).count()
            
            # Calculate score (higher is better)
            # Lower complaint count = higher score
            # Lower severe complaint count = higher score
            # Expertise match bonus
            workload_score = 100 - (current_complaints * 10)  # 10 points per complaint
            severe_penalty = severe_complaints * 20  # 20 points per severe complaint
            expertise_bonus = 50  # Base bonus for matching expertise
            
            total_score = expertise_bonus + workload_score - severe_penalty
            
            logger.info(
                f"  {staff.name} (ID:{staff.id}): "
                f"complaints={current_complaints}, severe={severe_complaints}, "
                f"score={total_score} (expertise={expertise_bonus}, workload={workload_score}, severe_penalty={severe_penalty})"
            )
            
            if total_score > best_score:
                best_score = total_score
                best_staff = staff
        
        if best_staff:
            logger.info(f"✅ Assigned to: {best_staff.name} (ID: {best_staff.id}, score: {best_score})")
        else:
            logger.warning(f"⚠️ No suitable staff found for category: {complaint_category}")
        
        return best_staff
    
    @staticmethod
    def assign_complaint(complaint_category, severity='Medium'):
        """
        Assign a complaint to the best available staff member
        
        Returns:
            Tuple of (staff_name, staff_id) or (None, None)
        """
        staff = ComplaintAssignmentService.find_best_staff(complaint_category, severity)
        
        if staff:
            return staff.name, staff.id
        
        return None, None
    
    @staticmethod
    def get_staff_dashboard(staff_name):
        """
        Get dashboard data for a specific staff member
        
        Returns complaints sorted by:
        1. Status (Open > In Progress > Closed)
        2. Severity (High > Medium > Low)
        3. Priority (Critical > High > Medium > Low)
        """
        complaints = Complaint.objects.filter(
            staff=staff_name
        ).order_by(
            '-status',  # Open first
            '-severity',  # High severity first
            '-priority'  # High priority first
        ).values(
            'id', 'type', 'description', 'status', 'severity', 'priority',
            'location', 'train_number', 'pnr_number', 'date_of_incident',
            'created_at', 'updated_at'
        )
        
        # Add complaint ID prefix
        result = []
        for complaint in complaints:
            complaint['complaint_id'] = f"CMP{complaint['id']:03d}"
            result.append(complaint)
        
        return result
    
    @staticmethod
    def get_staff_workload(staff_name):
        """Get workload statistics for a staff member"""
        open_complaints = Complaint.objects.filter(
            staff=staff_name,
            status__in=['Open', 'In Progress']
        ).count()
        
        closed_complaints = Complaint.objects.filter(
            staff=staff_name,
            status='Closed'
        ).count()
        
        high_severity = Complaint.objects.filter(
            staff=staff_name,
            status__in=['Open', 'In Progress'],
            severity='High'
        ).count()
        
        return {
            'open_complaints': open_complaints,
            'closed_complaints': closed_complaints,
            'high_severity': high_severity,
            'total_assigned': open_complaints + closed_complaints,
            'active_workload': open_complaints + (high_severity * 2)  # Weight severe complaints
        }
