import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import FirebaseUser

# Update the email
user = FirebaseUser.objects.get(email='manojkrishnachandragiri@gmail.com')
print(f"Current email: {user.email}")
user.email = 'chandragirimanojkrishna@gmail.com'
user.save()
print(f"Updated email to: {user.email}")
print("SUCCESS! User email has been updated in the database.")
