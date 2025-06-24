from django.urls import path
from .views import file_complaint, user_complaints, complaint_detail, complaint_list, admin_profile,submit_feedback,feedback_view
from . import views

urlpatterns = [
    path('file/', file_complaint, name='file_complaint'),
    path('list/', complaint_list, name='complaint_list'),
    path('user/', user_complaints, name='user_complaints'),
    path('<int:complaint_id>/', complaint_detail, name='complaint_detail'),
    path('admin/profile/', admin_profile, name='admin_profile'),
    path('submit/', submit_feedback, name='submit-feedback'),
    path('feedback/', feedback_view, name='feedback'),
    path('staff/', views.staff_list, name='staff-list'),
    path('staff/<int:pk>/', views.staff_detail, name='staff-detail'),

    # Admin API endpoints
    path('admin/complaints/', views.admin_get_all_complaints, name='admin-complaints'),
    path('admin/complaints/<int:complaint_id>/status/', views.admin_update_complaint_status, name='admin-update-complaint-status'),
    path('admin/staff/', views.admin_staff_list, name='admin-staff-list'),
    path('admin/staff/<int:pk>/', views.admin_staff_detail, name='admin-staff-detail'),
    path('admin/dashboard-stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
]