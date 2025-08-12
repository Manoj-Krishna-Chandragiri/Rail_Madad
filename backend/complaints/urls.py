from django.urls import path
from .views import (
    file_complaint, 
    user_complaints, 
    complaint_detail, 
    complaint_list, 
    admin_profile,
    submit_feedback,  
    feedback_view,
    feedback_sentiment_stats
)
from . import views

urlpatterns = [
    path('file/', file_complaint, name='file_complaint'),
    path('user/', user_complaints, name='user_complaints'),
    path('<int:complaint_id>/', complaint_detail, name='complaint_detail'),
    path('', complaint_list, name='complaint_list'),
    path('admin/profile/', admin_profile, name='admin_profile'),
    path('feedback/', submit_feedback, name='submit_feedback'),  
    path('feedback/view/', feedback_view, name='feedback_view'), 
    path('feedback/sentiment-stats/', feedback_sentiment_stats, name='feedback_sentiment_stats'),

    # Admin API endpoints
    path('admin/complaints/', views.admin_get_all_complaints, name='admin-complaints'),
    path('admin/complaints/<int:complaint_id>/status/', views.admin_update_complaint_status, name='admin-update-complaint-status'),
    path('admin/staff/', views.admin_staff_list, name='admin-staff-list'),
    path('admin/staff/<int:pk>/', views.admin_staff_detail, name='admin-staff-detail'),
    path('admin/dashboard-stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('admin/complaint-trends/', views.admin_complaint_trends, name='admin-complaint-trends'),  # Add this new endpoint

    # Smart Classification endpoints
    path('admin/smart-classification/stats/', views.smart_classification_stats, name='smart-classification-stats'),
    path('admin/smart-classification/complaints/', views.smart_classification_complaints, name='smart-classification-complaints'),
    path('admin/smart-classification/<int:complaint_id>/update/', views.update_classification, name='update-classification'),

    # Quick Resolution endpoints
    path('admin/quick-resolution/stats/', views.quick_resolution_stats, name='quick-resolution-stats'),
    path('admin/quick-resolution/solutions/', views.quick_resolution_solutions, name='quick-resolution-solutions'),

    # Search endpoint
    path('search/', views.search_user_complaints, name='search_user_complaints'),
    
    # Public staff endpoints (for passengers to view staff)
    path('staff/', views.staff_list, name='staff-list'),
    path('staff/<int:pk>/', views.staff_detail, name='staff-detail'),
]