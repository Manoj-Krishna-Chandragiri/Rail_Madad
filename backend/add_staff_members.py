"""
Script to add diverse staff members to complaints_staff table
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from complaints.models import Staff
import json

# Staff data with common AP/Telangana names
staff_members = [
    {
        "name": "Ramesh Kumar",
        "email": "ramesh.kumar@railmadad.in",
        "phone": "9876501234",
        "department": "Technical Support",
        "role": "Technical Support",
        "location": "Hyderabad",
        "expertise": ["Technical Support", "Technical Troubleshooting"],
        "languages": ["Telugu", "Hindi", "English"],
        "communication_preferences": ["Chat", "Voice"],
    },
    {
        "name": "Lakshmi Devi",
        "email": "lakshmi.devi@railmadad.in",
        "phone": "9876502345",
        "department": "Customer Service",
        "role": "Customer Support",
        "location": "Vijayawada",
        "expertise": ["Booking Issues", "General Inquiries", "Passenger Assistance"],
        "languages": ["Telugu", "Hindi", "English"],
        "communication_preferences": ["Chat", "Voice", "Video"],
    },
    {
        "name": "Venkatesh Rao",
        "email": "venkatesh.rao@railmadad.in",
        "phone": "9876503456",
        "department": "Refunds",
        "role": "Refund Specialist",
        "location": "Warangal",
        "expertise": ["Refunds", "Complaint Resolution"],
        "languages": ["Telugu", "English"],
        "communication_preferences": ["Chat", "Voice"],
    },
    {
        "name": "Sai Priya",
        "email": "sai.priya@railmadad.in",
        "phone": "9876504567",
        "department": "Feedback Management",
        "role": "Feedback Coordinator",
        "location": "Hyderabad",
        "expertise": ["Feedback Management", "Complaint Resolution", "General Inquiries"],
        "languages": ["Telugu", "Hindi", "English", "Tamil"],
        "communication_preferences": ["Chat", "Video"],
    },
    {
        "name": "Krishna Murthy",
        "email": "krishna.murthy@railmadad.in",
        "phone": "9876505678",
        "department": "Security",
        "role": "Security Officer",
        "location": "Tirupati",
        "expertise": ["Security Concerns", "Escalation Management"],
        "languages": ["Telugu", "English", "Tamil"],
        "communication_preferences": ["Chat", "Voice", "Video"],
    },
    {
        "name": "Anjali Reddy",
        "email": "anjali.reddy@railmadad.in",
        "phone": "9876506789",
        "department": "Customer Service",
        "role": "Senior Support",
        "location": "Vizag",
        "expertise": ["Passenger Assistance", "General Inquiries", "Booking Issues"],
        "languages": ["Telugu", "English", "Hindi"],
        "communication_preferences": ["Chat", "Voice"],
    },
    {
        "name": "Rajasekhar Naidu",
        "email": "rajasekhar.naidu@railmadad.in",
        "phone": "9876507890",
        "department": "Technical Support",
        "role": "Senior Technical",
        "location": "Guntur",
        "expertise": ["Technical Support", "Technical Troubleshooting", "Escalation Management"],
        "languages": ["Telugu", "English"],
        "communication_preferences": ["Chat", "Voice", "Video"],
    },
    {
        "name": "Padmavathi Sharma",
        "email": "padmavathi.sharma@railmadad.in",
        "phone": "9876508901",
        "department": "Customer Service",
        "role": "Customer Relations",
        "location": "Nellore",
        "expertise": ["Complaint Resolution", "Feedback Management", "Passenger Assistance"],
        "languages": ["Telugu", "Hindi", "English", "Tamil"],
        "communication_preferences": ["Chat", "Voice", "Video"],
    },
    {
        "name": "Suresh Babu",
        "email": "suresh.babu@railmadad.in",
        "phone": "9876509012",
        "department": "Booking Services",
        "role": "Booking Specialist",
        "location": "Kakinada",
        "expertise": ["Booking Issues", "Refunds", "General Inquiries"],
        "languages": ["Telugu", "English"],
        "communication_preferences": ["Chat", "Voice"],
    },
    {
        "name": "Kavitha Rani",
        "email": "kavitha.rani@railmadad.in",
        "phone": "9876510123",
        "department": "Customer Service",
        "role": "Support Executive",
        "location": "Rajahmundry",
        "expertise": ["General Inquiries", "Passenger Assistance", "Complaint Resolution"],
        "languages": ["Telugu", "Hindi", "English"],
        "communication_preferences": ["Chat", "Video"],
    },
]

def add_staff_members():
    """Add staff members to database"""
    print("\n=== Adding Staff Members to complaints_staff ===\n")
    
    added_count = 0
    skipped_count = 0
    
    for staff_data in staff_members:
        # Check if staff already exists
        if Staff.objects.filter(email=staff_data['email']).exists():
            print(f"⚠️  Skipped: {staff_data['name']} - Email already exists")
            skipped_count += 1
            continue
        
        # Create staff member
        staff = Staff.objects.create(
            name=staff_data['name'],
            email=staff_data['email'],
            phone=staff_data['phone'],
            department=staff_data['department'],
            role=staff_data['role'],
            location=staff_data['location'],
            expertise=json.dumps(staff_data['expertise']),
            languages=json.dumps(staff_data['languages']),
            communication_preferences=json.dumps(staff_data['communication_preferences']),
            status='active',
            rating=4.5,  # Default rating
            active_tickets=0,
        )
        
        print(f"✅ Added: {staff_data['name']} ({staff_data['role']}) - {staff_data['location']}")
        added_count += 1
    
    print(f"\n=== Summary ===")
    print(f"✅ Added: {added_count} staff members")
    print(f"⚠️  Skipped: {skipped_count} staff members (already exist)")
    print(f"\n📊 Total staff in database: {Staff.objects.count()}")
    
    # Show expertise coverage
    print(f"\n=== Expertise Coverage ===")
    all_expertise = set()
    for staff in Staff.objects.all():
        try:
            expertise_list = json.loads(staff.expertise) if isinstance(staff.expertise, str) else staff.expertise
            all_expertise.update(expertise_list)
        except:
            pass
    
    for expertise in sorted(all_expertise):
        count = 0
        for staff in Staff.objects.all():
            try:
                expertise_list = json.loads(staff.expertise) if isinstance(staff.expertise, str) else staff.expertise
                if expertise in expertise_list:
                    count += 1
            except:
                pass
        print(f"  • {expertise}: {count} staff members")

if __name__ == '__main__':
    add_staff_members()
