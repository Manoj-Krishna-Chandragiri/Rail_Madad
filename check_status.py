import os
import sys

sys.path.insert(0, 'D:/Projects/Rail_Madad/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from complaints.models import Complaint

print('Total complaints:', Complaint.objects.count())
print('\nUnique status values in DB:')
statuses = Complaint.objects.values_list('status', flat=True).distinct()
for s in statuses:
    count = Complaint.objects.filter(status=s).count()
    print(f'  "{s}": {count} complaints')

print('\nSample complaints with status:')
for c in Complaint.objects.all()[:5]:
    print(f'  ID {c.id}: status="{c.status}"')
