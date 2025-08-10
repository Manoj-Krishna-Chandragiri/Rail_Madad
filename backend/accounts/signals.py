from django.conf import settings
from django.db.models.signals import post_migrate
from django.dispatch import receiver
import firebase_admin
from firebase_admin import auth
import uuid
import logging

logger = logging.getLogger(__name__)

def create_admin_user(sender, **kwargs):
    """
    Create the admin user after the database is set up.
    This function will execute after migrations are applied.
    """
    # Import the User model here to avoid circular imports
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Check if admin user exists
    admin_email = getattr(settings, 'ADMIN_EMAIL', 'adm.railmadad@gmail.com')
    admin_password = getattr(settings, 'ADMIN_PASSWORD', 'admin123456')
    
    try:
        # Check if user exists in our database
        if not User.objects.filter(email=admin_email).exists():
            logger.info(f"Creating admin user with email: {admin_email}")
            
            # Check if user exists in Firebase
            firebase_uid = None
            try:
                firebase_user = auth.get_user_by_email(admin_email)
                firebase_uid = firebase_user.uid
                logger.info(f"Found existing Firebase user: {admin_email}")
            except firebase_admin.exceptions.NotFoundError:
                # Create the user in Firebase
                try:
                    firebase_user = auth.create_user(
                        email=admin_email,
                        password=admin_password,
                        email_verified=True
                    )
                    firebase_uid = firebase_user.uid
                    logger.info(f"Created Firebase user: {admin_email}")
                    
                    # Set admin custom claims
                    auth.set_custom_user_claims(firebase_uid, {'admin': True})
                    logger.info(f"Set admin claims for user: {admin_email}")
                except Exception as e:
                    logger.error(f"Error creating Firebase user: {str(e)}")
                    # Use a random UID if Firebase creation fails
                    firebase_uid = str(uuid.uuid4())
            
            # Now create the Django user
            user = User.objects.create(
                email=admin_email,
                firebase_uid=firebase_uid,
                user_type='admin',
                is_admin=True,
                is_staff=True,
                is_active=True,
                full_name="Admin User"
            )
            logger.info(f"Admin user created successfully with email: {admin_email}")
            
        else:
            logger.info(f"Admin user already exists: {admin_email}")
            
    except Exception as e:
        logger.error(f"Error creating admin user: {str(e)}")