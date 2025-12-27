"""
URL Configuration for role-based API endpoints
Add these to your accounts/urls.py or backend/urls.py
"""

from django.urls import path
from .views_roles import (
    # Profile
    get_user_profile,
    update_user_profile,
    
    # Admin
    list_admins,
    create_admin,
    
    # Staff
    list_staff,
    get_staff_detail,
    create_staff,
    update_staff,
    get_available_staff,
    
    # Passenger
    list_passengers,
    get_passenger_detail,
    
    # Stats
    get_dashboard_stats,
)

urlpatterns = [
    # Unified Profile Endpoints
    path('api/profile/', get_user_profile, name='user-profile'),
    path('api/profile/update/', update_user_profile, name='update-profile'),
    
    # Admin Endpoints
    path('api/admins/', list_admins, name='list-admins'),
    path('api/admins/create/', create_admin, name='create-admin'),
    
    # Staff Endpoints
    path('api/staff/', list_staff, name='list-staff'),
    path('api/staff/<int:staff_id>/', get_staff_detail, name='staff-detail'),
    path('api/staff/create/', create_staff, name='create-staff'),
    path('api/staff/<int:staff_id>/update/', update_staff, name='update-staff'),
    path('api/staff/available/', get_available_staff, name='available-staff'),
    
    # Passenger Endpoints
    path('api/passengers/', list_passengers, name='list-passengers'),
    path('api/passengers/<int:passenger_id>/', get_passenger_detail, name='passenger-detail'),
    
    # Dashboard & Stats
    path('api/dashboard/stats/', get_dashboard_stats, name='dashboard-stats'),
]

# Alternative: If you want to keep backward compatibility with old endpoints
# You can add these aliases:
"""
urlpatterns += [
    # Backward compatibility aliases
    path('api/user/', get_user_profile, name='user-profile-old'),
    path('api/admin/staff/', list_staff, name='list-staff-old'),
]
"""
