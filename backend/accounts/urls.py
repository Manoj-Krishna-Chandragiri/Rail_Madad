from django.urls import path
from . import views
from .views import verify_admin, get_admin_profile

urlpatterns = [
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/create/', views.create_profile, name='create_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/delete/', views.delete_user_account, name='delete_user_account'),
    path('register/', views.register_user, name='register_user'),
    path('staff/create/', views.create_staff, name='create_staff'),
    path('users/', views.list_users, name='list_users'),
    path('admin/verify/', verify_admin, name='verify-admin'),
    path('admin/profile/', get_admin_profile, name='admin-profile'),
]