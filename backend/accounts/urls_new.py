"""
URL patterns for role-based user management
"""

from django.urls import path
from .views_new import (
    get_or_create_user, get_user_profile,
    passenger_profile,
    staff_list, staff_profile, create_staff,
    admin_profile, create_admin,
    delete_user
)

urlpatterns = [
    # Authentication
    path('auth/get-or-create/', get_or_create_user, name='get_or_create_user'),
    path('profile/', get_user_profile, name='get_user_profile'),
    
    # Passenger endpoints
    path('passenger/profile/', passenger_profile, name='passenger_profile'),
    
    # Staff endpoints
    path('staff/', staff_list, name='staff_list'),
    path('staff/profile/', staff_profile, name='staff_profile_own'),
    path('staff/profile/<int:staff_id>/', staff_profile, name='staff_profile'),
    path('staff/create/', create_staff, name='create_staff'),
    
    # Admin endpoints
    path('admin/profile/', admin_profile, name='admin_profile_own'),
    path('admin/profile/<int:admin_id>/', admin_profile, name='admin_profile'),
    path('admin/create/', create_admin, name='create_admin'),
    
    # User management (super admin only)
    path('users/<int:user_id>/delete/', delete_user, name='delete_user'),
]
