from django.contrib import admin
from .models import FirebaseUser

@admin.register(FirebaseUser)
class FirebaseUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'user_type', 'date_joined', 'is_active']
    list_filter = ['user_type', 'date_joined', 'is_active']
    search_fields = ['email', 'full_name', 'firebase_uid']
    readonly_fields = ['firebase_uid', 'date_joined']
    
    fieldsets = (
        ('User Information', {
            'fields': ('firebase_uid', 'email', 'full_name', 'phone_number', 'gender', 'address')
        }),
        ('Permissions', {
            'fields': ('user_type', 'is_active', 'is_staff', 'is_admin')
        }),
        ('Timestamps', {
            'fields': ('date_joined',),
            'classes': ('collapse',)
        }),
    )