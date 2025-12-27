"""Test the profile endpoint directly"""
import requests

url = "http://localhost:8000/api/accounts/profile/"
headers = {
    "Authorization": "Bearer fake-token-for-dev",
    "X-Dev-User-Email": "manojkrishnachandragiri@gmail.com"
}

print(f"Testing: {url}")
print(f"Headers: {headers}")
print("-" * 50)

try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
