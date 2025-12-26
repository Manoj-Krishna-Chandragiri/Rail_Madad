from django.contrib import admin
from .models import FirebaseUser

@admin.register(FirebaseUser)
class FirebaseUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'user_type', 'is_admin', 'is_staff', 'is_passenger', 'date_joined', 'is_active']
    list_filter = ['is_admin', 'is_staff', 'is_passenger', 'is_super_admin', 'date_joined', 'is_active']
    search_fields = ['email', 'full_name', 'firebase_uid']
    readonly_fields = ['firebase_uid', 'date_joined', 'user_type']
    
    fieldsets = (
        ('User Information', {
            'fields': ('firebase_uid', 'email', 'full_name', 'phone_number', 'gender', 'address')
        }),
        ('Role Permissions', {
            'fields': ('is_passenger', 'is_staff', 'is_admin', 'is_super_admin', 'is_active')
        }),
        ('System Info', {
            'fields': ('user_type', 'date_joined'),
            'classes': ('collapse',)
        }),
    )