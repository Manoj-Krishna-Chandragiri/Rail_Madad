import os

# Create media and complaints directories
media_path = os.path.join(os.path.dirname(__file__), 'media')
complaints_path = os.path.join(media_path, 'complaints')

os.makedirs(complaints_path, exist_ok=True)
print(f"Created directories:\n{media_path}\n{complaints_path}")
