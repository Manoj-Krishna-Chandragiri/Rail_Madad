from django.urls import path, include
from . import views
from .views import verify_admin, get_admin_profile

urlpatterns = [
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/create/', views.create_profile, name='create_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/delete/', views.delete_user_account, name='delete_user_account'),
    path('register/', views.register_user, name='register_user'),
    path('staff/create/', views.create_staff, name='create_staff'),
    path('staff/register/', views.staff_register, name='staff_register'),
    path('staff/list/', views.staff_list, name='staff_list'),
    path('staff/performance/', views.staff_performance, name='staff_performance'),
    path('users/', views.list_users, name='list_users'),
    path('admin/verify/', verify_admin, name='verify-admin'),
    path('admin/profile/', get_admin_profile, name='admin-profile'),
    path('notifications/', views.get_notifications, name='get_notifications'),
    path('notifications/preferences/', views.update_notification_preferences, name='update_notification_preferences'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_as_read, name='mark_notification_as_read'),
    path('notifications/read-all/', views.mark_all_notifications_as_read, name='mark_all_notifications_as_read'),
    
    # Facial Authentication endpoints (disabled to prevent TensorFlow hang on startup)
    # path('', include('accounts.face_urls')),
    
    # Development endpoints
    path('dev/users/', views.dev_list_users, name='dev_list_users'),
    path('dev/switch-user/', views.dev_switch_user, name='dev_switch_user'),
]