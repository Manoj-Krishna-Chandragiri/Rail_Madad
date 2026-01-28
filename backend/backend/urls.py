from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/complaints/", include("complaints.urls")),
    path('api/accounts/', include('accounts.urls')),
    # Explicitly serve media files
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

print(f"[URLS] Media files will be served from: {settings.MEDIA_ROOT}")
print(f"[URLS] Media URL pattern added: /media/")