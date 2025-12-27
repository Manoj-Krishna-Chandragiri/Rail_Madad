"""Generate a fake Firebase JWT token for testing"""
import jwt
import time

# Create a fake Firebase token payload
payload = {
    'email': 'manojkrishnachandragiri@gmail.com',
    'uid': '7NvmGiBdysY7abCdtDJXkuzXZcO2',
    'user_id': '7NvmGiBdysY7abCdtDJXkuzXZcO2',
    'iat': int(time.time()),
    'exp': int(time.time()) + 3600,
}

# Create a token (signature doesn't matter since we won't verify it in dev)
token = jwt.encode(payload, 'fake-secret', algorithm='HS256')
print("Fake Firebase Token:")
print(token)
print("\nTest with:")
print(f'curl -H "Authorization: Bearer {token}" http://localhost:8000/api/accounts/profile/')
