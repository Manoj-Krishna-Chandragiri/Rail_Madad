from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class FirebaseUserManager(BaseUserManager):
    def create_user(self, email, firebase_uid, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        
        email = self.normalize_email(email)
        user = self.model(email=email, firebase_uid=firebase_uid, **extra_fields)
        
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, firebase_uid, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        extra_fields.setdefault('is_super_admin', True)
        
        return self.create_user(email, firebase_uid, password, **extra_fields)

class FirebaseUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    firebase_uid = models.CharField(max_length=128, unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    
    # User role fields (boolean flags for flexible role assignment)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_super_admin = models.BooleanField(default=False)
    is_passenger = models.BooleanField(default=True)  # Default to passenger

    objects = FirebaseUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firebase_uid']

    def __str__(self):
        return self.email
    
    @property
    def user_type(self):
        """
        Dynamic user_type property based on boolean flags for backward compatibility
        Priority: super_admin > admin > staff > passenger
        """
        if self.is_super_admin:
            return 'super_admin'
        elif self.is_admin:
            return 'admin'
        elif self.is_staff:
            return 'staff'
        else:
            return 'passenger'
    
    @property
    def is_user_admin(self):
        return self.is_admin or self.is_super_admin
    
    @property
    def is_user_staff(self):
        return self.is_staff or self.is_admin or self.is_super_admin
    
    @property
    def is_user_passenger(self):
        return self.is_passenger