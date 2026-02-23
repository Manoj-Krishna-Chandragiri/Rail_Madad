from django.contrib import admin
from .models import Complaint, Feedback, Staff, QuickSolution, SolutionApplication

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

class QuickSolutionAdmin(admin.ModelAdmin):
    list_display = ('problem', 'category', 'success_rate', 'usage_count', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('problem', 'category')
    readonly_fields = ('usage_count', 'created_at', 'updated_at')

class SolutionApplicationAdmin(admin.ModelAdmin):
    list_display = ('solution', 'result', 'applied_by', 'applied_at')
    list_filter = ('result', 'applied_at')
    search_fields = ('solution__problem', 'applied_by', 'feedback')
    readonly_fields = ('applied_at',)

admin.site.register(Complaint, ComplaintAdmin)
admin.site.register(Feedback, FeedbackAdmin)
admin.site.register(Staff, StaffAdmin)
admin.site.register(QuickSolution, QuickSolutionAdmin)
admin.site.register(SolutionApplication, SolutionApplicationAdmin)

