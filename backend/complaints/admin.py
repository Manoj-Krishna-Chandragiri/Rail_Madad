from django.contrib import admin
from .models import Complaint, Feedback, Staff

class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'status', 'severity', 'date_of_incident')
    list_filter = ('status', 'severity', 'type')
    search_fields = ('description', 'train_number', 'pnr_number')

class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('name', 'complaint_id', 'rating', 'submitted_at')
    list_filter = ('rating',)
    search_fields = ('name', 'email', 'complaint_id')

class StaffAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'department', 'status')
    list_filter = ('department', 'role', 'status')
    search_fields = ('name', 'email', 'phone')

admin.site.register(Complaint, ComplaintAdmin)
admin.site.register(Feedback, FeedbackAdmin)
admin.site.register(Staff, StaffAdmin)
