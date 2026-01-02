from django.urls import path
from .views import (
    file_complaint, 
    user_complaints, 
    complaint_detail, 
    complaint_list, 
    admin_profile,
    submit_feedback,  
    feedback_view,
    feedback_sentiment_stats,
    # translate_text,  # Commented out - Using Google Translate client-side instead
    # detect_language,  # Commented out - Using Google Translate client-side instead
    # supported_languages  # Commented out - Using Google Translate client-side instead
)
from . import views
from .ai_classification_views import (
    classify_complaint_view,
    classify_batch_complaints_view,
    get_classification_info,
    auto_assign_complaint,
    health_check
)

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
    
    # Translation endpoints - Commented out - Using Google Translate client-side instead
    # path('translate/', translate_text, name='translate_text'),
    # path('detect-language/', detect_language, name='detect_language'),
    # path('supported-languages/', supported_languages, name='supported_languages'),
    
    # AI-powered endpoints
    path('ai/categorize/', views.categorize_complaint, name='categorize_complaint'),
    path('ai/create-smart/', views.create_smart_complaint, name='create_smart_complaint'),
    path('ai/train-model/', views.train_ai_model, name='train_ai_model'),
    path('ai/model-status/', views.ai_model_status, name='ai_model_status'),
    path('ai/available-staff/', views.get_available_staff, name='get_available_staff'),
    
    # New BERT/DistilBERT AI Classification endpoints
    path('ai/classify/', classify_complaint_view, name='classify_complaint'),
    path('ai/classify-batch/', classify_batch_complaints_view, name='classify_batch_complaints'),
    path('ai/classification-info/', get_classification_info, name='classification_info'),
    path('ai/<int:complaint_id>/auto-assign/', auto_assign_complaint, name='auto_assign_complaint'),
    path('ai/health/', health_check, name='ai_health_check'),
    
    # Staff management endpoints
    path('staff/dashboard/', views.staff_dashboard, name='staff_dashboard'),
    path('staff/update-status/<int:complaint_id>/', views.update_complaint_status, name='update_complaint_status'),
    path('staff/resolve/<int:complaint_id>/', views.resolve_complaint, name='resolve_complaint'),
    
    # Public staff endpoints (for passengers to view staff)
    path('staff/', views.staff_list, name='staff-list'),
    path('staff/<int:pk>/', views.staff_detail, name='staff-detail'),
    path('staff/<int:staff_id>/analytics/', views.staff_analytics, name='staff-analytics'),
]
