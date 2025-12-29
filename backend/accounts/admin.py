from django.contrib import admin
from .models import FirebaseUser
from .face_models import FaceProfile, FaceAuthLog, FaceEnrollmentSession

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


@admin.register(FaceProfile)
class FaceProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_verified', 'model_name', 'enrollment_date', 'last_updated']
    list_filter = ['is_verified', 'model_name', 'enrollment_date']
    search_fields = ['user__email', 'user__full_name']
    readonly_fields = ['enrollment_date', 'last_updated', 'image_quality_score']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Face Data', {
            'fields': ('face_image', 'is_verified', 'image_quality_score', 'model_name')
        }),
        ('Timestamps', {
            'fields': ('enrollment_date', 'last_updated'),
            'classes': ('collapse',)
        }),
    )


@admin.register(FaceAuthLog)
class FaceAuthLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'user', 'status', 'confidence_score', 'ip_address', 'is_successful']
    list_filter = ['status', 'timestamp', 'model_used']
    search_fields = ['user__email', 'matched_user_email', 'ip_address']
    readonly_fields = ['timestamp', 'user', 'captured_image', 'status', 'confidence_score', 
                      'ip_address', 'user_agent', 'matched_user_email', 'model_used', 
                      'processing_time_ms']
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Authentication Result', {
            'fields': ('user', 'status', 'confidence_score', 'matched_user_email')
        }),
        ('Image', {
            'fields': ('captured_image',)
        }),
        ('Request Info', {
            'fields': ('ip_address', 'user_agent', 'model_used', 'processing_time_ms'),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('timestamp',)
        }),
    )
    
    def is_successful(self, obj):
        return obj.is_successful
    is_successful.boolean = True
    is_successful.short_description = 'Success'


@admin.register(FaceEnrollmentSession)
class FaceEnrollmentSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user', 'images_count', 'completed', 'created_at', 'completed_at']
    list_filter = ['completed', 'created_at']
    search_fields = ['user__email', 'session_id']
    readonly_fields = ['session_id', 'created_at', 'completed_at']
    
    fieldsets = (
        ('Session Info', {
            'fields': ('user', 'session_id', 'images_count', 'completed')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'completed_at')
        }),
    )