from django.conf import settings
from django.db.models.signals import post_migrate
from django.dispatch import receiver
import firebase_admin
from firebase_admin import auth
import uuid


def create_admin_user(sender, **kwargs):
    """
    Create the admin user after the database is set up.
    This function will execute after migrations are applied.
    """
    # Import the User model here to avoid circular imports
    User = sender.get_model('FirebaseUser')
    
    # Check if admin user exists
    admin_email = settings.ADMIN_EMAIL
    
    try:
        # Check if user exists in our database
        if not User.objects.filter(email=admin_email).exists():
            # Check if user exists in Firebase
            try:
                firebase_user = auth.get_user_by_email(admin_email)
                firebase_uid = firebase_user.uid
            except firebase_admin.exceptions.NotFoundError:
                # Create a random password for admin (they'll use Firebase auth)
                temp_password = str(uuid.uuid4())
                
                # Create the user in Firebase
                firebase_user = auth.create_user(
                    email=admin_email,
                    password=settings.ADMIN_PASSWORD,
                    email_verified=True
                )
                firebase_uid = firebase_user.uid
            
            # Now create the Django user
            User.objects.create(
                email=admin_email,
                firebase_uid=firebase_uid,
                user_type='admin',
                is_admin=True,
                is_staff=True,
                is_active=True,
                full_name="Admin User"
            )
            print(f"Admin user created with email: {admin_email}")
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")