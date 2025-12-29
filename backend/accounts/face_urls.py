"""
URL patterns for Facial Authentication API
"""
from django.urls import path
from . import face_views

urlpatterns = [
    # Face enrollment
    path('face-profile/enroll/', face_views.enroll_face, name='face-enroll'),
    path('face-profile/status/', face_views.face_profile_status, name='face-profile-status'),
    path('face-profile/remove/', face_views.remove_face_profile, name='face-profile-remove'),
    path('face-profile/update/', face_views.update_face_profile, name='face-profile-update'),
    
    # Face authentication
    path('face-auth/login/', face_views.face_auth_login, name='face-auth-login'),
    path('face-auth/logs/', face_views.face_auth_logs, name='face-auth-logs'),
]
