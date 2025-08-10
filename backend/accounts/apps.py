from django.apps import AppConfig
from django.db.models.signals import post_migrate


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    
    def ready(self):
        # Import signal handlers
        from .signals import create_admin_user
        post_migrate.connect(create_admin_user, sender=self)