from django.contrib import admin
from .models import FirebaseUser

@admin.register(FirebaseUser)
class FirebaseUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'role', 'created_at', 'is_active']
    list_filter = ['role', 'created_at', 'is_active']
    search_fields = ['email', 'name', 'uid']
    readonly_fields = ['uid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('uid', 'email', 'name', 'profile_picture')
        }),
        ('Permissions', {
            'fields': ('role', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )