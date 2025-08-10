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
        
        return self.create_user(email, firebase_uid, password, **extra_fields)

class FirebaseUser(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ('passenger', 'Passenger'),
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    )
    
    email = models.EmailField(unique=True)
    firebase_uid = models.CharField(max_length=128, unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='passenger')
    
    # Django specific fields
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    objects = FirebaseUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firebase_uid']

    def __str__(self):
        return self.email
    
    @property
    def is_user_admin(self):
        return self.user_type == 'admin' or self.is_admin
    
    @property
    def is_user_staff(self):
        return self.user_type == 'staff' or self.is_staff